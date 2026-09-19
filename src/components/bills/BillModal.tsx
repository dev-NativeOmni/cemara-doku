"use client";

import React, { useState, useEffect } from "react";
import { RecurringBill, Category, Wallet } from "@/types";
import { DynamicIcon } from "../ui/DynamicIcon";
import { X, Check, Calendar, AlertCircle } from "lucide-react";

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: RecurringBill | null;
  categories: Category[];
  wallets: Wallet[];
  onSave: (data: Omit<RecurringBill, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

const BILL_ICONS = [
  "Zap",          // Listrik
  "Wifi",         // Internet
  "Droplet",      // Air PDAM
  "HeartPulse",   // BPJS / Asuransi
  "Tv",           // TV / Netflix
  "GraduationCap",// Sekolah / Kuliah
  "Car",          // Cicilan Kendaraan
  "Home",         // KPR / Kontrakan
  "CreditCard",   // Tagihan Kartu Kredit
  "Smartphone",   // Pulsa / Paket Data
  "Flame",        // Gas LPG
  "Sparkles",     // Langganan lain
];

const BILL_COLORS = [
  "#10B981", "#059669", "#0D9488", "#2563EB", "#8B5CF6", "#EC4899", "#F59E0B", "#EF4444"
];

export function BillModal({
  isOpen,
  onClose,
  bill,
  categories,
  wallets,
  onSave,
}: BillModalProps) {
  const [title, setTitle] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [dueDay, setDueDay] = useState<number>(1);
  const [frequency, setFrequency] = useState<"monthly" | "yearly">("monthly");
  const [categoryId, setCategoryId] = useState("");
  const [walletId, setWalletId] = useState("");
  const [icon, setIcon] = useState("Zap");
  const [color, setColor] = useState("#10B981");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  useEffect(() => {
    if (isOpen) {
      if (bill) {
        setTitle(bill.title);
        setAmountStr(bill.amount ? bill.amount.toLocaleString("id-ID") : "");
        setDueDay(bill.dueDay || 1);
        setFrequency(bill.frequency || "monthly");
        setCategoryId(bill.categoryId || expenseCategories[0]?.id || "");
        setWalletId(bill.walletId || wallets[0]?.id || "");
        setIcon(bill.icon || "Zap");
        setColor(bill.color || "#10B981");
        setNotes(bill.notes || "");
      } else {
        setTitle("");
        setAmountStr("");
        setDueDay(1);
        setFrequency("monthly");
        setCategoryId(expenseCategories[0]?.id || "");
        setWalletId(wallets[0]?.id || "");
        setIcon("Zap");
        setColor("#10B981");
        setNotes("");
      }
    }
  }, [isOpen, bill, expenseCategories, wallets]);

  if (!isOpen) return null;

  const numericAmount = parseInt(amountStr.replace(/\D/g, "") || "0", 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || numericAmount <= 0) {
      alert("Harap isi nama tagihan dan nominal tagihan yang valid");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        amount: numericAmount,
        dueDay: Math.min(31, Math.max(1, dueDay)),
        frequency,
        categoryId: categoryId || undefined,
        walletId: walletId || undefined,
        icon,
        color,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error("Gagal menyimpan tagihan:", err);
      alert("Gagal menyimpan data tagihan.");
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
              style={{ backgroundColor: color }}
            >
              <DynamicIcon name={icon} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                {bill ? "Edit Tagihan Rutin" : "Tambah Tagihan Rutin"}
              </h3>
              <p className="text-xs text-slate-400">Pengingat pembayaran berkala keluarga</p>
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
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Nama Tagihan / Langganan
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Listrik PLN, IndiHome, BPJS, Netflix"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Nominal Tagihan (Rp)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-400 text-xs pointer-events-none">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={amountStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setAmountStr(raw ? Number(raw).toLocaleString("id-ID") : "");
                }}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          {/* Due Day & Frequency Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Jatuh Tempo (Tgl)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={31}
                  required
                  value={dueDay}
                  onChange={(e) => setDueDay(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] text-slate-400 pointer-events-none font-bold">
                  tiap bln
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Periode
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as "monthly" | "yearly")}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="monthly">Bulanan</option>
                <option value="yearly">Tahunan</option>
              </select>
            </div>
          </div>

          {/* Category & Default Wallet */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Kategori
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Dompet Pembayaran
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Pilih Ikon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {BILL_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-xl border flex items-center justify-center transition ${
                    icon === ic
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <DynamicIcon name={ic} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Pilih Warna
            </label>
            <div className="flex flex-wrap gap-2">
              {BILL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                    color === c ? "ring-2 ring-offset-2 ring-emerald-500" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              placeholder="No. Pelanggan ID: 12345678"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
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
              disabled={loading || !title.trim() || numericAmount <= 0}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Menyimpan..." : bill ? "Simpan Perubahan" : "Tambah Tagihan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

