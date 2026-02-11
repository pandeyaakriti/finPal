"use client";

import { useState } from "react";
import { postJSON } from "@/lib/api";

const CATEGORIES = [
  //category 1
  "education",

  //category 2
  "entertainment",

  //category 3
  "food & dining",

  //category 4
  "healthcare",

  //category 5
  "insurance",

  //category 6
  "miscellaneous",

  //category 7
  "rent",

  //category 8
  "savings/investments",

  //category 9
  "shopping",
   
  //category 10
  "subscriptions",

  //category 11
  "tax",

//category 12
  "transfers",

  //category 13
  "transportation",

  //category 14
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Add Manual Transaction
      </h3>

      {/* Amount 
      and 
      Type Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              ₹
            </span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7AD1A6] focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setType("EXPENSE");
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                type === "EXPENSE"
                  ? 'bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType("INCOME");
                setCategory(""); // Clear category when switching to income
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                type === "INCOME"
                  ? 'bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600'
              }`}
            >
              Income
            </button>
          </div>
        </div>
      </div>

      {/* Category -
       Only show for expenses */}
      {type === "EXPENSE" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7AD1A6] focus:border-transparent"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Remarks */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Remarks <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <input
          type="text"
          placeholder="Add a note about this transaction..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7AD1A6] focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Submit Button */}
      <button 
        onClick={submit}
        disabled={isSubmitting}
        className="w-full bg-linear-to-r from-[#7AD1A6] to-[#5B6F70] hover:from-[#6BC195] hover:to-[#4A5E5F] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-lg px-4 py-3 text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:shadow-none"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding Transaction...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </span>
        )}
      </button>
    </div>
  );
}