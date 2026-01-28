"use client";

import { useState } from "react";
import { postJSON } from "@/lib/api";

const CATEGORIES = [
  "education",
  "entertainment",
  "food & dining",
  "healthcare",
  "insurance",
  "miscellaneous",
  "rent",
  "savings/investments",
  "shopping",
  "subscriptions",
  "tax",
  "transfers",
  "transportation",
  "utilities"
];

interface ManualTransactionFormProps {
  onTransactionAdded?: () => void;
}

export default function ManualTransactionForm({ onTransactionAdded }: ManualTransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [category, setCategory] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (type === "EXPENSE" && !category) {
      alert("Please select a category for expenses");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await postJSON("/transactions/manual", {
        amount: parseFloat(amount),
        type,
        categoryLabel: category || null,
        remarks: remarks || null,
      });

      console.log("Transaction created:", response);

      // Reset form
      setAmount("");
      setCategory("");
      setRemarks("");
      
      // Show success message
      const successMsg = document.createElement("div");
      successMsg.className = "fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50";
      successMsg.textContent = "Transaction added successfully!";
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 2000);
      
      // Notify parent component to refresh the list
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (error) {
      console.error("Failed to add transaction:", error);
      alert("Failed to add transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-4 mb-6">
      <h3 className="text-sm font-medium text-zinc-300 mb-4">Add Manual Transaction</h3>

      <div className="space-y-3">
        {/* Amount and Type Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Amount *</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-zinc-600"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Type *</label>
            <select 
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                // Clear category when switching to income
                if (e.target.value === "INCOME") {
                  setCategory("");
                }
              }}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
        </div>

        {/* Category - Only show for expenses */}
        {type === "EXPENSE" && (
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Category *</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Remarks */}
        <div>
          <label className="text-xs text-zinc-500 mb-1.5 block">Remarks (Optional)</label>
          <input
            placeholder="Add a note..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-zinc-600"
          />
        </div>

        {/* Info text */}
        <div className="text-xs text-zinc-500 bg-zinc-800/50 rounded px-2 py-1.5">
          Manual transactions are saved with 100% confidence
        </div>

        {/* Submit Button */}
        <button 
          onClick={submit}
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
        >
          {isSubmitting ? "Adding..." : "Add Transaction"}
        </button>
      </div>
    </div>
  );
}