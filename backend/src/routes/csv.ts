// backend/src/routes/csv.ts
import { Router } from "express";
import fs from "fs";
import csv from "csv-parser";
import prisma from "../config/db";
import { upload } from "../middleware/upload";
import { aiLabelingService } from "../services/aiLabelingService";

const router = Router();

router.post("/upload-csv", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "CSV file required" });
  }

  const rows: {
    remarks: string | null;
    amountPlus: number;
    amountMinus: number;
    balance: number;
  }[] = [];

  const REQUIRED_HEADERS = [
    "Remarks",
    "Amount(+) Rs",
    "Amount(-) Rs",
    "Balance",
  ];

  const safeParse = (value: any) =>
    parseFloat(String(value || "0").replace(/[,₹\s]/g, ""));

  let headersValidated = false;

  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("headers", (headers) => {
        const missing = REQUIRED_HEADERS.filter(
          (h) => !headers.includes(h)
        );

        if (missing.length) {
          fs.unlinkSync(req.file!.path);
          return res.status(400).json({
            message: `Missing required columns: ${missing.join(", ")}`,
          });
        }

        headersValidated = true;
      })
      .on("data", (row) => {
        if (!headersValidated) return;

        const amountPlus = safeParse(row["Amount(+) Rs"]);
        const amountMinus = safeParse(row["Amount(-) Rs"]);
        const balance = safeParse(row["Balance"]);

        if (isNaN(balance)) return;

        rows.push({
          remarks: row["Remarks"]?.trim() || null,
          amountPlus: isNaN(amountPlus) ? 0 : amountPlus,
          amountMinus: isNaN(amountMinus) ? 0 : amountMinus,
          balance,
        });
      })
      .on("end", async () => {
        try {
          if (!rows.length) {
            fs.unlinkSync(req.file!.path);
            return res
              .status(400)
              .json({ message: "No valid rows found in CSV" });
          }

          // Save transactions to database
          await prisma.transactions.createMany({
            data: rows,
          });

          console.log(`✅ Uploaded ${rows.length} transactions`);

          // Clean up file
          fs.unlinkSync(req.file!.path);

          // Trigger AI labeling for expenses (async, don't wait)
          console.log("🤖 Starting AI labeling...");
          
          // Run in background - don't await to avoid timeout
          aiLabelingService.labelUserTransactions()
            .then(() => {
              console.log("✅ AI labeling completed successfully");
            })
            .catch((error) => {
              console.error("❌ Auto-labeling failed:", error);
            });

          // Send response immediately
          res.json({
            message: `Uploaded ${rows.length} transactions successfully. AI labeling in progress...`,
            count: rows.length
          });
          
        } catch (error) {
          console.error("Database error:", error);
          fs.unlinkSync(req.file!.path);
          res.status(500).json({ message: "Database error" });
        }
      })
      .on("error", (error) => {
        console.error("CSV parsing error:", error);
        fs.unlinkSync(req.file!.path);
        res.status(500).json({ message: "CSV parsing error" });
      });
  } catch (error) {
    console.error("File processing failed:", error);
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "File processing failed" });
  }
});

// New endpoint to check labeling status
router.get("/labeling-stats", async (req, res) => {
  try {
    const stats = await aiLabelingService.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Error fetching labeling stats" });
  }
});

// Test Python connection
router.get("/test-python", async (req, res) => {
  try {
    const isWorking = await aiLabelingService.testPythonConnection();
    res.json({ 
      success: isWorking,
      message: isWorking 
        ? "Python integration is working correctly!" 
        : "Python integration failed. Check server logs."
    });
  } catch (error) {
    console.error("Python test error:", error);
    res.status(500).json({ 
      success: false,
      message: "Python test failed",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Debug: Test prediction on a specific remark
router.post("/debug-predict", async (req, res) => {
  try {
    const { remark } = req.body;
    
    if (!remark) {
      return res.status(400).json({ error: "remark is required" });
    }

    console.log(`\n🔍 Debug prediction for: "${remark}"`);
    
    // Get prediction using the service (this will show detailed logs)
    const aiLabelingService = (await import("../services/aiLabelingService")).aiLabelingService;
    const prediction = await (aiLabelingService as any).getPrediction(remark);
    
    res.json({
      remark,
      prediction,
      success: true
    });
  } catch (error) {
    console.error("Debug prediction error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Manually trigger labeling for all unlabeled transactions
router.post("/label-transactions", async (req, res) => {
  try {
    // Don't await - run in background
    aiLabelingService.labelUserTransactions()
      .then(() => console.log("✅ Manual labeling completed"))
      .catch(err => console.error("❌ Manual labeling failed:", err));
    
    res.json({ 
      message: "Labeling started in background. Check /labeling-stats for progress." 
    });
  } catch (error) {
    console.error("Error starting labeling:", error);
    res.status(500).json({ message: "Error starting labeling process" });
  }
});

export default router;