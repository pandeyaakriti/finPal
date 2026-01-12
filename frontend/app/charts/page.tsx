//frontend/app/charts/page.tsx
'use client';
import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Activity } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

// Sample data for charts
const categoryData = [
  { name: 'Food & Dining', value: 3500, color: '#7AD1A6' },
  { name: 'Transportation', value: 2800, color: '#90A1B9' },
  { name: 'Shopping', value: 2200, color: '#5B6F70' },
  { name: 'Entertainment', value: 1500, color: '#A8C5DD' },
  { name: 'Bills & Utilities', value: 2000, color: '#6B8E9F' },
  { name: 'Healthcare', value: 1200, color: '#8BBDAB' },
  { name: 'Others', value: 800, color: '#B0BEC5' },
];

const monthlyData = [
  { month: 'Jan', expenses: 12500, income: 18000 },
  { month: 'Feb', expenses: 13200, income: 18000 },
  { month: 'Mar', expenses: 11800, income: 18500 },
  { month: 'Apr', expenses: 14000, income: 18000 },
  { month: 'May', expenses: 13500, income: 19000 },
  { month: 'Jun', expenses: 14000, income: 18000 },
];

const trendData = [
  { month: 'Jan', amount: 12500 },
  { month: 'Feb', amount: 13200 },
  { month: 'Mar', amount: 11800 },
  { month: 'Apr', amount: 14000 },
  { month: 'May', amount: 13500 },
  { month: 'Jun', amount: 14000 },
];

export default function Charts() {
  const [timeRange, setTimeRange] = useState('6M');
  
  const totalExpenses = categoryData.reduce((sum, item) => sum + item.value, 0);
  const avgMonthly = monthlyData.reduce((sum, item) => sum + item.expenses, 0) / monthlyData.length;
  const lastMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];
  const monthChange = ((lastMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100;

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
                    label={({ name, percent }) => name && percent ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
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

          {/* Expense Trend Line Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#5B6F70]" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Spending Trend
              </h2>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
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
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#5B6F70" 
                  strokeWidth={3}
                  dot={{ fill: '#7AD1A6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
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