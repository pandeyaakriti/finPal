// backend/src/routes/income.ts
import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// GET all income for logged-in user
router.get("/", authMiddleware, async (req: any, res: Response) => {
  try {
    const incomes = await prisma.income.findMany({
      where: { userId: req.userId },
      orderBy: { date: "desc" },
    });
    res.json(incomes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

// POST create new income
router.post("/", authMiddleware, async (req: any, res: Response) => {
  try {
    const { amount, source, remark, date } = req.body;
    
    const income = await prisma.income.create({
      data: {
        userId: req.userId,
        amount: parseFloat(amount),
        source,
        remark,
        date: date ? new Date(date) : new Date(),
      },
    });
    
    res.json(income);
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

// DELETE income
router.delete("/:id", authMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.income.delete({
      where: { 
        id: parseInt(id),
        userId: req.userId,
      },
    });
    
    res.json({ message: "Income deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

export default router;