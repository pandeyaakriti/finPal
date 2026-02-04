// backend/src/routes/networth.ts
import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  try {
    // TEMP response so frontend works
    res.json({
      summary: {
        currentMonth: "February",
        totalIncome: 80000,
        totalExpenses: 52000,
        netSavings: 28000,
        savingsRate: 35,
      },
      predictions: [],
      insights: {
        spendingTrends: [],
        incomeStability: "Stable",
        riskFactors: [],
        opportunities: [],
      },
      categoryBreakdown: [],
      monthlyTrend: [],
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to calculate net worth" });
  }
});

export default router;
