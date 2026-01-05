import { Router } from "express";
import fs from "fs";
import csv from "csv-parser";
import prisma from "../config/db";
import { upload } from "../middleware/upload";

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

          await prisma.transactions.createMany({
            data: rows,
          });

          fs.unlinkSync(req.file!.path);

          res.json({
            message: `Uploaded ${rows.length} transactions successfully`,
          });
        } catch (error) {
          fs.unlinkSync(req.file!.path);
          res.status(500).json({ message: "Database error" });
        }
      })
      .on("error", () => {
        fs.unlinkSync(req.file!.path);
        res.status(500).json({ message: "CSV parsing error" });
      });
  } catch (error) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "File processing failed" });
  }
});

export default router;
