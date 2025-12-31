// backend/src/routes/expenses.ts
import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// GET all expenses for logged-in user
router.get("/", authMiddleware, async (req: any, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { userId: req.userId },
      orderBy: { date: "desc" },
    });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

// POST create new expense
router.post("/", authMiddleware, async (req: any, res: Response) => {
  try {
    const { amount, category, remark, date } = req.body;
    
    const expense = await prisma.expense.create({
      data: {
        userId: req.userId,
        amount: parseFloat(amount),
        category,
        remark,
        date: date ? new Date(date) : new Date(),
      },
    });
    
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

// DELETE expense
router.delete("/:id", authMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.expense.delete({
      where: { 
        id: parseInt(id),
        userId: req.userId, // Ensure user owns this expense
      },
    });
    
    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

export default router;