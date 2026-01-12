// backend/src/routes/aiLabeling.ts
import { Router, Request, Response } from "express";
import { aiLabelingService } from "../services/aiLabelingService";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/ai-labeling/label-all
 * Label all unlabeled expense transactions
 */
router.post("/label-all", async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || 1; // Get from auth middleware
    
    await aiLabelingService.labelUserTransactions(userId);
    
    res.json({ 
      success: true,
      message: "All transactions labeled successfully" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to label transactions",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/ai-labeling/label-single/:id
 * Label a single transaction
 */
router.post("/label-single/:id", async (req: Request, res: Response) => {
  try {
    const transactionId = parseInt(req.params.id);
    
    await aiLabelingService.labelSingleTransaction(transactionId);
    
    // Get updated transaction
    const transaction = await prisma.transactions.findUnique({
      where: { id: transactionId }
    });
    
    res.json({ 
      success: true,
      transaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to label transaction",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * PUT /api/ai-labeling/correct/:id
 * Correct a prediction
 */
router.put("/correct/:id", async (req: Request, res: Response) => {
  try {
    const transactionId = parseInt(req.params.id);
    const { correctedCategoryId } = req.body;
    
    if (correctedCategoryId === undefined) {
      return res.status(400).json({ error: "correctedCategoryId is required" });
    }
    
    await aiLabelingService.correctPrediction(transactionId, correctedCategoryId);
    
    // Get updated transaction
    const transaction = await prisma.transactions.findUnique({
      where: { id: transactionId }
    });
    
    res.json({ 
      success: true,
      message: "Correction recorded successfully",
      transaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to record correction",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/ai-labeling/stats
 * Get labeling statistics
 */
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const stats = await aiLabelingService.getStats();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to get stats",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/ai-labeling/export-corrections
 * Export corrections as CSV for retraining
 */
router.get("/export-corrections", async (req: Request, res: Response) => {
  try {
    const csv = await aiLabelingService.exportCorrectionsToCSV();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=corrections.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to export corrections",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/ai-labeling/transactions
 * Get all transactions with their labels
 */
router.get("/transactions", async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, onlyExpenses = true } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where = onlyExpenses === 'true' 
      ? { amountMinus: { gt: 0 } }
      : {};
    
    const transactions = await prisma.transactions.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.transactions.count({ where });
    
    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to fetch transactions",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;