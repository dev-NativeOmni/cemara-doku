"use client";

import React, { useState } from "react";
import { Budget, Category, Transaction } from "@/types";
import { formatRupiah, getMonthName } from "@/lib/formatters";
import { DynamicIcon } from "../ui/DynamicIcon";
import { CategoryBudgetModal } from "./CategoryBudgetModal";
import { MonthSelector } from "../ui/MonthSelector";
import {
  PieChart,
  Plus,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Copy,
  ChevronRight,
  TrendingDown,
  Filter,
} from "lucide-react";

interface BudgetsViewProps {
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  currentMonth: number;
  currentYear: number;
  onSaveBudget: (categoryId: string, limitAmount: number) => Promise<void>;
  onDeleteBudget?: (categoryId: string) => Promise<void>;
  onCopyPreviousMonth?: () => Promise<number>;
  onMonthChange?: (month: number, year: number) => void;
}

export function BudgetsView({
  categories,
  budgets,
  transactions,
  currentMonth,
  currentYear,
  onSaveBudget,
  onDeleteBudget,
  onCopyPreviousMonth,
  onMonthChange,
}: BudgetsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "budgeted" | "unbudgeted">("all");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copying, setCopying] = useState(false);

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
  const overallRemaining = totalBudgeted - totalSpent;

  // Filtered categories
  const filteredCategories = expenseCategories.filter((cat) => {
    const budget = budgets.find((b) => b.categoryId === cat.id);
    const hasBudget = (budget?.limitAmount || 0) > 0;

    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterTab === "budgeted") return hasBudget;
    if (filterTab === "unbudgeted") return !hasBudget;
    return true;
  });

  const budgetedCount = expenseCategories.filter((cat) =>
    budgets.some((b) => b.categoryId === cat.id && b.limitAmount > 0)
  ).length;
  const unbudgetedCount = expenseCategories.length - budgetedCount;

  const handleOpenBudgetModal = (cat: Category) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  const handleCopyMonth = async () => {
    if (!onCopyPreviousMonth) return;
    if (!confirm(`Salin pagu anggaran dari bulan sebelumnya ke bulan ${getMonthName(currentMonth - 1)} ${currentYear}?`)) {
      return;
    }
    setCopying(true);
    try {
      const count = await onCopyPreviousMonth();
      if (count > 0) {
        alert(`Berhasil menyalin ${count} pagu anggaran dari bulan lalu.`);
      } else {
        alert("Tidak ada pagu anggaran di bulan lalu untuk disalin.");
      }
    } catch (err) {
      console.error("Gagal menyalin anggaran:", err);
      alert("Gagal menyalin pagu anggaran.");
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="space-y-5 pb-28 max-w-5xl lg:max-w-7xl mx-auto px-4 lg:px-0 pt-3 lg:pt-0">
      {/* Month Selector on Mobile / Tablet */}
      {onMonthChange && (
        <div className="block lg:hidden">
          <MonthSelector
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthChange={onMonthChange}
          />
        </div>
      )}

      {/* Overall Budget Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-white">
                Total Anggaran Bulanan
              </h3>
              <p className="text-xs text-slate-400">
                {getMonthName(currentMonth - 1)} {currentYear} • {budgetedCount} dari {expenseCategories.length} Kategori Dibatasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onCopyPreviousMonth && (
              <button
                onClick={handleCopyMonth}
                disabled={copying}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition disabled:opacity-50"
                title="Salin pagu dari bulan lalu"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>{copying ? "Menyalin..." : "Salin Bulan Lalu"}</span>
              </button>
            )}

            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                totalBudgeted === 0
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  : overallPercentage > 100
                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                  : overallPercentage >= 80
                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                  : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              }`}
            >
              {totalBudgeted > 0 ? `${overallPercentage.toFixed(0)}% Terpakai` : "Belum Ada Pagu"}
            </span>
          </div>
        </div>

        {/* Realization & Budget Stats Bento */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="bg-slate-50/70 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100/80 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 block">Total Pagu</span>
            <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-white tracking-tight">
              {formatRupiah(totalBudgeted)}
            </span>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100/80 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 block">Realisasi</span>
            <span className="text-xs md:text-sm font-bold text-rose-600 dark:text-rose-400 tracking-tight">
              {formatRupiah(totalSpent)}
            </span>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100/80 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 block">
              {overallRemaining >= 0 ? "Sisa Anggaran" : "Defisit"}
            </span>
            <span
              className={`text-xs md:text-sm font-bold tracking-tight ${
                overallRemaining >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatRupiah(Math.abs(overallRemaining))}
            </span>
          </div>
        </div>

        {/* Global Progress bar */}
        {totalBudgeted > 0 && (
          <div className="space-y-1 pt-1">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPercentage > 100
                    ? "bg-rose-500"
                    : overallPercentage >= 80
                    ? "bg-amber-500"
                    : "bg-emerald-600"
                }`}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Budgets Management Section */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm md:text-base">
            Pagu Anggaran per Kategori
          </h3>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterTab === "all"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Semua ({expenseCategories.length})
            </button>
            <button
              onClick={() => setFilterTab("budgeted")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterTab === "budgeted"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Ada Pagu ({budgetedCount})
            </button>
            <button
              onClick={() => setFilterTab("unbudgeted")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterTab === "unbudgeted"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Belum Diatur ({unbudgetedCount})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kategori pengeluaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs md:text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm"
          />
        </div>

        {/* Categories List */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Tidak ada kategori yang cocok</p>
            <p className="text-xs text-slate-400">
              Coba ganti filter atau cari dengan kata kunci lain.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCategories.map((cat) => {
              const budget = budgets.find((b) => b.categoryId === cat.id);
              const limit = budget?.limitAmount || 0;
              const spent = categorySpending[cat.id] || 0;
              const hasBudget = limit > 0;
              const percentage = hasBudget ? (spent / limit) * 100 : 0;
              const remaining = limit - spent;

              return (
                <div
                  key={cat.id}
                  onClick={() => handleOpenBudgetModal(cat)}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all cursor-pointer group shadow-sm hover:shadow-md hover:border-emerald-500/40 ${
                    hasBudget
                      ? "border-slate-100 dark:border-slate-800"
                      : "border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition group-hover:scale-105"
                        style={{ backgroundColor: cat.color || "#10B981" }}
                      >
                        <DynamicIcon name={cat.icon} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition">
                          {cat.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Realisasi:{" "}
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {formatRupiah(spent)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Right side: Limit or + Set Button */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasBudget ? (
                        <div className="text-right">
                          <p className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-white">
                            {formatRupiah(limit)}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              percentage > 100
                                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                                : percentage >= 80
                                ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            }`}
                          >
                            {percentage.toFixed(0)}% pagu
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-bold transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Atur Pagu</span>
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  {/* Progress bar if budget exists */}
                  {hasBudget && (
                    <div className="space-y-1.5 pt-3 border-t border-slate-50 dark:border-slate-800 mt-3">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentage > 100
                              ? "bg-rose-500"
                              : percentage >= 80
                              ? "bg-amber-500"
                              : "bg-emerald-600"
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-medium">
                          {remaining >= 0 ? "Sisa pagu:" : "Defisit:"}
                        </span>
                        <span
                          className={`font-bold ${
                            remaining >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {remaining >= 0
                            ? formatRupiah(remaining)
                            : formatRupiah(Math.abs(remaining))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Budget Modal */}
      {selectedCategory && (
        <CategoryBudgetModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
          budget={budgets.find((b) => b.categoryId === selectedCategory.id) || null}
          spent={categorySpending[selectedCategory.id] || 0}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onSave={onSaveBudget}
          onDelete={onDeleteBudget}
        />
      )}
    </div>
  );
}
