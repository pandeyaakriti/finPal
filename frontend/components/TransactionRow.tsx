"use client";

import { useState } from "react";
import { patchJSON } from "@/lib/api";

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

interface TransactionRowProps {
  tx: {
    id: number;
    remarks: string | null;
    amountPlus: number;
    amountMinus: number;
    predicted: number | null;
    predictedLabel: string | null;
    corrected: number | null;
    correctedLabel: string | null;
    confidence: number | null;
    source: string;
    createdAt: string;
  };
  onUpdate?: () => void;
}

export default function TransactionRow({ tx, onUpdate }: TransactionRowProps) {
  const [label, setLabel] = useState(
    tx.correctedLabel ?? tx.predictedLabel ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isExpense = tx.amountMinus > 0;
  const isIncome = tx.amountPlus > 0;

  const saveCorrection = async () => {
    if (!label || !isExpense) return;

    setSaving(true);
    try {
      await patchJSON(`/transactions/${tx.id}/correct`, {
        correctedLabel: label,
      });
      
      // Show success notification
      const successMsg = document.createElement("div");
      successMsg.className = "fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm";
      successMsg.textContent = "Category updated successfully!";
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 2000);
      
      // Refresh the transaction list
      if (onUpdate) {
        onUpdate();
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save correction:", error);
      alert("Failed to save correction");
    } finally {
      setSaving(false);
    }
  };

  const getConfidenceColor = (confidence: number | null) => {
    if (confidence === null) return "text-zinc-500";
    if (confidence >= 0.8) return "text-emerald-500";
    if (confidence >= 0.6) return "text-yellow-500";
    return "text-red-500";
  };

  const getConfidenceBadge = (confidence: number | null) => {
    if (confidence === null) return null;
    if (confidence >= 1.0) return "User Verified";
    return `${Math.round(confidence * 100)}% confidence`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  };

  return (
    <div className="border-b border-zinc-800 last:border-b-0">
      <div className="px-4 py-4 hover:bg-zinc-900/50 transition-colors">
        <div className="flex items-start justify-between gap-4">
          {/* Left Side - Transaction Details */}
          <div className="flex-1 min-w-0">
            {/* Remarks and Date */}
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm text-zinc-200 font-medium truncate">
                {tx.remarks || "No description"}
              </div>
              {tx.source === "MANUAL" && (
                <span className="text-xs px-1.5 py-0.5 bg-blue-900/30 text-blue-400 rounded border border-blue-800">
                  Manual
                </span>
              )}
            </div>

            <div className="text-xs text-zinc-500">
              {formatDate(tx.createdAt)}
            </div>

            {/* Category and Confidence - Only for Expenses */}
            {isExpense && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {!isEditing ? (
                  <>
                    <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded capitalize">
                      {label || "uncategorized"}
                    </span>
                    
                    {tx.confidence !== null && (
                      <span className={`text-xs font-medium ${getConfidenceColor(tx.confidence)}`}>
                        {getConfidenceBadge(tx.confidence)}
                      </span>
                    )}
                    
                    {/* Only show edit button if confidence is less than 100% */}
                    {(tx.confidence === null || tx.confidence < 1.0) && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        Edit Category
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex gap-2 items-center">
                    <select 
                      value={label} 
                      onChange={(e) => setLabel(e.target.value)}
                      className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>

                    <button 
                      onClick={saveCorrection} 
                      disabled={saving || !label}
                      className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded transition-colors"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>

                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setLabel(tx.correctedLabel ?? tx.predictedLabel ?? "");
                      }}
                      className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Amount */}
          <div className="text-right">
            {isIncome && (
              <div className="text-lg font-semibold text-emerald-400 tabular-nums">
                +₹{tx.amountPlus.toFixed(2)}
              </div>
            )}
            {isExpense && (
              <div className="text-lg font-semibold text-red-400 tabular-nums">
                -₹{tx.amountMinus.toFixed(2)}
              </div>
            )}
            <div className="text-xs text-zinc-500 mt-0.5">
              {isIncome ? "Income" : "Expense"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}