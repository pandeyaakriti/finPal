import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { generateFinancialForecast } from "../services/forecastService";

const router = Router();

router.get("/financial-health", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const forecast = await generateFinancialForecast(userId);

    return res.status(200).json(forecast);
  } catch (error) {
    console.error("Forecast error:", error);
    
    if (error instanceof Error && error.message.includes("Insufficient data")) {
      return res.status(400).json({ 
        error: error.message,
        message: "Please add transactions covering at least one month to generate predictions"
      });
    }

    return res.status(500).json({ 
      error: "Failed to generate forecast",
      message: "An error occurred while analyzing your financial data"
    });
  }
});

export default router;