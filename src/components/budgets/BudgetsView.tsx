"use client";

import React, { useState } from "react";
import { Budget, Category, Transaction } from "@/types";
import { formatRupiah, getMonthName } from "@/lib/formatters";
import { DynamicIcon } from "../ui/DynamicIcon";
import { PieChart, Plus, Check, X, AlertTriangle } from "lucide-react";

interface BudgetsViewProps {
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  currentMonth: number;
  currentYear: number;
  onSaveBudget: (categoryId: string, limitAmount: number) => Promise<void>;
}

export function BudgetsView({
  categories,
  budgets,
  transactions,
  currentMonth,
  currentYear,
  onSaveBudget,
}: BudgetsViewProps) {
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Filter only expense categories
  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Calculate spending per category in the current month
  const categorySpending: { [catId: string]: number } = {};
  transactions
    .filter((t) => t.type === "expense" && t.categoryId)
    .forEach((t) => {
      categorySpending[t.categoryId!] = (categorySpending[t.categoryId!] || 0) + t.amount;
    });

  // Calculate total budget and total spending for all expense categories
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const totalSpent = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const handleStartEdit = (catId: string, currentLimit: number) => {
    setEditingCatId(catId);
    setEditLimit(currentLimit ? currentLimit.toString() : "");
  };

  const handleSave = async (catId: string) => {
    const num = parseInt(editLimit.replace(/\D/g, "") || "0", 10);
    setSaving(true);
    try {
      await onSaveBudget(catId, num);
      setEditingCatId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 pb-28 max-w-5xl mx-auto px-4 pt-2">
      {/* Overall Budget Overview Card */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-slate-800">Total Anggaran Bulanan</h3>
              <p className="text-xs text-slate-400">
                {getMonthName(currentMonth - 1)} {currentYear}
              </p>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              overallPercentage > 90
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : overallPercentage >= 70
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
            }`}
          >
            {overallPercentage.toFixed(0)}% Terpakai
          </span>
        </div>

        <div className="flex items-baseline justify-between text-xs md:text-sm pt-1">
          <div>
            <span className="text-slate-400">Realisasi: </span>
            <span className="font-bold text-slate-800">{formatRupiah(totalSpent)}</span>
          </div>
          <div>
            <span className="text-slate-400">Pagu: </span>
            <span className="font-bold text-slate-800">{formatRupiah(totalBudgeted)}</span>
          </div>
        </div>

        {/* Global Progress bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercentage > 90
                ? "bg-rose-500"
                : overallPercentage >= 70
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Category Budgets List */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">Pagu Anggaran per Kategori</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {expenseCategories.map((cat) => {
            const budget = budgets.find((b) => b.categoryId === cat.id);
            const limit = budget?.limitAmount || 0;
            const spent = categorySpending[cat.id] || 0;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            const isEditing = editingCatId === cat.id;

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color || "#10B981" }}
                    >
                      <DynamicIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{cat.name}</p>
                      <p className="text-[11px] text-slate-400">
                        Terpakai: <span className="font-semibold text-slate-700">{formatRupiah(spent)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Budget Limit / Edit Button */}
                  <div>
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={editLimit ? Number(editLimit.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                          onChange={(e) => setEditLimit(e.target.value.replace(/\D/g, ""))}
                          placeholder="0"
                          autoFocus
                          className="w-24 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          onClick={() => handleSave(cat.id)}
                          disabled={saving}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          title="Simpan Pagu"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                          title="Batal"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(cat.id, limit)}
                        className="text-right group"
                      >
                        <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition">
                          {limit > 0 ? formatRupiah(limit) : "Set Pagu"}
                        </p>
                        <p className="text-[10px] text-emerald-600 group-hover:underline">
                          {limit > 0 ? "Ubah Pagu" : "+ Tambah"}
                        </p>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar if budget exists */}
                {limit > 0 && (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage > 90
                            ? "bg-rose-500"
                            : percentage >= 70
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{percentage.toFixed(0)}% pagu terpakai</span>
                      <span>
                        {limit >= spent
                          ? `Sisa ${formatRupiah(limit - spent)}`
                          : `Defisit ${formatRupiah(spent - limit)}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

