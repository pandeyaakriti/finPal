// backend/src/routes/csv.ts
import { Router, Request } from "express";
import fs from "fs";
import csv from "csv-parser";
import prisma from "../config/db";
import { upload } from "../middleware/upload";
import { authMiddleware } from "../middleware/auth";
import { aiLabelingService } from "../services/aiLabelingService"; // Fixed import

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}
const router = Router();
router.post("/upload-csv", authMiddleware, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "CSV file required" });
  }
  const userId = (req as any).userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized - User not authenticated" });
  }

   // Get the selected month from request body
  const uploadMonth = req.body.uploadMonth || null; // Format: "2024-12" or "2025-01" or null
  
  if (!uploadMonth || !/^\d{4}-\d{2}$/.test(uploadMonth)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ 
      message: "Valid upload month is required (format: YYYY-MM)" 
    });
  }

  const rows: {
    userId: number;
    remarks: string | null;
    amountPlus: number;
    amountMinus: number;
    balance: number;
    uploadMonth: string; // Store the month for which the transactions are uploaded
    createdAt: Date; // Store the original transaction date if available
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
    const [year, month] = uploadMonth.split('-'); // Extract year and month from the uploadMonth string
    const baseDate = new Date(parseInt(year), parseInt(month) - 1, 1);
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
        //set createdAt date based on row index to ensure unique dates for each transaction, while keeping them within the same month
        const dayOffset = rows.length % 28; // Stay within valid days
        const transactionDate = new Date(baseDate);
        transactionDate.setDate(dayOffset + 1);

        rows.push({
          userId,
          remarks: row["Remarks"]?.trim() || null,
          amountPlus: isNaN(amountPlus) ? 0 : amountPlus,
          amountMinus: isNaN(amountMinus) ? 0 : amountMinus,
          balance : balance,
          uploadMonth, 
          createdAt: transactionDate,
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
            count: rows.length,
            uploadMonth: uploadMonth
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