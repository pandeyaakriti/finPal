// frontend/components/BudgetSettings.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign } from 'lucide-react';
import { getBudgets, bulkUpdateBudgets } from '@/lib/budgetApi';

interface BudgetSettingsProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onSaveAction: () => void;
}

const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
];

export default function BudgetSettings({ isOpen, onCloseAction, onSaveAction }: BudgetSettingsProps) {
  const [budgets, setBudgets] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBudgets();
    }
  }, [isOpen]);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const userBudgets = await getBudgets();
      const budgetMap: { [key: string]: string } = {};
      
      // Initialize all categories with 0
      DEFAULT_CATEGORIES.forEach(category => {
        budgetMap[category] = '0';
      });
      
      // Override with user's actual budgets
      userBudgets.forEach(budget => {
        budgetMap[budget.category] = budget.targetAmount.toString();
      });
      
      setBudgets(budgetMap);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (category: string, value: string) => {
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setBudgets(prev => ({
        ...prev,
        [category]: value,
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const budgetArray = Object.entries(budgets)
        .filter(([_, amount]) => parseFloat(amount) > 0)
        .map(([category, amount]) => ({
          category,
          targetAmount: parseFloat(amount),
        }));
      
      await bulkUpdateBudgets(budgetArray);
      onSaveAction();
      onCloseAction();
    } catch (error) {
      console.error('Error saving budgets:', error);
      alert('Failed to save budgets. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative bg-linear-to-br from-[#90A1B9] via-[#9BB8B2] to-[#7AD1A6] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">Monthly Budgets</h2>
              <p className="text-white/80 text-sm">Set your spending targets for each category</p>
            </div>
            <button
              onClick={onCloseAction}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 active:scale-95"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-240px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-[#7AD1A6] border-t-transparent"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading budgets...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {DEFAULT_CATEGORIES.map((category, index) => (
                <div
                  key={category}
                  className="group relative bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-5 border-2 border-gray-100 dark:border-gray-600/50 hover:border-[#7AD1A6]/30 dark:hover:border-[#7AD1A6]/30 transition-all duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {category}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="w-5 h-5 text-[#90A1B9] dark:text-[#7AD1A6]" />
                    </div>
                    <input
                      type="text"
                      value={budgets[category] || ''}
                      onChange={(e) => handleInputChange(category, e.target.value)}
                      placeholder="0"
                      className="w-full pl-12 pr-16 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#7AD1A6]/50 focus:border-[#7AD1A6] transition-all duration-200 text-gray-900 dark:text-white text-lg font-medium placeholder:text-gray-400"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">NPR</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Total Summary */}
              <div className="mt-6 bg-linear-to-br from-[#90A1B9]/10 via-[#9BB8B2]/10 to-[#7AD1A6]/10 dark:from-[#90A1B9]/20 dark:via-[#9BB8B2]/20 dark:to-[#7AD1A6]/20 rounded-2xl p-6 border-2 border-[#7AD1A6]/20 dark:border-[#7AD1A6]/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Total Monthly Budget
                    </p>
                    <p className="text-3xl font-bold bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] bg-clip-text text-transparent">
                      NPR {Object.values(budgets)
                        .reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
                        .toLocaleString('en-NP', { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#90A1B9] to-[#7AD1A6] flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700/30 px-8 py-6 flex gap-3 justify-end border-t-2 border-gray-100 dark:border-gray-600/50">
          <button
            onClick={onCloseAction}
            disabled={saving}
            className="px-6 py-3 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 text-white font-medium rounded-xl hover:shadow-lg hover:bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Budgets
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}