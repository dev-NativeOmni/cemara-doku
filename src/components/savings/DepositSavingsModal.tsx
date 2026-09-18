"use client";

import React, { useState } from "react";
import { SavingsGoal, Wallet } from "@/types";
import { formatRupiah } from "@/lib/formatters";
import { DynamicIcon } from "../ui/DynamicIcon";
import { X, Check, ArrowRight, Wallet as WalletIcon } from "lucide-react";

interface DepositSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  wallets: Wallet[];
  onDeposit: (goalId: string, amount: number, walletId?: string) => Promise<void>;
}

const QUICK_AMOUNTS = [50000, 100000, 250000, 500000, 1000000, 2000000];

export function DepositSavingsModal({
  isOpen,
  onClose,
  goal,
  wallets,
  onDeposit,
}: DepositSavingsModalProps) {
  const [amountStr, setAmountStr] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || "");
  const [deductWallet, setDeductWallet] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !goal) return null;

  const numericAmount = parseInt(amountStr.replace(/\D/g, "") || "0", 10);
  const remainingNeeded = Math.max(0, goal.targetAmount - goal.currentAmount);

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) {
      alert("Masukkan nominal tabungan yang valid");
      return;
    }

    if (deductWallet && selectedWallet && selectedWallet.currentBalance < numericAmount) {
      if (!confirm("Saldo dompet tidak mencukupi, tetap lanjutkan?")) return;
    }

    setLoading(true);
    try {
      await onDeposit(goal.id, numericAmount, deductWallet ? selectedWalletId : undefined);
      setAmountStr("");
      onClose();
    } catch (err) {
      console.error("Gagal menyetor tabungan:", err);
      alert("Gagal menambahkan saldo tabungan.");
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
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: goal.color || "#10B981" }}
            >
              <DynamicIcon name={goal.icon} className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Nabung ke {goal.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Sisa target: {formatRupiah(remainingNeeded)}
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
          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Nominal Setoran (Rp)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                Rp
              </div>
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
                placeholder="0"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quick Amounts */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmountStr(val.toLocaleString("id-ID"))}
                className="text-xs px-2.5 py-1 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 hover:border-emerald-400/50 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
              >
                +{formatRupiah(val)}
              </button>
            ))}
          </div>

          {/* Wallet Source Toggle */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deductWallet}
                  onChange={(e) => setDeductWallet(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Potong Saldo Dompet</span>
              </label>
            </div>

            {deductWallet && (
              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Saldo: {formatRupiah(w.currentBalance)})
                  </option>
                ))}
              </select>
            )}
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
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {loading ? "Menyimpan..." : "Setor Tabungan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

