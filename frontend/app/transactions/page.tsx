"use client";

import { useEffect, useState } from "react";
import { getJSON } from "@/lib/api";
import TransactionRow from "@/components/TransactionRow";
import ManualTransactionForm from "@/components/ManualTransactionForm";
import Sidebar from '@/components/Sidebar';

type Transaction = {
  id: number;
  remarks: string | null;
  amountPlus: number;
  amountMinus: number;
  balance: number;
  predicted: number | null;
  predictedLabel: string | null;
  corrected: number | null;
  correctedLabel: string | null;
  confidence: number | null;
  source: string;
  createdAt: string;
  userId: number;
};

type SortBy = "date" | "confidence";
type FilterType = "all" | "income" | "expense";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getJSON(`/transactions`);
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "income") return tx.amountPlus > 0;
    if (filterType === "expense") return tx.amountMinus > 0;
    return true;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      // Sort by confidence (only for expenses)
      const confA = a.amountMinus > 0 ? (a.confidence ?? 1) : 1;
      const confB = b.amountMinus > 0 ? (b.confidence ?? 1) : 1;
      return confA - confB;
    }
  });

  // Calculate totals
  const totalIncome = filteredTransactions.reduce((sum, tx) => sum + tx.amountPlus, 0);
  const totalExpense = filteredTransactions.reduce((sum, tx) => sum + tx.amountMinus, 0);
  const netBalance = totalIncome - totalExpense;

   return (
    <div className="min-h-screen flex bg-linear-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Transactions
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto w-full px-6 py-8 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Income Card */}
            <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                Total Income
              </p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                ₹{totalIncome.toFixed(2)}
              </p>
            </div>

            {/* Expense Card */}
            <div className="bg-linear-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300 mb-1">
                Total Expense
              </p>
              <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                ₹{totalExpense.toFixed(2)}
              </p>
            </div>

            {/* Net Balance Card */}
            <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                Net Balance
              </p>
              <p
                className={`text-3xl font-bold ${
                  netBalance >= 0
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-700 dark:text-red-400"
                }`}
              >
                ₹{netBalance.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Manual Transaction */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <ManualTransactionForm onTransactionAdded={fetchTransactions} />
          </div>

          {/* Filters & Sorting */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Filter */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Type
                </p>
                <div className="flex gap-2">
                  {(["all", "income", "expense"] as FilterType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        filterType === type
                          ? "bg-[#7AD1A6] text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Sort by
                </p>
                <div className="flex gap-2">
                  {(["date", "confidence"] as SortBy[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSortBy(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        sortBy === type
                          ? "bg-[#90A1B9] text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {type === "date" ? "Newest First" : "Low Confidence"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Count */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {sortedTransactions.length} transaction
            {sortedTransactions.length !== 1 && "s"}
          </p>

          {/* Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-16 text-center text-gray-500">
                Loading transactions…
              </div>
            ) : sortedTransactions.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                No transactions found
              </div>
            ) : (
              sortedTransactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  onUpdate={fetchTransactions}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}