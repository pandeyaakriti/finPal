"use client";

import { useEffect, useState } from "react";
import { getJSON } from "@/lib/api";
import TransactionRow from "@/components/TransactionRow";
import ManualTransactionForm from "@/components/ManualTransactionForm";

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
type FilterType = "all" | "income" | "expense" | "low-confidence";

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
    if (filterType === "low-confidence") {
      return tx.amountMinus > 0 && tx.confidence !== null && tx.confidence < 0.6;
    }
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
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-6">Transactions</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
            <div className="text-xs text-zinc-500 mb-1">Total Income</div>
            <div className="text-xl font-semibold text-emerald-400">₹{totalIncome.toFixed(2)}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
            <div className="text-xs text-zinc-500 mb-1">Total Expense</div>
            <div className="text-xl font-semibold text-red-400">₹{totalExpense.toFixed(2)}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
            <div className="text-xs text-zinc-500 mb-1">Net Balance</div>
            <div className={`text-xl font-semibold ${netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ₹{netBalance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Manual Transaction Form */}
        <ManualTransactionForm onTransactionAdded={fetchTransactions} />

        {/* Filters and Sorting */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filter Options */}
            <div className="flex-1">
              <label className="text-xs text-zinc-500 mb-2 block">Filter by Type</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    filterType === "all"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("income")}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    filterType === "income"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setFilterType("expense")}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    filterType === "expense"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  Expense
                </button>
                <button
                  onClick={() => setFilterType("low-confidence")}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    filterType === "low-confidence"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  Low Confidence
                </button>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex-1">
              <label className="text-xs text-zinc-500 mb-2 block">Sort by</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy("date")}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    sortBy === "date"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  Date (Newest)
                </button>
                <button
                  onClick={() => setSortBy("confidence")}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    sortBy === "confidence"
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  Confidence (Low→High)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="text-sm text-zinc-500 mb-3">
          Showing {sortedTransactions.length} transaction{sortedTransactions.length !== 1 ? 's' : ''}
        </div>

        {/* Transactions List */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="px-4 py-12 text-center text-sm text-zinc-500">
              Loading transactions...
            </div>
          ) : sortedTransactions.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-zinc-500">
              No transactions found
            </div>
          ) : (
            <div>
              {sortedTransactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} onUpdate={fetchTransactions} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}