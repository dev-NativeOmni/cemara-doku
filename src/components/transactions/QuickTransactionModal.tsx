"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { recordTransaction } from "@/services/transactionService";
import { createCategory } from "@/services/categoryService";
import { Category, TransactionType, Wallet } from "@/types";
import { DynamicIcon } from "../ui/DynamicIcon";
import { CategoryModal } from "../categories/CategoryModal";
import { formatRupiah } from "@/lib/formatters";
import { X, Calendar, FileText, CheckCircle2, AlertCircle, Plus } from "lucide-react";

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
  }, [isOpen, type, wallets, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);
  const parsedAmount = parseInt(rawAmount.replace(/\D/g, "") || "0", 10);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, "");
    setRawAmount(numericOnly);
  };

  const handleSaveCustomCategory = async (newCatData: Omit<Category, "id">): Promise<string> => {
    if (!household) throw new Error("Rumah tangga tidak ditemukan");
    const newId = await createCategory(household.id, newCatData);
    await onSuccess(); // Refresh data
    setCategoryId(newId);
    return newId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household) return;

    if (parsedAmount <= 0) {
      setError("Masukkan nominal transaksi yang valid");
      return;
    }

    if (!walletId) {
      setError("Pilih dompet sumber transaksi");
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

    setError(null);
    setLoading(true);

    try {
      const selectedDate = new Date(dateStr);
      // keep current hours & minutes for precise chronological sorting
      const now = new Date();
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

      await recordTransaction(household.id, {
        type,
        amount: parsedAmount,
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
        <div className="w-full max-w-lg bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
          {/* Modal Header & Tabs */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">Catat Transaksi</h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type Segment Control */}
            <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => { setType("expense"); setError(null); }}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  type === "expense"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                    : "text-slate-600 hover:text-slate-900"
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
                    : "text-slate-600 hover:text-slate-900"
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
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Transfer
              </button>
            </div>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Big Amount Input */}
            <div className="text-center py-2 bg-slate-50/80 rounded-2xl border border-slate-100 p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Nominal ({type === "expense" ? "Keluar" : type === "income" ? "Masuk" : "Mutasi"})
              </span>
              <div className="flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-400 mr-2">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={rawAmount ? Number(rawAmount).toLocaleString("id-ID") : ""}
                  onChange={handleAmountChange}
                  placeholder="0"
                  autoFocus
                  required
                  className="text-3xl font-extrabold text-slate-800 bg-transparent text-center focus:outline-none w-full max-w-[240px]"
                />
              </div>
              {parsedAmount > 0 && (
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  {formatRupiah(parsedAmount)}
                </p>
              )}
            </div>

            {/* Wallets Selection */}
            {type === "transfer" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Dari Dompet
                  </label>
                  <select
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({formatRupiah(w.currentBalance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Ke Dompet
                  </label>
                  <select
                    value={destWalletId}
                    onChange={(e) => setDestWalletId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({formatRupiah(w.currentBalance)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Sumber Dompet
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {wallets.map((w) => (
                    <button
                      type="button"
                      key={w.id}
                      onClick={() => setWalletId(w.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${
                        walletId === w.id
                          ? "border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold shadow-sm"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 text-xs shadow-sm"
                        style={{ backgroundColor: w.color || "#10B981" }}
                      >
                        <DynamicIcon name={w.icon} className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs truncate">{w.name}</p>
                        <p className="text-[10px] text-slate-400 font-normal truncate">
                          {formatRupiah(w.currentBalance)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Grid (for Expense & Income) */}
            {type !== "transfer" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600">
                    Kategori {type === "expense" ? "Pengeluaran" : "Pemasukan"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Kategori Baru</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {filteredCategories.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setCategoryId(c.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition gap-1.5 ${
                        categoryId === c.id
                          ? "border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold shadow-sm ring-1 ring-emerald-500"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: c.color || "#10B981" }}
                      >
                        <DynamicIcon name={c.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] leading-tight line-clamp-1">{c.name}</span>
                    </button>
                  ))}

                  {/* Add New Category Quick Pill */}
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="p-2 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/40 text-slate-500 hover:text-emerald-700 flex flex-col items-center justify-center text-center transition gap-1.5 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-200 group-hover:bg-emerald-100 flex items-center justify-center text-slate-600 group-hover:text-emerald-700 shrink-0 transition">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium leading-tight">Tambah Baru</span>
                  </button>
                </div>
              </div>
            )}

            {/* Date and Notes Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tanggal Transaksi</span>
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Catatan (Opsional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Belanja mingguan, Bensin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || parsedAmount <= 0}
                className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                  type === "expense"
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                    : type === "income"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {loading ? "Menyimpan Transaksi..." : `Simpan ${type === "expense" ? "Pengeluaran" : type === "income" ? "Pemasukan" : "Transfer"}`}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category Creation Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        defaultType={type === "income" ? "income" : "expense"}
        onSave={handleSaveCustomCategory}
      />
    </>
  );
}
