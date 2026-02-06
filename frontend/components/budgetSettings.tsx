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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Set Monthly Budgets</h2>
          <button
            onClick={onCloseAction}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7AD1A6]"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Set your monthly spending targets for each category. Your actual spending will be tracked against these budgets.
              </p>

              {DEFAULT_CATEGORIES.map((category) => (
                <div
                  key={category}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {category}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-500 ml-1">NPR</span>
                    </div>
                    <input
                      type="text"
                      value={budgets[category] || '0'}
                      onChange={(e) => handleInputChange(category, e.target.value)}
                      placeholder="0"
                      className="w-full pl-20 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#7AD1A6] focus:border-transparent text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 mt-6">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Total Monthly Budget:</strong> NPR{' '}
                  {Object.values(budgets)
                    .reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onCloseAction}
            disabled={saving}
            className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Budgets
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}