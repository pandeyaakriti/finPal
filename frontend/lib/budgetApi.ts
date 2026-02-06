// frontend/lib/budgetApi.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Budget {
  id: number;
  userId: number;
  category: string;
  targetAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAnalytics {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export interface MonthlyData {
  month: string;
  budgeted: number;
  spent: number;
  saved: number;
  income: number;
}

export interface YearlyData {
  month: string;
  budget: number;
  actual: number;
}

// Get all budgets for user
export const getBudgets = async (): Promise<Budget[]> => {
  try {
    const response = await axios.get(`${API_URL}/budgets`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
};

// Create or update a budget
export const upsertBudget = async (category: string, targetAmount: number): Promise<Budget> => {
  try {
    const response = await axios.post(
      `${API_URL}/budgets`,
      { category, targetAmount },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error upserting budget:', error);
    throw error;
  }
};

// Bulk update budgets
export const bulkUpdateBudgets = async (
  budgets: { category: string; targetAmount: number }[]
): Promise<Budget[]> => {
  try {
    const response = await axios.post(
      `${API_URL}/budgets/bulk`,
      { budgets },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error bulk updating budgets:', error);
    throw error;
  }
};

// Get current month analytics
export const getCurrentMonthAnalytics = async (): Promise<BudgetAnalytics[]> => {
  try {
    const response = await axios.get(`${API_URL}/budgets/analytics/current`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current month analytics:', error);
    throw error;
  }
};

// Get monthly analytics for last N months
export const getMonthlyAnalytics = async (months: number = 6): Promise<MonthlyData[]> => {
  try {
    const response = await axios.get(`${API_URL}/budgets/analytics/monthly/${months}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly analytics:', error);
    throw error;
  }
};

// Get yearly analytics
export const getYearlyAnalytics = async (): Promise<YearlyData[]> => {
  try {
    const response = await axios.get(`${API_URL}/budgets/analytics/yearly`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching yearly analytics:', error);
    throw error;
  }
};

// Delete a budget
export const deleteBudget = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/budgets/${id}`, {
      headers: getAuthHeader(),
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};