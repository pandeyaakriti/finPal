// backend/src/routes/income.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.post("/", authMiddleware, async (req: any, res) => {
  try {
    const { source, amount} = req.body;

    const income = await prisma.income.create({
      data: {
        userId: req.userId,
        source,
        amount,  
      },
    });

    res.json(income);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

router.get("/", authMiddleware, async (req: any, res) => {
  try {
    const income = await prisma.income.findMany({
      where: { userId: req.userId },
      orderBy: { date: "desc" },
    });

    res.json(income);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

export default router;
