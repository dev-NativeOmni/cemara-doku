"use client";

import React, { useState, useMemo } from "react";
import { ShoppingItem, Wallet, Category } from "@/types";
import { formatRupiah } from "@/lib/formatters";
import { X, Check, ShoppingCart, ArrowRight } from "lucide-react";

interface ShoppingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedItems: ShoppingItem[];
  wallets: Wallet[];
  categories: Category[];
  onCheckout: (
    itemIds: string[],
    totalAmount: number,
    walletId: string,
    categoryId?: string,
    notes?: string
  ) => Promise<void>;
}

// Content is mounted fresh on every open, so form state initializes from props
// without effects (and live data updates never reset what the user is typing).
export function ShoppingCheckoutModal(props: ShoppingCheckoutModalProps) {
  if (!props.isOpen) return null;
  return <ShoppingCheckoutModalContent {...props} />;
}

function ShoppingCheckoutModalContent({
  onClose,
  completedItems,
  wallets,
  categories,
  onCheckout,
}: ShoppingCheckoutModalProps) {
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  // Default total based on items
  const [amountStr, setAmountStr] = useState(() => {
    const calculatedTotal = completedItems.reduce(
      (sum, item) => sum + (item.actualPrice || item.estimatedPrice || 0),
      0
    );
    return calculatedTotal > 0 ? calculatedTotal.toLocaleString("id-ID") : "";
  });
  const [selectedWalletId, setSelectedWalletId] = useState(() => wallets[0]?.id || "");
  const [categoryId, setCategoryId] = useState(() => {
    const defaultCategory =
      expenseCategories.find((c) => c.name.toLowerCase().includes("belanja")) ||
      expenseCategories[0];
    return defaultCategory?.id || "";
  });
  const [notes, setNotes] = useState(() => {
    const itemNames = completedItems.map((i) => i.name).join(", ");
    return `Belanja: ${itemNames.slice(0, 80)}${itemNames.length > 80 ? "..." : ""}`;
  });
  const [loading, setLoading] = useState(false);


  const numericAmount = parseInt(amountStr.replace(/\D/g, "") || "0", 10);
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) {
      alert("Masukkan total nominal belanja yang valid");
      return;
    }

    if (selectedWallet && selectedWallet.currentBalance < numericAmount) {
      if (!confirm(`Saldo dompet ${selectedWallet.name} kurang dari total belanja. Tetap lanjutkan?`)) {
        return;
      }
    }

    setLoading(true);
    try {
      const itemIds = completedItems.map((i) => i.id);
      await onCheckout(
        itemIds,
        numericAmount,
        selectedWalletId,
        categoryId || undefined,
        notes.trim() || undefined
      );
      onClose();
    } catch (err) {
      console.error("Gagal checkout belanjaan:", err);
      alert("Gagal menyelesaikan pembukuan belanja.");
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
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                Selesai Belanja & Bukukan Kas
              </h3>
              <p className="text-xs text-slate-400">
                {completedItems.length} barang siap dicatat ke pengeluaran
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Items Summary Pills */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Daftar Barang yang Dicentang:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {completedItems.map((item) => (
                <span
                  key={item.id}
                  className="px-2.5 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-600 flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{item.name}</span>
                  {item.quantity && <span className="text-slate-400">({item.quantity})</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Total Pengeluaran Belanja (Rp)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-400 text-sm pointer-events-none">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                autoFocus
                value={amountStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setAmountStr(raw ? Number(raw).toLocaleString("id-ID") : "");
                }}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          {/* Wallet Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Sumber Dompet Pembayaran
            </label>
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (Saldo: {formatRupiah(w.currentBalance)})
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Kategori Transaksi
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Keterangan Catatan
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
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
              disabled={loading || numericAmount <= 0}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Menyimpan..." : "Catat ke Kas & Selesai"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

