// routes/expenses.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.post("/", authMiddleware, async (req: any, res) => {
  try {
    const { category, amount, remark } = req.body;

    const expense = await prisma.expense.create({
      data: {
        userId: req.userId,
        category,
        amount,
        remark
      },
    });

    res.json(expense);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

router.get("/", authMiddleware, async (req: any, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId },
      orderBy: { date: "desc" },
    });

    res.json(expenses);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

export default router;
