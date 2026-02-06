// backend/src/routes/budgets.ts
import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Category mapping for transaction labels to budget categories
const CATEGORY_MAPPING: { [key: string]: string } = {
  // Food & Dining
  'food': 'Food & Dining',
  'dining': 'Food & Dining',
  'restaurant': 'Food & Dining',
  'groceries': 'Food & Dining',
  'cafe': 'Food & Dining',
  
  // Transportation
  'transport': 'Transportation',
  'transportation': 'Transportation',
  'taxi': 'Transportation',
  'fuel': 'Transportation',
  'gas': 'Transportation',
  'vehicle': 'Transportation',
  'parking': 'Transportation',
  
  // Shopping
  'shopping': 'Shopping',
  'retail': 'Shopping',
  'clothes': 'Shopping',
  'electronics': 'Shopping',
  
  // Entertainment
  'entertainment': 'Entertainment',
  'movie': 'Entertainment',
  'games': 'Entertainment',
  'hobby': 'Entertainment',
  'sports': 'Entertainment',
  
  // Bills & Utilities
  'bills': 'Bills & Utilities',
  'utilities': 'Bills & Utilities',
  'electricity': 'Bills & Utilities',
  'water': 'Bills & Utilities',
  'internet': 'Bills & Utilities',
  'phone': 'Bills & Utilities',
  'rent': 'Bills & Utilities',
  
  // Healthcare
  'healthcare': 'Healthcare',
  'health': 'Healthcare',
  'medical': 'Healthcare',
  'pharmacy': 'Healthcare',
  'doctor': 'Healthcare',
  'hospital': 'Healthcare',
};

// Helper function to map transaction label to budget category
function mapLabelToCategory(label: string | null): string {
  if (!label) return 'Other';
  
  const lowerLabel = label.toLowerCase();
  
  // Check for exact or partial matches
  for (const [key, category] of Object.entries(CATEGORY_MAPPING)) {
    if (lowerLabel.includes(key)) {
      return category;
    }
  }
  
  return 'Other';
}

// GET all budgets for logged-in user
router.get("/", authMiddleware, async (req: any, res: Response) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId },
      orderBy: { category: "asc" },
    });
    
    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

// POST create or update budget for a category
router.post("/", authMiddleware, async (req: any, res: Response) => {
  try {
    const { category, targetAmount } = req.body;
    
    if (!category || targetAmount === undefined) {
      return res.status(400).json({ detail: "Category and targetAmount are required" });
    }
    
    const budget = await prisma.budget.upsert({
      where: {
        userId_category: {
          userId: req.userId,
          category,
        },
      },
      update: {
        targetAmount: parseFloat(targetAmount),
      },
      create: {
        userId: req.userId,
        category,
        targetAmount: parseFloat(targetAmount),
      },
    });
    
    res.json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

// POST bulk update budgets
router.post("/bulk", authMiddleware, async (req: any, res: Response) => {
  try {
    const { budgets } = req.body;
    
    if (!Array.isArray(budgets)) {
      return res.status(400).json({ detail: "budgets must be an array" });
    }
    
    const operations = budgets.map((budget) => 
      prisma.budget.upsert({
        where: {
          userId_category: {
            userId: req.userId,
            category: budget.category,
          },
        },
        update: {
          targetAmount: parseFloat(budget.targetAmount),
        },
        create: {
          userId: req.userId,
          category: budget.category,
          targetAmount: parseFloat(budget.targetAmount),
        },
      })
    );
    
    const result = await prisma.$transaction(operations);
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

// GET budget analytics for current month
router.get("/analytics/current", authMiddleware, async (req: any, res: Response) => {
  try {
    // Get start and end of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Get user's budgets
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId },
    });
    
    // Get transactions for current month
    const transactions = await prisma.transactions.findMany({
      where: {
        userId: req.userId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
    
    // Calculate spending per category
    const categorySpending: { [key: string]: number } = {};
    
    transactions.forEach((transaction) => {
      // Use corrected label if available, otherwise use predicted label
      const label = transaction.correctedLabel || transaction.predictedLabel;
      const category = mapLabelToCategory(label);
      
      // Only count expenses (amountMinus)
      if (transaction.amountMinus > 0) {
        categorySpending[category] = (categorySpending[category] || 0) + transaction.amountMinus;
      }
    });
    
    // Combine budgets with actual spending
    const budgetAnalytics = budgets.map((budget) => ({
      category: budget.category,
      budget: budget.targetAmount,
      spent: categorySpending[budget.category] || 0,
      remaining: budget.targetAmount - (categorySpending[budget.category] || 0),
      percentageUsed: ((categorySpending[budget.category] || 0) / budget.targetAmount) * 100,
    }));
    
    res.json(budgetAnalytics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

// GET budget analytics for last N months
router.get("/analytics/monthly/:months", authMiddleware, async (req: any, res: Response) => {
  try {
    const months = parseInt(req.params.months) || 6;
    
    const now = new Date();
    const monthlyData = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
      
      // Get budgets for this period (use latest budget)
      const budgets = await prisma.budget.findMany({
        where: { 
          userId: req.userId,
          createdAt: { lte: endOfMonth },
        },
      });
      
      const totalBudget = budgets.reduce((sum, b) => sum + b.targetAmount, 0);
      
      // Get transactions for this month
      const transactions = await prisma.transactions.findMany({
        where: {
          userId: req.userId,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
      
      const totalSpent = transactions.reduce((sum, t) => sum + t.amountMinus, 0);
      const totalIncome = transactions.reduce((sum, t) => sum + t.amountPlus, 0);
      
      monthlyData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        budgeted: totalBudget,
        spent: totalSpent,
        saved: totalBudget - totalSpent,
        income: totalIncome,
      });
    }
    
    res.json(monthlyData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

// GET yearly budget analytics
router.get("/analytics/yearly", authMiddleware, async (req: any, res: Response) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    
    const yearlyData = [];
    
    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(now.getFullYear(), month, 1);
      const endOfMonth = new Date(now.getFullYear(), month + 1, 0, 23, 59, 59);
      
      // Get budgets
      const budgets = await prisma.budget.findMany({
        where: { 
          userId: req.userId,
          createdAt: { lte: endOfMonth },
        },
      });
      
      const totalBudget = budgets.reduce((sum, b) => sum + b.targetAmount, 0);
      
      // Get transactions
      const transactions = await prisma.transactions.findMany({
        where: {
          userId: req.userId,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
      
      const totalSpent = transactions.reduce((sum, t) => sum + t.amountMinus, 0);
      
      yearlyData.push({
        month: new Date(now.getFullYear(), month, 1).toLocaleDateString('en-US', { month: 'short' }),
        budget: totalBudget,
        actual: totalSpent,
      });
    }
    
    res.json(yearlyData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

// DELETE budget
router.delete("/:id", authMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.budget.delete({
      where: { 
        id: parseInt(id),
        userId: req.userId,
      },
    });
    
    res.json({ message: "Budget deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
});

export default router;