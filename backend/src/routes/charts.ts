import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

// Handler function moved above the route definition
const getExpenseTransactions = async (req: any, res: any) => {
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
        createdAt: "asc"
      }
    });
    const formattedData = data.map(transaction => ({
      amountMinus: transaction.amountMinus,
      predictedLabel:
        transaction.correctedLabel ||
        transaction.predictedLabel ||
        "Uncategorized",
      createdAt: transaction.createdAt
    }));

    res.json(formattedData);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to fetch transactions for charts" });
  }
};

// Route definition moved below
router.get("/", authMiddleware, getExpenseTransactions);

export default router;
