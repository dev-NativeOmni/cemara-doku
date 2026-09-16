"use client";

import React from "react";
import { Category, Transaction, Wallet } from "@/types";
import { formatRupiah, formatDateTime } from "@/lib/formatters";
import { DynamicIcon } from "../ui/DynamicIcon";
import {
  TrendingDown,
  TrendingUp,
  Scale,
  ArrowRight,
  Wallet as WalletIcon,
  ShoppingBag,
  Trash2,
} from "lucide-react";

interface DashboardViewProps {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  onOpenQuickModal: () => void;
  onNavigateToTransactions: () => void;
  onNavigateToWallets: () => void;
  onDeleteTransaction: (tx: Transaction) => void;
}

export function DashboardView({
  wallets,
  categories,
  transactions,
  onOpenQuickModal,
  onNavigateToTransactions,
  onNavigateToWallets,
  onDeleteTransaction,
}: DashboardViewProps) {
  // Calculate month income & expense
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = totalIncome - totalExpense;

  // Category breakdown for expenses
  const categoryExpenses: { [catId: string]: number } = {};
  transactions
    .filter((t) => t.type === "expense" && t.categoryId)
    .forEach((t) => {
      const catId = t.categoryId!;
      categoryExpenses[catId] = (categoryExpenses[catId] || 0) + t.amount;
    });

  const categoryBreakdown = Object.entries(categoryExpenses)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      return {
        id: catId,
        name: cat?.name || "Lainnya",
        color: cat?.color || "#10B981",
        icon: cat?.icon || "MoreHorizontal",
        amount,
        percentage,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Cashflow Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Income Card */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Pemasukan</span>
          </div>
          <div>
            <p className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
              {formatRupiah(totalIncome)}
            </p>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Pengeluaran</span>
          </div>
          <div>
            <p className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
              {formatRupiah(totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Net Cashflow Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Selisih Arus Kas (Net)</p>
            <p
              className={`text-base font-bold ${
                netCashflow >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {netCashflow >= 0 ? `+${formatRupiah(netCashflow)}` : formatRupiah(netCashflow)}
            </p>
          </div>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            netCashflow >= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
          }`}
        >
          {netCashflow >= 0 ? "Surplus" : "Defisit"}
        </span>
      </div>

      {/* Wallets Quick Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <WalletIcon className="w-4 h-4 text-emerald-600" />
            <span>Dompet & Sumber Dana</span>
          </h3>
          <button
            onClick={onNavigateToWallets}
            className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Semua Dompet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {wallets.slice(0, 4).map((w) => (
            <div
              key={w.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: w.color || "#10B981" }}
              >
                <DynamicIcon name={w.icon} className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-700 truncate">{w.name}</p>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {formatRupiah(w.currentBalance)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Distribusi Pengeluaran</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Bulan Ini</span>
          </div>

          <div className="space-y-3">
            {categoryBreakdown.slice(0, 5).map((item) => (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{formatRupiah(item.amount)}</span>
                    <span className="text-slate-400 font-medium w-10 text-right">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Transaksi Terkini</h3>
          <button
            onClick={onNavigateToTransactions}
            className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm space-y-3">
            <p className="text-sm text-slate-400">Belum ada transaksi di bulan ini</p>
            <button
              onClick={onOpenQuickModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
            >
              + Catat Transaksi Pertama
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {recentTransactions.map((tx) => {
              const category = categories.find((c) => c.id === tx.categoryId);
              const sourceWallet = wallets.find((w) => w.id === tx.walletId);
              const destWallet = wallets.find((w) => w.id === tx.destinationWalletId);

              return (
                <div key={tx.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{
                        backgroundColor:
                          tx.type === "transfer"
                            ? "#4F46E5"
                            : category?.color || (tx.type === "income" ? "#10B981" : "#EF4444"),
                      }}
                    >
                      <DynamicIcon
                        name={
                          tx.type === "transfer"
                            ? "ArrowLeftRight"
                            : category?.icon || (tx.type === "income" ? "TrendingUp" : "ShoppingBag")}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {tx.type === "transfer"
                          ? `Mutasi: ${sourceWallet?.name || "Dompet"} → ${destWallet?.name || "Dompet"}`
                          : category?.name || tx.notes || "Transaksi"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {tx.notes ? `${tx.notes} • ` : ""}
                        {sourceWallet?.name} • {formatDateTime(tx.transactionDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-bold ${
                        tx.type === "income"
                          ? "text-emerald-600"
                          : tx.type === "expense"
                          ? "text-rose-600"
                          : "text-indigo-600"
                      }`}
                    >
                      {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                      {formatRupiah(tx.amount)}
                    </span>

                    <button
                      onClick={() => onDeleteTransaction(tx)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 rounded transition"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

