import { Router, Request } from "express";
import fs from "fs";
import csv from "csv-parser";
import prisma from "../config/db";
import { upload } from "../middleware/upload";
import { aiLabelingService } from "../services/aiLabelingService"; // Fixed import

declare global {
  namespace Express {
    interface Request {
      user?: { id: number };
    }
  }
}

const router = Router();



router.post("/upload-csv", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "CSV file required" });
  }
  const userId = (req as any).user?.id ?? 1;


  const rows: {
    userId: number;
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
          userId,
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
          try {
            console.log("🤖 Starting AI labeling...");
            // Run in background - don't await to avoid timeout
            aiLabelingService.labelUserTransactions(userId).then(() => {
              console.log("✅ AI labeling completed");
            }).catch((error) => {
              console.error("❌ Auto-labeling failed:", error);
            });
          } catch (error) {
            console.error("❌ Error starting auto-labeling:", error);
          }

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

export default router;