import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  netSavings: number;
  savingsRate: number;
}

interface ForecastResult {
  summary: {
    currentMonth: string;
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
  };
  predictions: {
    month: string;
    predictedIncome: number;
    predictedExpenses: number;
    predictedSavings: number;
    savingsRate: number;
    healthScore: number;
    trend: "improving" | "stable" | "declining";
    alerts: string[];
    recommendations: string[];
  }[];
  insights: {
    spendingTrends: string[];
    incomeStability: string;
    riskFactors: string[];
    opportunities: string[];
  };
  categoryBreakdown: {
    name: string;
    value: number;
    color: string;
  }[];
  monthlyTrend: {
    month: string;
    actual: number;
    predicted: number;
  }[];
}

// Simple Linear Regression
// Returns slope and intercept for y = mx + b
function linearRegression(xValues: number[], yValues: number[]): { slope: number; intercept: number } {
  const n = xValues.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n || 0;

  return { slope, intercept };
}
 //Get last 6 months of aggregated financial data
async function getLast6Months(userId: number): Promise<MonthlyData[]> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const transactions = await prisma.transactions.findMany({
    where: {
      userId,
      createdAt: { gte: sixMonthsAgo },
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by month
  const monthlyMap = new Map<string, { income: number; expenses: number }>();

  transactions.forEach((tx) => {
    const monthKey = new Date(tx.createdAt).toISOString().slice(0, 7); // YYYY-MM
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { income: 0, expenses: 0 });
    }

    const monthData = monthlyMap.get(monthKey)!;
    
    if (tx.amountPlus > 0) {
      monthData.income += tx.amountPlus;
    }
    if (tx.amountMinus > 0) {
      monthData.expenses += tx.amountMinus;
    }
  });

  // Convert to array and calculate metrics
  const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries())
    .map(([month, data]) => {
      const netSavings = data.income - data.expenses;
      const savingsRate = data.income > 0 ? (netSavings / data.income) * 100 : 0;
      
      return {
        month,
        income: data.income,
        expenses: data.expenses,
        netSavings,
        savingsRate,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  return monthlyData;
}

//Forecast next 3 months using linear regression
function forecastNext3Months(historicalData: MonthlyData[]): MonthlyData[] {
  if (historicalData.length === 0) {
    return [];
  }

  const xValues = historicalData.map((_, i) => i);
  const incomeValues = historicalData.map((d) => d.income);
  const expenseValues = historicalData.map((d) => d.expenses);

  const incomeRegression = linearRegression(xValues, incomeValues);
  const expenseRegression = linearRegression(xValues, expenseValues);

  const lastMonth = new Date(historicalData[historicalData.length - 1].month);
  const forecasts: MonthlyData[] = [];

  for (let i = 1; i <= 3; i++) {
    const futureMonth = new Date(lastMonth);
    futureMonth.setMonth(futureMonth.getMonth() + i);
    const monthStr = futureMonth.toISOString().slice(0, 7);

    const xFuture = historicalData.length + i - 1;
    const predictedIncome = Math.max(0, incomeRegression.slope * xFuture + incomeRegression.intercept);
    const predictedExpenses = Math.max(0, expenseRegression.slope * xFuture + expenseRegression.intercept);

    const netSavings = predictedIncome - predictedExpenses;
    const savingsRate = predictedIncome > 0 ? (netSavings / predictedIncome) * 100 : 0;

    forecasts.push({
      month: monthStr,
      income: predictedIncome,
      expenses: predictedExpenses,
      netSavings,
      savingsRate,
    });
  }

  return forecasts;
}


// Calculate health score (0-100)
function calculateHealthScore(data: MonthlyData): number {
  let score = 50; // baseline

  // Savings rate impact (0-40 points)
  if (data.savingsRate >= 30) score += 40;
  else if (data.savingsRate >= 20) score += 30;
  else if (data.savingsRate >= 10) score += 20;
  else if (data.savingsRate >= 0) score += 10;
  else score -= 20; // negative savings

  // Income stability (0-20 points)
  if (data.income > 0) score += 20;
  else score -= 10;

  // Expense control (0-20 points)
  const expenseRatio = data.income > 0 ? data.expenses / data.income : 1;
  if (expenseRatio <= 0.7) score += 20;
  else if (expenseRatio <= 0.8) score += 15;
  else if (expenseRatio <= 0.9) score += 10;
  else if (expenseRatio <= 1.0) score += 5;

  return Math.min(100, Math.max(0, score));
}

// Determine trend based on recent months
function determineTrend(monthlyData: MonthlyData[]): "improving" | "stable" | "declining" {
  if (monthlyData.length < 2) return "stable";

  const recent = monthlyData.slice(-3);
  const savingsRates = recent.map((d) => d.savingsRate);

  const avgChange = (savingsRates[savingsRates.length - 1] - savingsRates[0]) / savingsRates.length;

  if (avgChange > 2) return "improving";
  if (avgChange < -2) return "declining";
  return "stable";
}

// Generate alerts based on forecast
function generateAlerts(forecast: MonthlyData, historical: MonthlyData[]): string[] {
  const alerts: string[] = [];

  if (forecast.netSavings < 0) {
    alerts.push("Predicted deficit: Expenses may exceed income");
  }

  if (forecast.savingsRate < 5 && forecast.savingsRate >= 0) {
    alerts.push("Low savings rate: Less than 5% of income being saved");
  }

  const avgHistoricalExpenses = historical.reduce((sum, d) => sum + d.expenses, 0) / historical.length;
  const expenseIncrease = ((forecast.expenses - avgHistoricalExpenses) / avgHistoricalExpenses) * 100;

  if (expenseIncrease > 15) {
    alerts.push(`Expenses trending up ${expenseIncrease.toFixed(1)}% above average`);
  }

  return alerts;
}

// Generate recommendations based on forecast and trends
function generateRecommendations(forecast: MonthlyData, historical: MonthlyData[]): string[] {
  const recs: string[] = [];

  if (forecast.savingsRate < 15) {
    recs.push("Aim to save at least 15-20% of your income");
  }

  if (forecast.netSavings < 0) {
    recs.push("Review and reduce discretionary expenses");
  }

  const trend = determineTrend([...historical, forecast]);
  if (trend === "declining") {
    recs.push("Consider creating a stricter budget to reverse the declining trend");
  }

  if (forecast.savingsRate >= 20) {
    recs.push("Strong savings rate! Consider investing surplus funds");
  }

  return recs;
}


//  Generate category breakdown
async function getCategoryBreakdown(userId: number): Promise<{ name: string; value: number; color: string }[]> {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const transactions = await prisma.transactions.findMany({
    where: {
      userId,
      amountMinus: { gt: 0 },
      createdAt: { gte: oneMonthAgo },
    },
  });

  const categoryMap = new Map<string, number>();

  transactions.forEach((tx) => {
    const category = tx.correctedLabel || tx.predictedLabel || "Uncategorized";
    categoryMap.set(category, (categoryMap.get(category) || 0) + tx.amountMinus);
  });

  const colors = ['#7AD1A6', '#90A1B9', '#5B6F70', '#A8C5DD', '#6B8E9F', '#8BBDAB', '#B0BEC5'];
  
  return Array.from(categoryMap.entries())
    .map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);
}

//  Generate insights
function generateInsights(historical: MonthlyData[], forecasts: MonthlyData[]): {
  spendingTrends: string[];
  incomeStability: string;
  riskFactors: string[];
  opportunities: string[];
} {
  const spendingTrends: string[] = [];
  const riskFactors: string[] = [];
  const opportunities: string[] = [];

  // Spending trends
  const avgExpenses = historical.reduce((sum, d) => sum + d.expenses, 0) / historical.length;
  const recentExpenses = historical.slice(-2).reduce((sum, d) => sum + d.expenses, 0) / 2;
  const expenseChange = ((recentExpenses - avgExpenses) / avgExpenses) * 100;

  if (Math.abs(expenseChange) < 5) {
    spendingTrends.push("Expenses are relatively stable");
  } else if (expenseChange > 0) {
    spendingTrends.push(`Expenses increased by ${expenseChange.toFixed(1)}% recently`);
  } else {
    spendingTrends.push(`Expenses decreased by ${Math.abs(expenseChange).toFixed(1)}% recently`);
  }

  // Income stability
  const incomeStdDev = Math.sqrt(
    historical.reduce((sum, d) => {
      const avgIncome = historical.reduce((s, h) => s + h.income, 0) / historical.length;
      return sum + Math.pow(d.income - avgIncome, 2);
    }, 0) / historical.length
  );
  const avgIncome = historical.reduce((sum, d) => sum + d.income, 0) / historical.length;
  const coefficientOfVariation = avgIncome > 0 ? (incomeStdDev / avgIncome) * 100 : 0;

  let incomeStability = "Income appears stable";
  if (coefficientOfVariation > 30) {
    incomeStability = "Income shows high variability - consider building emergency fund";
    riskFactors.push("Irregular income pattern detected");
  } else if (coefficientOfVariation > 15) {
    incomeStability = "Income shows moderate variability";
  }

  // Risk factors
  const avgSavingsRate = historical.reduce((sum, d) => sum + d.savingsRate, 0) / historical.length;
  if (avgSavingsRate < 10) {
    riskFactors.push("Low average savings rate over past 6 months");
  }

  if (forecasts.some(f => f.netSavings < 0)) {
    riskFactors.push("Predicted deficit in upcoming months");
  }

  // Opportunities
  if (avgSavingsRate >= 15) {
    opportunities.push("Strong savings habit - explore investment options");
  }

  const trend = determineTrend(historical);
  if (trend === "improving") {
    opportunities.push("Positive financial momentum - maintain the trend");
  }

  if (riskFactors.length === 0) {
    opportunities.push("Financial health is solid - focus on long-term goals");
  }

  return {
    spendingTrends,
    incomeStability,
    riskFactors: riskFactors.length > 0 ? riskFactors : ["No significant risks detected"],
    opportunities: opportunities.length > 0 ? opportunities : ["Continue monitoring your finances"],
  };
}

//  Main forecast function

export async function generateFinancialForecast(userId: number): Promise<ForecastResult> {
  // Get historical data
  const historical = await getLast6Months(userId);

  if (historical.length === 0) {
    throw new Error("Insufficient data: Please add at least 1 month of transactions");
  }

  // Generate forecasts
  const forecasts = forecastNext3Months(historical);

  // Get current month summary
  const currentMonth = historical[historical.length - 1];
  
  const summary = {
    currentMonth: currentMonth.month,
    totalIncome: currentMonth.income,
    totalExpenses: currentMonth.expenses,
    netSavings: currentMonth.netSavings,
    savingsRate: currentMonth.savingsRate,
  };

  // Build predictions
  const predictions = forecasts.map((forecast) => ({
    month: forecast.month,
    predictedIncome: Math.round(forecast.income),
    predictedExpenses: Math.round(forecast.expenses),
    predictedSavings: Math.round(forecast.netSavings),
    savingsRate: forecast.savingsRate,
    healthScore: calculateHealthScore(forecast),
    trend: determineTrend([...historical, forecast]),
    alerts: generateAlerts(forecast, historical),
    recommendations: generateRecommendations(forecast, historical),
  }));

  // Get category breakdown
  const categoryBreakdown = await getCategoryBreakdown(userId);

  // Build monthly trend (combining historical + forecast)
  const monthlyTrend = [
    ...historical.slice(-3).map(h => ({
      month: h.month,
      actual: Math.round(h.expenses),
      predicted: Math.round(h.expenses),
    })),
    ...forecasts.map(f => ({
      month: f.month,
      actual: 0,
      predicted: Math.round(f.expenses),
    })),
  ];

  // Generate insights
  const insights = generateInsights(historical, forecasts);

  return {
    summary,
    predictions,
    insights,
    categoryBreakdown,
    monthlyTrend,
  };
}