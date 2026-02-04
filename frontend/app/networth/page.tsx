'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Brain,
  Target,
  Activity,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PredictionData {
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

const COLORS = ['#7AD1A6', '#90A1B9', '#5B6F70', '#A8C5DD', '#6B8E9F', '#8BBDAB', '#B0BEC5'];

export default function NetWorthPage() {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/predict/financial-health", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to generate predictions");
      }

      const data = await response.json();
      setPredictions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while generating predictions");
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  const getTrendIcon = (trend: "improving" | "stable" | "declining") => {
    if (trend === "improving") return <ArrowUpRight className="w-5 h-5 text-green-600" />;
    if (trend === "declining") return <ArrowDownRight className="w-5 h-5 text-red-600" />;
    return <Activity className="w-5 h-5 text-yellow-600" />;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          {payload.map((entry: any, index: number) => (
            <div key={index}>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {entry.name}: NPR {entry.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-linear-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-[#7AD1A6] mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">Analyzing your financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex bg-linear-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Predictions</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button 
              onClick={fetchPredictions}
              className="px-6 py-3 bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!predictions) {
    return (
      <div className="min-h-screen flex bg-linear-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">No prediction data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-linear-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />
    
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Financial Health Predictions
                </h1>
              </div>
            </div>
            
            <button
              onClick={fetchPredictions}
              className="px-4 py-2 bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
          
          {/* Charts Row */}
          {predictions.categoryBreakdown && predictions.monthlyTrend && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown Pie Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 rounded-lg">
                    <PieChartIcon className="w-5 h-5 text-[#5B6F70]" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Expense Distribution
                  </h2>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={predictions.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {predictions.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {predictions.categoryBreakdown.map((category, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Trend Line Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-[#5B6F70]" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Predicted Spending
                  </h2>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictions.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6B7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#7AD1A6" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ fill: '#7AD1A6', r: 5 }}
                      name="Predicted Expenses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Monthly Predictions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#5B6F70]" />
              Networth Predictions ({predictions.predictions.length} months)
            </h2>
            <div className="space-y-6">
              {predictions.predictions.map((pred, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">{pred.month}</h3>
                      {getTrendIcon(pred.trend)}
                    </div>
                    <div className={`${getHealthBgColor(pred.healthScore)} px-4 py-2 rounded-xl`}>
                      <p className={`text-sm font-bold ${getHealthColor(pred.healthScore)}`}>
                        Health Score: {pred.healthScore}/100
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Predicted Income</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        NPR {pred.predictedIncome.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Predicted Expenses</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        NPR {pred.predictedExpenses.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Predicted Savings</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        NPR {pred.predictedSavings.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Savings Rate</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {pred.savingsRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {pred.alerts.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-3">
                      <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Alerts
                      </p>
                      <ul className="space-y-1">
                        {pred.alerts.map((alert, i) => (
                          <li key={i} className="text-sm text-yellow-700 dark:text-yellow-400 ml-6">
                            • {alert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pred.recommendations.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                      <p className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Recommendations
                      </p>
                      <ul className="space-y-1">
                        {pred.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-green-700 dark:text-green-400 ml-6">
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
              <Brain className="w-5 h-5 text-[#5B6F70]" />
              AI Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3">Spending Trends</h3>
                <ul className="space-y-2">
                  {predictions.insights.spendingTrends.map((trend, i) => (
                    <li key={i} className="text-sm text-blue-800 dark:text-blue-300">
                      • {trend}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
                <h3 className="font-bold text-green-900 dark:text-green-100 mb-3">Income Stability</h3>
                <p className="text-sm text-green-800 dark:text-green-300">{predictions.insights.incomeStability}</p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                <h3 className="font-bold text-red-900 dark:text-red-100 mb-3">Risk Factors</h3>
                <ul className="space-y-2">
                  {predictions.insights.riskFactors.map((risk, i) => (
                    <li key={i} className="text-sm text-red-800 dark:text-red-300">
                      • {risk}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6">
                <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-3">Opportunities</h3>
                <ul className="space-y-2">
                  {predictions.insights.opportunities.map((opp, i) => (
                    <li key={i} className="text-sm text-purple-800 dark:text-purple-300">
                      • {opp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}