"use client";

import React from "react";
import { Transaction, Category, Wallet, Budget, Household } from "@/types";
import { formatRupiah, formatDateTime, getMonthName } from "@/lib/formatters";
import { X, Printer, Download, FileText, CheckCircle2 } from "lucide-react";

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household | null;
  currentMonth: number;
  currentYear: number;
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  budgets: Budget[];
}

export function MonthlyReportModal({
  isOpen,
  onClose,
  household,
  currentMonth,
  currentYear,
  transactions,
  wallets,
  categories,
  budgets,
}: MonthlyReportModalProps) {
  if (!isOpen) return null;

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = totalIncome - totalExpense;
  const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.currentBalance || 0), 0);

  // Category expense breakdown
  const categoryExpenses: { [catId: string]: number } = {};
  transactions
    .filter((t) => t.type === "expense" && t.categoryId)
    .forEach((t) => {
      categoryExpenses[t.categoryId!] = (categoryExpenses[t.categoryId!] || 0) + t.amount;
    });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-none sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-screen sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Action Bar (Hidden on print) */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
              Laporan Keuangan Bulanan
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[#0F2C59] via-[#153464] to-[#1A365D] hover:from-[#0A1F3F] hover:to-[#0F2C59] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0F2C59]/20 border border-amber-400/25 flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 bg-white" id="printable-report">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Cemara" className="w-8 h-8 object-contain" />
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  {household?.name || "Keluarga Cemara"}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Laporan Arus Kas & Realisasi Anggaran Rumah Tangga
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Periode Laporan
              </span>
              <span className="text-sm font-extrabold text-slate-900">
                {getMonthName(currentMonth - 1)} {currentYear}
              </span>
            </div>
          </div>

          {/* Executive Summary Bento */}
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Total Pemasukan
              </span>
              <span className="text-base font-extrabold text-emerald-700 block mt-1">
                {formatRupiah(totalIncome)}
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Total Pengeluaran
              </span>
              <span className="text-base font-extrabold text-rose-700 block mt-1">
                {formatRupiah(totalExpense)}
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Arus Kas Bersih (Net)
              </span>
              <span
                className={`text-base font-extrabold block mt-1 ${
                  netCashflow >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {netCashflow >= 0 ? `+${formatRupiah(netCashflow)}` : formatRupiah(netCashflow)}
              </span>
            </div>
          </div>

          {/* Category Budget Realization */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
              Realisasi Anggaran per Kategori
            </h3>

            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-2">Kategori</th>
                  <th className="py-2 text-right">Pagu Target</th>
                  <th className="py-2 text-right">Realisasi</th>
                  <th className="py-2 text-right">Sisa / Defisit</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories
                  .filter((c) => c.type === "expense")
                  .map((cat) => {
                    const budget = budgets.find((b) => b.categoryId === cat.id);
                    const limit = budget?.limitAmount || 0;
                    const spent = categoryExpenses[cat.id] || 0;
                    if (limit === 0 && spent === 0) return null;

                    const remaining = limit - spent;

                    return (
                      <tr key={cat.id}>
                        <td className="py-2 font-semibold text-slate-800">{cat.name}</td>
                        <td className="py-2 text-right text-slate-600">
                          {limit > 0 ? formatRupiah(limit) : "-"}
                        </td>
                        <td className="py-2 text-right font-bold text-slate-900">
                          {formatRupiah(spent)}
                        </td>
                        <td
                          className={`py-2 text-right font-bold ${
                            remaining >= 0 ? "text-slate-700" : "text-rose-600"
                          }`}
                        >
                          {limit > 0 ? formatRupiah(remaining) : "-"}
                        </td>
                        <td className="py-2 text-right">
                          {limit > 0 ? (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                remaining >= 0
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {remaining >= 0 ? "Aman" : "Defisit"}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Tanpa Pagu</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Transaction History Table */}
          <div className="space-y-2.5 pt-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
              Rincian Riwayat Transaksi ({transactions.length} Catatan)
            </h3>

            {transactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Tidak ada transaksi tercatat pada periode ini.
              </p>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-2">Tanggal</th>
                    <th className="py-2">Keterangan / Kategori</th>
                    <th className="py-2">Sumber Dompet</th>
                    <th className="py-2">Pencatat</th>
                    <th className="py-2 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => {
                    const category = categories.find((c) => c.id === tx.categoryId);
                    const wallet = wallets.find((w) => w.id === tx.walletId);
                    const destWallet = wallets.find((w) => w.id === tx.destinationWalletId);

                    return (
                      <tr key={tx.id}>
                        <td className="py-2 text-slate-500 whitespace-nowrap">
                          {formatDateTime(tx.transactionDate)}
                        </td>
                        <td className="py-2 font-medium text-slate-800">
                          {tx.type === "transfer"
                            ? `Transfer: ${wallet?.name} → ${destWallet?.name}`
                            : category?.name || tx.notes || "Transaksi"}
                          {tx.notes && category?.name && (
                            <span className="text-slate-400 block text-[10px]">{tx.notes}</span>
                          )}
                        </td>
                        <td className="py-2 text-slate-600">{wallet?.name || "-"}</td>
                        <td className="py-2 text-slate-600">{tx.creatorName || "Anggota"}</td>
                        <td
                          className={`py-2 text-right font-bold whitespace-nowrap ${
                            tx.type === "income"
                              ? "text-emerald-700"
                              : tx.type === "expense"
                              ? "text-rose-700"
                              : "text-indigo-700"
                          }`}
                        >
                          {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                          {formatRupiah(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
            Dicetak secara otomatis dari Cemara (Aplikasi Keuangan Rumah Tangga) • {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
          </div>
        </div>
      </div>
    </div>
  );
}

