"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { recordTransaction } from "@/services/transactionService";
import { createCategory } from "@/services/categoryService";
import { Category, TransactionType, Wallet } from "@/types";
import { DynamicIcon } from "../ui/DynamicIcon";
import { CategoryModal } from "../categories/CategoryModal";
import { formatRupiah } from "@/lib/formatters";
import { X, Calendar, FileText, CheckCircle2, AlertCircle, Plus, Camera, Sparkles } from "lucide-react";
import { ReceiptScannerModal } from "./ReceiptScannerModal";

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  categories: Category[];
  onSuccess: () => void;
}

export function QuickTransactionModal({
  isOpen,
  onClose,
  wallets,
  categories,
  onSuccess,
}: QuickTransactionModalProps) {
  const { user, household, userProfile } = useAuth();

  const [type, setType] = useState<TransactionType>("expense");
  const [rawAmount, setRawAmount] = useState<string>("");
  const [walletId, setWalletId] = useState<string>("");
  const [destWalletId, setDestWalletId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Initialize defaults
      const today = new Date().toISOString().split("T")[0];
      setDateStr(today);
      setRawAmount("");
      setNotes("");
      setError(null);

      // Default wallet
      if (wallets.length > 0) {
        setWalletId(wallets[0].id);
        if (wallets.length > 1) {
          setDestWalletId(wallets[1].id);
        }
      }

      // Default category
      const availableCategories = categories.filter((c) => c.type === type);
      if (availableCategories.length > 0) {
        setCategoryId(availableCategories[0].id);
      }
    }
  }, [isOpen, wallets, categories, type]);

  if (!isOpen) return null;

  const currentCategories = categories.filter((c) => c.type === (type === "transfer" ? "expense" : type));

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setRawAmount(val ? Number(val).toLocaleString("id-ID") : "");
  };

  const handleQuickAmount = (val: number) => {
    const current = parseInt(rawAmount.replace(/\D/g, "") || "0", 10);
    const updated = current + val;
    setRawAmount(updated.toLocaleString("id-ID"));
  };

  const handleApplyReceiptResult = (result: {
    amount: number;
    merchantName?: string;
    date?: string;
    categoryKeyword?: string;
  }) => {
    if (result.amount > 0) {
      setRawAmount(result.amount.toLocaleString("id-ID"));
    }
    if (result.merchantName) {
      setNotes(result.merchantName);
    }
    if (result.date) {
      setDateStr(result.date);
    }
    if (result.categoryKeyword) {
      const match = currentCategories.find((c) =>
        c.name.toLowerCase().includes(result.categoryKeyword!.toLowerCase())
      );
      if (match) {
        setCategoryId(match.id);
      }
    }
    setType("expense");
  };

  const handleSaveNewCategory = async (catData: Omit<Category, "id">) => {
    if (!household) throw new Error("No household");
    const newId = await createCategory(household.id, catData);
    setCategoryId(newId);
    return newId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = parseInt(rawAmount.replace(/\D/g, "") || "0", 10);
    if (isNaN(amount) || amount <= 0) {
      setError("Masukkan nominal transaksi yang valid");
      return;
    }

    if (!walletId) {
      setError("Pilih dompet sumber dana");
      return;
    }

    if (type === "transfer") {
      if (!destWalletId) {
        setError("Pilih dompet tujuan transfer");
        return;
      }
      if (walletId === destWalletId) {
        setError("Dompet asal dan tujuan tidak boleh sama");
        return;
      }
    } else {
      if (!categoryId) {
        setError("Pilih kategori transaksi");
        return;
      }
    }

    if (!household) {
      setError("Gagal memproses: Buku kas tidak ditemukan");
      return;
    }

    setLoading(true);
    try {
      const selectedDate = dateStr ? new Date(dateStr) : new Date();

      await recordTransaction(household.id, {
        type,
        amount,
        walletId,
        destinationWalletId: type === "transfer" ? destWalletId : undefined,
        categoryId: type !== "transfer" ? categoryId : undefined,
        transactionDate: selectedDate,
        notes: notes.trim(),
        createdById: user?.uid || "",
        creatorName: userProfile?.displayName || user?.email || "Anggota",
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menyimpan transaksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800">
          {/* Modal Header & Tabs */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/80 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Catat Transaksi</h3>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReceiptScannerOpen(true)}
                  className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  title="Pindai struk belanja otomatis"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Struk</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Type Segment Control */}
            <div className="grid grid-cols-3 gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => { setType("expense"); setError(null); }}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  type === "expense"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => { setType("income"); setError(null); }}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  type === "income"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => { setType("transfer"); setError(null); }}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  type === "transfer"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Transfer
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Amount Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nominal Transaksi</label>
                <button
                  type="button"
                  onClick={() => setIsReceiptScannerOpen(true)}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Foto Struk Belanja</span>
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  autoFocus
                  required
                  value={rawAmount}
                  onChange={handleAmountChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>

              {/* Quick Nominal Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[10000, 20000, 50000, 100000, 250000, 500000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition"
                  >
                    +{formatRupiah(val).replace(",00", "").replace("Rp", "").trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet Selection (Source) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {type === "transfer" ? "Dari Dompet (Asal)" : "Sumber Dompet / Rekening"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWalletId(w.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                      walletId === w.id
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: w.color || "#10B981" }}
                    >
                      <DynamicIcon name={w.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{w.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{formatRupiah(w.currentBalance)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Wallet for Transfer */}
            {type === "transfer" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ke Dompet (Tujuan)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {wallets.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      disabled={w.id === walletId}
                      onClick={() => setDestWalletId(w.id)}
                      className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition disabled:opacity-30 ${
                        destWalletId === w.id
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: w.color || "#10B981" }}
                      >
                        <DynamicIcon name={w.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">{w.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{formatRupiah(w.currentBalance)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Grid (for income / expense) */}
            {type !== "transfer" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Kategori</label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Kategori Kustom</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
                  {currentCategories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center gap-1.5 transition ${
                        categoryId === c.id
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-sm ring-2 ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: c.color || "#10B981" }}
                      >
                        <DynamicIcon name={c.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold truncate w-full">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date & Note Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tanggal</span>
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Catatan (Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Makan siang bareng anak"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* Submit Buttons */}
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
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{loading ? "Menyimpan..." : "Simpan Transaksi"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Inline Create Custom Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        defaultType={type === "income" ? "income" : "expense"}
        onSave={handleSaveNewCategory}
        onCreated={(id) => {
          setCategoryId(id);
          setIsCategoryModalOpen(false);
        }}
      />

      {/* OCR Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        onApplyResult={handleApplyReceiptResult}
      />
    </>
  );
}

