// frontend/app/charts/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Activity } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

// Color palette for categories
const COLORS = [
  '#7AD1A6', '#90A1B9', '#5B6F70', '#A8C5DD', '#6B8E9F', 
  '#8BBDAB', '#B0BEC5', '#85C7D0', '#A4B8C4', '#7FA99B'
];

export default function Charts() {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6M');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view charts");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5000/api/charts", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch chart data");
        }

        const rows = await response.json();

        // Process data for category breakdown
        const byCategory: Record<string, number> = {};
        const byMonth: Record<string, { expenses: number; income: number }> = {};

        rows.forEach((r: any) => {
          const cat = r.predictedLabel || "Uncategorized";
          byCategory[cat] = (byCategory[cat] || 0) + r.amountMinus;

          const date = new Date(r.createdAt);
          const monthKey = date.toLocaleString("en", { month: "short", year: "numeric" });
          
          if (!byMonth[monthKey]) {
            byMonth[monthKey] = { expenses: 0, income: 0 };
          }
          byMonth[monthKey].expenses += r.amountMinus;
        });

        // Format category data with colors
        const formattedCategoryData = Object.entries(byCategory)
          .map(([name, value], index) => ({ 
            name, 
            value: Number(value.toFixed(2)),
            color: COLORS[index % COLORS.length]
          }))
          .sort((a, b) => b.value - a.value);

        setCategoryData(formattedCategoryData);

        /* Format monthly data



        */
        
        const formattedMonthlyData = Object.entries(byMonth)
          .map(([month, data]) => ({ 
            month: month.split(' ')[0], 
            expenses: Number(data.expenses.toFixed(2)),
            income: 0 
          }))
          .slice(-6);

        setMonthlyData(formattedMonthlyData);
        setTrendData(formattedMonthlyData.map(d => ({ month: d.month, amount: d.expenses })));

        setLoading(false);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError("Failed to load chart data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalExpenses = categoryData.reduce((sum, item) => sum + item.value, 0);
  const avgMonthly = monthlyData.length > 0 
    ? monthlyData.reduce((sum, item) => sum + item.expenses, 0) / monthlyData.length 
    : 0;

  let monthChange = 0;
  if (monthlyData.length >= 2) {
    const lastMonth = monthlyData[monthlyData.length - 1];
    const prevMonth = monthlyData[monthlyData.length - 2];

    if (prevMonth.expenses !== 0) {
      monthChange = ((lastMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100;
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {payload[0].name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            NPR {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading charts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-linear-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
       <Sidebar/>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
       
        
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4.5 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Financial Charts
            </h1>
            
            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {['1M', '3M', '6M', '1Y', 'ALL'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Expenses Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 rounded-xl">
                  <DollarSign className="w-6 h-6 text-[#5B6F70]" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">This Period</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                NPR {totalExpenses.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
            </div>

            {/* Average Monthly Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 rounded-xl">
                  <Calendar className="w-6 h-6 text-[#5B6F70]" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Average</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                NPR {Math.round(avgMonthly).toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Spending</p>
            </div>

            {/* Month Change Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 rounded-xl">
                  {monthChange >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-red-500" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-green-500" />
                  )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">vs Last Month</span>
              </div>
              <h3 className={`text-2xl font-bold mb-1 ${
                monthChange >= 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {monthChange >= 0 ? '+' : ''}{monthChange.toFixed(1)}%
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Change</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Expense Categories Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 rounded-lg">
                  <Activity className="w-5 h-5 text-[#5B6F70]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Expense by Category
                </h2>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    //label={({ name, percent }) => name && percent ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Category Legend */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {categoryData.map((category, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Expenses Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 rounded-lg">
                  <Activity className="w-5 h-5 text-[#5B6F70]" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Income vs Expenses
                </h2>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
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
                  <Bar dataKey="income" fill="#7AD1A6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expenses" fill="#90A1B9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Categories List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Top Spending Categories
            </h2>
            
            <div className="space-y-4">
              {categoryData
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
                .map((category, idx) => {
                  const percentage = (category.value / totalExpenses) * 100;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          NPR {category.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: category.color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
