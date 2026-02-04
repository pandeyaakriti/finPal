import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Get all expense transactions for charts (filtered by user)
router.get("/", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const data = await prisma.transactions.findMany({
      where: {
        userId: userId,
        amountMinus: { gt: 0 }
      },
      select: {
        amountMinus: true,
        predictedLabel: true,
        correctedLabel: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Map data to use correctedLabel if available, otherwise predictedLabel
    const formattedData = data.map(transaction => ({
      amountMinus: transaction.amountMinus,
      predictedLabel: transaction.correctedLabel || transaction.predictedLabel || 'Uncategorized',
      createdAt: transaction.createdAt
    }));

    res.json(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions for charts" });
  }
});

export default router;