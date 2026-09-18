"use client";

import React, { useState, useEffect } from "react";
import { Category, Budget } from "@/types";
import { formatRupiah, getMonthName } from "@/lib/formatters";
import { DynamicIcon } from "../ui/DynamicIcon";
import { X, Check, Trash2, AlertTriangle, Sparkles, TrendingDown } from "lucide-react";

interface CategoryBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  budget: Budget | null;
  spent: number;
  currentMonth: number;
  currentYear: number;
  onSave: (categoryId: string, limitAmount: number) => Promise<void>;
  onDelete?: (categoryId: string) => Promise<void>;
}

const QUICK_AMOUNTS = [250000, 500000, 1000000, 2000000, 3000000, 5000000];

export function CategoryBudgetModal({
  isOpen,
  onClose,
  category,
  budget,
  spent,
  currentMonth,
  currentYear,
  onSave,
  onDelete,
}: CategoryBudgetModalProps) {
  const [amountStr, setAmountStr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      const currentLimit = budget?.limitAmount || 0;
      setAmountStr(currentLimit > 0 ? currentLimit.toLocaleString("id-ID") : "");
    }
  }, [isOpen, category, budget]);

  if (!isOpen || !category) return null;

  const numericAmount = parseInt(amountStr.replace(/\D/g, "") || "0", 10);
  const hasExistingBudget = (budget?.limitAmount || 0) > 0;
  const percentage = numericAmount > 0 ? (spent / numericAmount) * 100 : 0;
  const remaining = numericAmount - spent;

  const handleQuickSelect = (val: number) => {
    setAmountStr(val.toLocaleString("id-ID"));
  };

  const handleQuickAdd = (increment: number) => {
    const current = parseInt(amountStr.replace(/\D/g, "") || "0", 10);
    const nextVal = current + increment;
    setAmountStr(nextVal.toLocaleString("id-ID"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(category.id, numericAmount);
      onClose();
    } catch (err) {
      console.error("Failed to save budget:", err);
      alert("Gagal menyimpan anggaran.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus pagu anggaran untuk kategori "${category.name}"?`)) return;
    setLoading(true);
    try {
      if (onDelete) {
        await onDelete(category.id);
      } else {
        await onSave(category.id, 0);
      }
      onClose();
    } catch (err) {
      console.error("Failed to delete budget:", err);
      alert("Gagal menghapus pagu anggaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: category.color || "#10B981" }}
            >
              <DynamicIcon name={category.icon} className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{category.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Pagu Anggaran • {getMonthName(currentMonth - 1)} {currentYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Current Realization Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Realisasi Pengeluaran</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white">{formatRupiah(spent)}</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Bulan Ini</span>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Target Pagu Bulanan (Rp)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                Rp
              </div>
              <input
                type="text"
                inputMode="numeric"
                required
                value={amountStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setAmountStr(raw ? Number(raw).toLocaleString("id-ID") : "");
                }}
                placeholder="0"
                className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
              {amountStr && (
                <button
                  type="button"
                  onClick={() => setAmountStr("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Increment & Preset Chips */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Nominal Cepat
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickSelect(val)}
                  className={`text-xs px-2.5 py-1.5 rounded-xl font-semibold border transition ${
                    numericAmount === val
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                  }`}
                >
                  {formatRupiah(val)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleQuickAdd(100000)}
                className="text-[11px] px-2.5 py-1 rounded-lg font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                +100 rb
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(500000)}
                className="text-[11px] px-2.5 py-1 rounded-lg font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                +500 rb
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(1000000)}
                className="text-[11px] px-2.5 py-1 rounded-lg font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                +1 jt
              </button>
            </div>
          </div>

          {/* Live Analysis Preview */}
          {numericAmount > 0 && (
            <div
              className={`rounded-2xl p-3.5 border transition-all ${
                remaining >= 0
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-rose-50/70 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-800 text-rose-900 dark:text-rose-300"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5">
                  {remaining < 0 ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                  )}
                  {remaining >= 0 ? "Status Anggaran: Aman" : "Status: Melebihi Batas"}
                </span>
                <span>{percentage.toFixed(0)}% terpakai</span>
              </div>

              <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    percentage > 100
                      ? "bg-rose-600 dark:bg-rose-500"
                      : percentage >= 80
                      ? "bg-amber-500 dark:bg-amber-400"
                      : "bg-emerald-600"
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px]">
                <span className="opacity-75">
                  {remaining >= 0 ? "Sisa batas pagu:" : "Defisit anggaran saat ini:"}
                </span>
                <span className="font-extrabold">
                  {remaining >= 0 ? formatRupiah(remaining) : formatRupiah(Math.abs(remaining))}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            {hasExistingBudget && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-3.5 py-3 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0"
                title="Hapus Pagu Anggaran"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading || numericAmount < 0}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-white" />
              {loading ? "Menyimpan..." : "Simpan Anggaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
