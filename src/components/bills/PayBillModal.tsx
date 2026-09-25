"use client";

import React, { useState } from "react";
import { RecurringBill, Wallet } from "@/types";
import { formatRupiah, getMonthName } from "@/lib/formatters";
import { DynamicIcon } from "../ui/DynamicIcon";
import { X, Check, ArrowRight, Wallet as WalletIcon, Calendar } from "lucide-react";

interface PayBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: RecurringBill | null;
  wallets: Wallet[];
  currentMonth: number;
  currentYear: number;
  onPay: (billId: string, walletId: string, amount: number) => Promise<void>;
}

// Content is mounted fresh on every open, so form state initializes from props
// without effects (and live data updates never reset what the user is typing).
export function PayBillModal(props: PayBillModalProps) {
  if (!props.isOpen || !props.bill) return null;
  return <PayBillModalContent key={props.bill.id} {...props} bill={props.bill} />;
}

function PayBillModalContent({
  onClose,
  bill,
  wallets,
  currentMonth,
  currentYear,
  onPay,
}: PayBillModalProps & { bill: RecurringBill }) {
  const [selectedWalletId, setSelectedWalletId] = useState(
    () => bill.walletId || wallets[0]?.id || ""
  );
  const [amountStr, setAmountStr] = useState(() => bill.amount.toLocaleString("id-ID"));
  const [loading, setLoading] = useState(false);

  const numericAmount = parseInt(amountStr.replace(/\D/g, "") || "0", 10);
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) {
      alert("Masukkan nominal pembayaran yang valid");
      return;
    }

    if (selectedWallet && selectedWallet.currentBalance < numericAmount) {
      if (!confirm(`Saldo dompet ${selectedWallet.name} (${formatRupiah(selectedWallet.currentBalance)}) kurang dari tagihan. Tetap lanjutkan?`)) {
        return;
      }
    }

    setLoading(true);
    try {
      await onPay(bill.id, selectedWalletId, numericAmount);
      onClose();
    } catch (err) {
      console.error("Gagal bayar tagihan:", err);
      alert("Gagal memproses pembayaran tagihan.");
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
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: bill.color || "#10B981" }}
            >
              <DynamicIcon name={bill.icon || "Receipt"} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                Bayar {bill.title}
              </h3>
              <p className="text-xs text-slate-400">
                Periode: {getMonthName(currentMonth - 1)} {currentYear}
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
          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Nominal yang Dibayar (Rp)
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

          {/* Bill Info Banner */}
          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl space-y-1 text-xs">
            <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Jatuh Tempo: Setiap tanggal {bill.dueDay}</span>
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Pembayaran ini akan langsung tercatat sebagai transaksi pengeluaran dan memotong saldo dompet yang Anda pilih.
            </p>
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
              <span>{loading ? "Memproses..." : "Konfirmasi Bayar"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
