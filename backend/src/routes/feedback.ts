import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/feedback/manual
 * Save feedback from manual predictions (predict.py)
 */
router.post("/manual", async (req: Request, res: Response) => {
  try {
    const { text, predicted, corrected, confidence } = req.body;

    if (!text || predicted === undefined || corrected === undefined) {
      return res.status(400).json({ 
        error: "text, predicted, and corrected are required" 
      });
    }

    await prisma.feedback.create({
      data: {
        text,
        predicted: parseInt(predicted),
        corrected: parseInt(corrected),
        confidence: confidence || 0
      }
    });

    res.json({ 
      success: true,
      message: "Feedback recorded successfully" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Failed to record feedback",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;