import { Router } from "express";
import prisma from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();

/**
 * 1️⃣ GET ALL TRANSACTIONS (date-wise)
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

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
    const userId = req.user?.id;
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
        balance: 0, // You can calculate this based on your logic
        
        // For manual entries, there's no AI prediction
        predicted: null,
        predictedLabel: null,
        
        // Manual entries go directly to corrected with 100% confidence
        corrected: null, // You can add category IDs if needed
        correctedLabel: type === "EXPENSE" ? categoryLabel : null,
        
        confidence: 1.0, // 100% confidence for manual entries
        source: "MANUAL"
      }
    });

    res.json(transaction);
  } catch (err) {
    console.error("Error creating manual transaction:", err);
    res.status(500).json({ error: "Failed to add manual transaction" });
  }
});

/**
 * 3️⃣ CORRECT AI PREDICTION
 */
router.patch("/:id/correct", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
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

    // Update transaction with corrected category and set confidence to 100%
    const updated = await prisma.transactions.update({
      where: { id: transactionId },
      data: {
        corrected: transaction.predicted, // Keep the original prediction ID
        correctedLabel: correctedLabel,
        confidence: 1.0 // Set to 100% after user correction
      }
    });

    // Store feedback for retraining only if there was an AI prediction
    if (transaction.predicted !== null) {
      await prisma.feedback.create({
        data: {
          text: transaction.remarks ?? "",
          predicted: transaction.predicted,
          corrected: transaction.predicted, // Using the same ID since we don't have category IDs
          confidence: transaction.confidence ?? 0
        }
      });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error correcting transaction:", err);
    res.status(500).json({ error: "Failed to correct transaction" });
  }
});

/**
 * 4️⃣ DELETE TRANSACTION (Optional - for better UX)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
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