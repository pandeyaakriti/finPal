import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Get all AI-labeled expense transactions for charts
router.get("/", authMiddleware, async (req: any, res) => {
  try {
    const data = await prisma.transactions.findMany({
      where: {
        amountMinus: { gt: 0 },
        predictedLabel: { not: null }
      },
      select: {
        amountMinus: true,
        predictedLabel: true,
        createdAt: true
      }
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

export default router;
