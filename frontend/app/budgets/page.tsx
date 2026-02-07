//frontend/app/budgets.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Target, AlertCircle, CheckCircle, PieChart, ArrowRight, Settings } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BudgetSettings from '@/components/budgetSettings';
import { getCurrentMonthAnalytics, getMonthlyAnalytics, getYearlyAnalytics } from '@/lib/budgetApi';

export default function Budgets() {
  const [activeTab, setActiveTab] = useState<'current' | 'monthly' | 'yearly'>('current');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State for real data
  const [currentMonthBudgets, setCurrentMonthBudgets] = useState<any[]>([]);
  const [monthlyPerformance, setMonthlyPerformance] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all data in parallel
      const [currentData, monthlyData, yearlyDataRes] = await Promise.all([
        getCurrentMonthAnalytics(),
        getMonthlyAnalytics(6),
        getYearlyAnalytics(),
      ]);

      // Transform current month data to match frontend format
      const transformedCurrent = currentData.map((item, index) => ({
        category: item.category,
        budget: item.budget,
        spent: item.spent,
        color: ['#7AD1A6', '#90A1B9', '#5B6F70', '#A8C5DD', '#6B8E9F', '#8BBDAB'][index % 6],
      }));

      setCurrentMonthBudgets(transformedCurrent);
      setMonthlyPerformance(monthlyData);
      setYearlyData(yearlyDataRes);
    } catch (error) {
      console.error('Error loading budget data:', error);
      // Set empty arrays if there's an error
      setCurrentMonthBudgets([]);
      setMonthlyPerformance([]);
      setYearlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetsSaved = () => {
    // Reload data after budgets are saved
    loadData();
  };
  
  const totalBudget = currentMonthBudgets.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = currentMonthBudgets.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const onTrackCount = currentMonthBudgets.filter(b => b.budget > 0 && (b.spent / b.budget) <= 0.9).length;
  const warningCount = currentMonthBudgets.filter(b => b.budget > 0 && (b.spent / b.budget) > 0.9 && (b.spent / b.budget) <= 1).length;
  const overBudgetCount = currentMonthBudgets.filter(b => b.budget > 0 && (b.spent / b.budget) > 1).length;

  const yearlyTotalBudget = yearlyData.reduce((sum, item) => sum + item.budget, 0);
  const yearlyTotalSpent = yearlyData.reduce((sum, item) => sum + item.actual, 0);
  const yearlyTotalSaved = yearlyTotalBudget - yearlyTotalSpent;
  const yearlySavingsRate = yearlyTotalBudget > 0 ? (yearlyTotalSaved / yearlyTotalBudget) * 100 : 0;

  const categoryRadarData = currentMonthBudgets
    .filter(item => item.budget > 0)
    .map(item => ({
      category: item.category.split(' ')[0],
      usage: Math.round((item.spent / item.budget) * 100),
    }));

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

  const getBudgetStatus = (spent: number, budget: number) => {
    if (budget === 0) return { status: 'not-set', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/30' };
    
    const percentage = (spent / budget) * 100;
    if (percentage <= 75) return { status: 'excellent', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
    if (percentage <= 90) return { status: 'good', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    if (percentage <= 100) return { status: 'warning', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return { status: 'over', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#7AD1A6] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading budget data...</p>
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
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Budget Insights
              </h1>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Settings className="w-4 h-4" />
                Set Budgets
              </button>
            </div>
            
            {/* Tab Selector */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('current')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'current'
                    ? 'bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600'
                }`}
              >
                Current Month
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'monthly'
                    ? 'bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600'
                }`}
              >
                Monthly Trends
              </button>
              <button
                onClick={() => setActiveTab('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'yearly'
                    ? 'bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600'
                }`}
              >
                Yearly Overview
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
          
          {/* Show message if no budgets set */}
          {currentMonthBudgets.length === 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800 text-center">
              <Target className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Budgets Set Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start by setting your monthly spending targets for different categories
              </p>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-6 py-3 bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white rounded-lg hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                <Settings className="w-5 h-5" />
                Set Your Budgets
              </button>
            </div>
          )}

          {/* Current Month Tab */}
          {activeTab === 'current' && currentMonthBudgets.length > 0 && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Total Budget Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 rounded-xl">
                      <Target className="w-6 h-6 text-[#5B6F70]" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    NPR {totalBudget.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
                </div>

                {/* Total Spent Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 rounded-xl">
                      <DollarSign className="w-6 h-6 text-[#5B6F70]" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    NPR {totalSpent.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                </div>

                {/* Remaining Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-linear-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${totalRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    NPR {totalRemaining.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                </div>

                {/* Progress Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-linear-to-br from-[#90A1B9]/10 to-[#7AD1A6]/10 rounded-xl">
                      <PieChart className="w-6 h-6 text-[#5B6F70]" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {overallProgress.toFixed(1)}%
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Budget Used</p>
                </div>
              </div>

              {/* Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-1">On Track</p>
                      <p className="text-3xl font-bold text-green-700 dark:text-green-300">{onTrackCount}</p>
                    </div>
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Warning</p>
                      <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{warningCount}</p>
                    </div>
                    <AlertCircle className="w-12 h-12 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-1">Over Budget</p>
                      <p className="text-3xl font-bold text-red-700 dark:text-red-300">{overBudgetCount}</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Budget Usage Radar Chart */}
              {categoryRadarData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                    Budget Usage Overview
                  </h2>
                  
                  <ResponsiveContainer width="100%" height={600}>
                    <RadarChart data={categoryRadarData}>
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis dataKey="category" style={{ fontSize: '18px' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Usage %" dataKey="usage" stroke="#5B6F70" fill="#7AD1A6" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {/* Monthly Trends Tab */}
          {activeTab === 'monthly' && (
            <>
              {/* Monthly Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-6 h-6 text-[#5B6F70]" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      6-Month Average
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    NPR {monthlyPerformance.length > 0 
                      ? Math.round(monthlyPerformance.reduce((sum, m) => sum + m.budgeted, 0) / monthlyPerformance.length).toLocaleString()
                      : '0'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Monthly Budget</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-6 h-6 text-[#5B6F70]" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total Spent
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    NPR {monthlyPerformance.reduce((sum, m) => sum + m.spent, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last 6 Months</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total Saved
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    NPR {monthlyPerformance.reduce((sum, m) => sum + m.saved, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Budget Surplus</p>
                </div>
              </div>

              {/* Budget vs Actual Chart */}
              {monthlyPerformance.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                    Budget Performance (Last 6 Months)
                  </h2>
                  
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={monthlyPerformance}>
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
                      <Bar dataKey="budgeted" fill="#90A1B9" radius={[8, 8, 0, 0]} name="Budgeted" />
                      <Bar dataKey="spent" fill="#7AD1A6" radius={[8, 8, 0, 0]} name="Spent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Savings Trend */}
              {monthlyPerformance.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                    Monthly Savings Trend
                  </h2>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyPerformance}>
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
                        dataKey="saved" 
                        stroke="#7AD1A6" 
                        strokeWidth={3}
                        dot={{ fill: '#5B6F70', r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Saved"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {/* Yearly Overview Tab */}
          {activeTab === 'yearly' && (
            <>
              {/* Yearly Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-linear-to-br from-[#90A1B9] to-[#7AD1A6] rounded-2xl p-6 shadow-lg text-white">
                  <Target className="w-8 h-8 mb-3 opacity-80" />
                  <p className="text-sm opacity-90 mb-1">Annual Budget</p>
                  <p className="text-3xl font-bold">NPR {yearlyTotalBudget.toLocaleString()}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <DollarSign className="w-8 h-8 mb-3 text-[#5B6F70]" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    NPR {yearlyTotalSpent.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <CheckCircle className="w-8 h-8 mb-3 text-green-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Saved</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    NPR {yearlyTotalSaved.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <TrendingUp className="w-8 h-8 mb-3 text-[#5B6F70]" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Savings Rate</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {yearlySavingsRate.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Yearly Budget vs Actual */}
              {yearlyData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                    Yearly Budget Performance
                  </h2>
                  
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={yearlyData}>
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
                        dataKey="budget" 
                        stroke="#90A1B9" 
                        strokeWidth={3}
                        dot={{ fill: '#90A1B9', r: 4 }}
                        name="Budget"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#7AD1A6" 
                        strokeWidth={3}
                        dot={{ fill: '#7AD1A6', r: 4 }}
                        name="Actual"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Budget Settings Modal */}
      <BudgetSettings
        isOpen={isSettingsOpen}
        onCloseAction={() => setIsSettingsOpen(false)}
        onSaveAction={handleBudgetsSaved}
      />
    </div>
  );
}