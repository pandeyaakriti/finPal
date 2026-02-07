'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { getMe } from '@/lib/api';
import { getToken, logout } from '@/utils/auth';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Target,
  BarChart3,
  Upload,
  ArrowRight,
  DollarSign,
  Sparkles,
  FileText,
  Bell,
} from 'lucide-react';

const COLORS = [
  '#7AD1A6', '#90A1B9', '#5B6F70', '#A8C5DD', '#6B8E9F', 
  '#8BBDAB', '#B0BEC5', '#85C7D0', '#A4B8C4', '#7FA99B'
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedToken = useRef(false);

  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [hasData, setHasData] = useState(false);
  const [budgets, setBudgets] = useState<any[]>([]);

  useEffect(() => {
    if (hasCheckedToken.current) return;
    hasCheckedToken.current = true;

    const fetchUser = async () => {
      await new Promise((r) => setTimeout(r, 100));

      const token = getToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const res = await getMe();
        if (!res.ok) {
          logout();
          window.location.href = '/login';
          return;
        }

        const data = await res.json();
        setUser(data.user);
        
        // Fetch chart data
        await fetchChartData(token);
        
        // Fetch budgets
        await fetchBudgets(token);
        
        setLoading(false);
      } catch (err) {
        logout();
        window.location.href = '/login';
      }
    };

    fetchUser();
  }, [router]);

  const fetchChartData = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/charts", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        setHasData(false);
        return;
      }

      const rows = await response.json();
      
      if (rows.length === 0) {
        setHasData(false);
        return;
      }

      setHasData(true);

      // Process data for category breakdown
      const byCategory: Record<string, number> = {};
      const byMonth: Record<string, number> = {};

      rows.forEach((r: any) => {
        const cat = r.predictedLabel || "Uncategorized";
        byCategory[cat] = (byCategory[cat] || 0) + r.amountMinus;

        const date = new Date(r.createdAt);
        const monthKey = date.toLocaleString("en", { month: "short", year: "numeric" });
        byMonth[monthKey] = (byMonth[monthKey] || 0) + r.amountMinus;
      });

      // Format category data
      const formattedCategoryData = Object.entries(byCategory)
        .map(([name, value], index) => ({ 
          name, 
          value: Number(value.toFixed(2)),
          color: COLORS[index % COLORS.length]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 categories

      setCategoryData(formattedCategoryData);

      // Calculate total and monthly expenses
      const total = Object.values(byCategory).reduce((sum, val) => sum + val, 0);
      setTotalExpenses(total);

      // Get current month expenses
      const currentMonth = new Date().toLocaleString("en", { month: "short", year: "numeric" });
      setMonthlyExpenses(byMonth[currentMonth] || 0);

    } catch (err) {
      console.error("Error fetching chart data:", err);
      setHasData(false);
    }
  };

  const fetchBudgets = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5000/budgets", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setBudgets(data.budgets || []);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#7ECBAA] dark:border-[#65a187] mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#7ECBAA] dark:border-[#7ECBAA] mx-auto absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-300 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  //const savingsAmount = dashboardData.monthlyIncome - dashboardData.monthlyExpenses;

  return (
    <div className="min-h-screen flex bg-linear-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Right Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.username || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
          
          {/* Welcome Banner - Show if no data uploaded */}
          {!hasData && (
            <div className="bg-linear-to-r from-[#7ECBAA] to-[#90A1B9] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-6 h-6" />
                      <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                        Get Started
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold mb-3">
                      Start Your Financial Journey
                    </h2>
                    <p className="text-emerald-50 text-lg mb-6 max-w-2xl">
                      Upload your transaction data to unlock powerful insights, track budgets, and get AI-powered predictions for your financial future.
                    </p>
                    <button
                      onClick={() => router.push('/upload')}
                      className="bg-white text-[#7ECBAA] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition flex items-center gap-2 shadow-lg"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Your Data
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="hidden lg:block">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <FileText className="w-16 h-16 mb-3" />
                      <p className="text-sm font-medium">CSV Format</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats - Show if has data */}
          {hasData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Expenses */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-linear-to-br from-red-500 to-red-600 rounded-xl">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full font-medium">
                    All Time
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Total Expenses
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  NPR {totalExpenses.toLocaleString()}
                </p>
              </div>

              {/* Monthly Expenses */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-linear-to-br from-[#90A1B9] to-[#7089a8] rounded-xl">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                    This Month
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Monthly Spending
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  NPR {monthlyExpenses.toLocaleString()}
                </p>
              </div>

              {/* Active Budgets */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-linear-to-br from-[#7ECBAA] to-[#65a187] rounded-xl">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                    Active
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Budgets Set
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {budgets.length}
                </p>
              </div>
            </div>
          )}

          {/* Top Spending Categories - Show if has data */}
          {hasData && categoryData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <PieChart className="w-6 h-6 text-[#7ECBAA]" />
                  Top Spending Categories
                </h2>
                <button
                  onClick={() => router.push('/charts')}
                  className="text-sm text-[#7ECBAA] hover:text-[#65a187] font-medium flex items-center gap-1"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {categoryData.map((category, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {category.name}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      NPR {category.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {((category.value / totalExpenses) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Actions - Takes 1 column */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/upload')}
                  className="w-full bg-linear-to-r from-[#7ECBAA] to-[#65a187] text-white p-4 rounded-xl hover:shadow-lg transition flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <Upload className="w-5 h-5" />
                    <span className="font-medium">Upload Data</span>
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </button>

                <button
                  onClick={() => router.push('/budgets')}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <Target className="w-5 h-5" />
                    <span className="font-medium">Set Budgets</span>
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </button>

                <button
                  onClick={() => router.push('/charts')}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <PieChart className="w-5 h-5" />
                    <span className="font-medium">View Charts</span>
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </button>

                <button
                  onClick={() => router.push('/networth')}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-between group"
                >
                  <span className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-medium">Net Worth Prediction</span>
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>

            {/* Feature Highlights - Takes 2 columns */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Explore Your Financial Tools
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div
                  onClick={() => router.push('/charts')}
                  className="cursor-pointer group hover:scale-105 transition p-6 rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 border border-emerald-100 dark:border-gray-600"
                >
                  <div className="w-12 h-12 bg-[#7ECBAA] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Smart Charts
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Visualize your spending patterns across categories
                  </p>
                </div>

                <div
                  onClick={() => router.push('/budgets')}
                  className="cursor-pointer group hover:scale-105 transition p-6 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border border-blue-100 dark:border-gray-600"
                >
                  <div className="w-12 h-12 bg-[#7ECBAA]  rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Budget Tracker
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Set limits and monitor your spending habits
                  </p>
                </div>

                <div
                  onClick={() => router.push('/transactions')}
                  className="cursor-pointer group hover:scale-105 transition p-6 rounded-xl bg-linear-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 border border-purple-100 dark:border-gray-600"
                >
                  <div className="w-12 h-12 bg-[#7ECBAA] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Transactions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and manage all your financial transactions
                  </p>
                </div>

                <div
                  onClick={() => router.push('/networth')}
                  className="cursor-pointer group hover:scale-105 transition p-6 rounded-xl bg-linear-to-br from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 border border-amber-100 dark:border-gray-600"
                >
                  <div className="w-12 h-12 bg-[#7ECBAA]  rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Financial Health Predictions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    3-month forecast of your financial health
                  </p>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}