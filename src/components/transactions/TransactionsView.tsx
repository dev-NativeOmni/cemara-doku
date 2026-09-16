"use client";

import React, { useState } from "react";
import { Category, Transaction, TransactionType, Wallet } from "@/types";
import { formatRupiah, formatDateTime, formatDate } from "@/lib/formatters";
import { DynamicIcon } from "../ui/DynamicIcon";
import {
  Search,
  Download,
  Filter,
  Trash2,
  Calendar,
  Layers,
  Wallet as WalletIcon,
  X,
} from "lucide-react";

interface TransactionsViewProps {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  onDeleteTransaction: (tx: Transaction) => void;
  onOpenQuickModal: () => void;
}

export function TransactionsView({
  transactions,
  wallets,
  categories,
  onDeleteTransaction,
  onOpenQuickModal,
}: TransactionsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedWallet, setSelectedWallet] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filter transactions
  const filtered = transactions.filter((t) => {
    // Type
    if (selectedType !== "all" && t.type !== selectedType) return false;
    // Wallet
    if (
      selectedWallet !== "all" &&
      t.walletId !== selectedWallet &&
      t.destinationWalletId !== selectedWallet
    )
      return false;
    // Category
    if (selectedCategory !== "all" && t.categoryId !== selectedCategory) return false;
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const notesMatch = t.notes?.toLowerCase().includes(q);
      const cat = categories.find((c) => c.id === t.categoryId);
      const catMatch = cat?.name.toLowerCase().includes(q);
      const w = wallets.find((w) => w.id === t.walletId);
      const walletMatch = w?.name.toLowerCase().includes(q);
      if (!notesMatch && !catMatch && !walletMatch) return false;
    }
    return true;
  });

  // Calculate sum of filtered items
  const filteredIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filtered
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // CSV Export handler
  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = ["ID", "Tanggal", "Tipe", "Kategori", "Dari Dompet", "Ke Dompet", "Nominal (IDR)", "Catatan", "Oleh"];
    const rows = filtered.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId)?.name || "";
      const sourceW = wallets.find((w) => w.id === t.walletId)?.name || "";
      const destW = wallets.find((w) => w.id === t.destinationWalletId)?.name || "";
      const formattedDate = formatDate(t.transactionDate);
      return [
        `"${t.id}"`,
        `"${formattedDate}"`,
        `"${t.type}"`,
        `"${cat}"`,
        `"${sourceW}"`,
        `"${destW}"`,
        t.amount,
        `"${(t.notes || "").replace(/"/g, '""')}"`,
        `"${t.creatorName || ""}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cemara_transaksi_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Search & Actions Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi atau catatan..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl border flex items-center justify-center transition shadow-sm ${
            showFilters || selectedType !== "all" || selectedWallet !== "all" || selectedCategory !== "all"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
          title="Filter Transaksi"
        >
          <Filter className="w-4 h-4" />
        </button>

        <button
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 transition shadow-sm"
          title="Unduh CSV"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-700">Filter Transaksi</span>
            {(selectedType !== "all" || selectedWallet !== "all" || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSelectedType("all");
                  setSelectedWallet("all");
                  setSelectedCategory("all");
                }}
                className="text-[11px] text-rose-500 font-semibold hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Jenis</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
              >
                <option value="all">Semua Jenis</option>
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
                <option value="transfer">Transfer / Mutasi</option>
              </select>
            </div>

            {/* Wallet */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Dompet</label>
              <select
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
              >
                <option value="all">Semua Dompet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Filter Summary Banner */}
      <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
        <span>Menampilkan <b>{filtered.length}</b> transaksi</span>
        <div className="flex items-center gap-3 font-semibold">
          <span className="text-emerald-600">+{formatRupiah(filteredIncome)}</span>
          <span className="text-rose-600">-{formatRupiah(filteredExpense)}</span>
        </div>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm space-y-3">
          <p className="text-sm text-slate-400">Tidak ada transaksi yang cocok dengan filter</p>
          <button
            onClick={onOpenQuickModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
          >
            + Catat Transaksi Baru
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {filtered.map((tx) => {
            const category = categories.find((c) => c.id === tx.categoryId);
            const sourceWallet = wallets.find((w) => w.id === tx.walletId);
            const destWallet = wallets.find((w) => w.id === tx.destinationWalletId);

            return (
              <div
                key={tx.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition group"
              >
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
                          : category?.icon || (tx.type === "income" ? "TrendingUp" : "ShoppingBag")
                      }
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
                      {tx.notes ? <span className="text-slate-600 font-medium">{tx.notes} • </span> : null}
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
  );
}

