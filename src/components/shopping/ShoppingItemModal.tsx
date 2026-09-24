"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ShoppingItem, Category } from "@/types";
import { X, Check, ShoppingBag, Plus } from "lucide-react";

interface ShoppingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShoppingItem | null;
  categories: Category[];
  onSave: (data: Omit<ShoppingItem, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  currentUserName?: string;
  currentUserId: string;
}

export function ShoppingItemModal({
  isOpen,
  onClose,
  item,
  categories,
  onSave,
  currentUserName,
  currentUserId,
}: ShoppingItemModalProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [estimatedPriceStr, setEstimatedPriceStr] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setName(item.name);
        setQuantity(item.quantity || "");
        setEstimatedPriceStr(item.estimatedPrice ? item.estimatedPrice.toLocaleString("id-ID") : "");
        setCategoryId(item.categoryId || "");
      } else {
        setName("");
        setQuantity("");
        setEstimatedPriceStr("");
        setCategoryId(expenseCategories[0]?.id || "");
      }
    }
  }, [isOpen, item, expenseCategories]);

  if (!isOpen) return null;

  const estimatedPrice = parseInt(estimatedPriceStr.replace(/\D/g, "") || "0", 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Masukkan nama barang yang ingin dibeli");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        quantity: quantity.trim() || undefined,
        estimatedPrice: estimatedPrice > 0 ? estimatedPrice : undefined,
        categoryId: categoryId || undefined,
        isCompleted: item ? item.isCompleted : false,
        addedById: item ? item.addedById : currentUserId,
        addedByName: item ? item.addedByName : currentUserName || "Anggota",
      });
      onClose();
    } catch (err) {
      console.error("Gagal simpan barang belanjaan:", err);
      alert("Gagal menyimpan barang belanjaan.");
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
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                {item ? "Ubah Kebutuhan Belanja" : "Tambah Kebutuhan Belanja"}
              </h3>
              <p className="text-xs text-slate-400">Catat titipan belanja rumah tangga</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Nama Barang / Kebutuhan
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Contoh: Beras 5kg, Minyak Goreng 2L, Sabun Cuci"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Quantity & Estimated Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Jumlah / Satuan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Misal: 2 botol, 1 kg"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Estimasi Harga (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={estimatedPriceStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setEstimatedPriceStr(raw ? Number(raw).toLocaleString("id-ID") : "");
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Kategori Pengeluaran
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
              disabled={loading || !name.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Menyimpan..." : item ? "Simpan Perubahan" : "Tambah ke Daftar"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

