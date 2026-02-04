// backend/src/routes/transactions.ts
import { Router } from "express";
import prisma from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { checkAndTriggerRetraining } from "../services/retraining";

const router = Router();

/**
 * 1️⃣ GET ALL TRANSACTIONS (date-wise)
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const transactions = await prisma.transactions.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

/**
 * 2️⃣ MANUAL TRANSACTION ENTRY (cash etc.)
 */
router.post("/manual", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { amount, type, categoryLabel, remarks } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (type === "EXPENSE" && !categoryLabel) {
      return res.status(400).json({ error: "Category required for expenses" });
    }

    const transaction = await prisma.transactions.create({
      data: {
        userId: userId,
        remarks: remarks || null,
        amountPlus: type === "INCOME" ? parseFloat(amount) : 0,
        amountMinus: type === "EXPENSE" ? parseFloat(amount) : 0,
        balance: 0,
        
        predicted: null,
        predictedLabel: null,
        
        corrected: null,
        correctedLabel: type === "EXPENSE" ? categoryLabel : null,
        
        confidence: 1.0,
        source: "MANUAL",
        usedForTraining: false
      }
    });

    res.json(transaction);
  } catch (err) {
    console.error("Error creating manual transaction:", err);
    res.status(500).json({ error: "Failed to add manual transaction" });
  }
});

/**
 * 3️⃣ CORRECT AI PREDICTION - WITH AUTO RETRAINING CHECK
 */
router.patch("/:id/correct", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const transactionId = Number(req.params.id);
    const { correctedLabel } = req.body;

    // Validate
    if (!correctedLabel) {
      return res.status(400).json({ error: "Corrected label is required" });
    }

    // Find transaction
    const transaction = await prisma.transactions.findFirst({
      where: { 
        id: transactionId, 
        userId: userId 
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Update transaction with corrected category
    const updated = await prisma.transactions.update({
      where: { id: transactionId },
      data: {
        corrected: transaction.predicted,
        correctedLabel: correctedLabel,
        confidence: 1.0,
        usedForTraining: false  // Mark as not yet used for training
      }
    });

    // 🔥 CHECK IF WE SHOULD TRIGGER RETRAINING
    // This is the ONLY line added to your existing code!
    const retrainingResult = await checkAndTriggerRetraining();

    res.json({
      ...updated,
      retrainingTriggered: retrainingResult.triggered,
      retrainingJobId: retrainingResult.jobId
    });
  } catch (err) {
    console.error("Error correcting transaction:", err);
    res.status(500).json({ error: "Failed to correct transaction" });
  }
});

/**
 * 4️⃣ DELETE TRANSACTION
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const transactionId = Number(req.params.id);

    const transaction = await prisma.transactions.findFirst({
      where: { 
        id: transactionId, 
        userId: userId 
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    await prisma.transactions.delete({
      where: { id: transactionId }
    });

    res.json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

export default router;