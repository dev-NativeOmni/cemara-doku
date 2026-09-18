"use client";

import React, { useState, useEffect } from "react";
import { SavingsGoal, Wallet } from "@/types";
import { DynamicIcon } from "../ui/DynamicIcon";
import { X, Check, Target, Calendar, Sparkles } from "lucide-react";

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  wallets: Wallet[];
  onSave: (data: Omit<SavingsGoal, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

const ICONS = ["Target", "Car", "Plane", "Home", "GraduationCap", "Heart", "Gift", "Shield", "Laptop", "PiggyBank", "Umbrella", "Sparkles"];
const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#EF4444", "#06B6D4", "#6366F1"];

export function SavingsGoalModal({
  isOpen,
  onClose,
  goal,
  wallets,
  onSave,
}: SavingsGoalModalProps) {
  const [title, setTitle] = useState("");
  const [targetAmountStr, setTargetAmountStr] = useState("");
  const [currentAmountStr, setCurrentAmountStr] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [icon, setIcon] = useState("Target");
  const [color, setColor] = useState("#10B981");
  const [walletId, setWalletId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (goal) {
        setTitle(goal.title);
        setTargetAmountStr(goal.targetAmount.toLocaleString("id-ID"));
        setCurrentAmountStr(goal.currentAmount ? goal.currentAmount.toLocaleString("id-ID") : "");
        setTargetDate(goal.targetDate || "");
        setIcon(goal.icon || "Target");
        setColor(goal.color || "#10B981");
        setWalletId(goal.walletId || "");
        setNotes(goal.notes || "");
      } else {
        setTitle("");
        setTargetAmountStr("");
        setCurrentAmountStr("");
        setTargetDate("");
        setIcon("Target");
        setColor("#10B981");
        setWalletId(wallets[0]?.id || "");
        setNotes("");
      }
    }
  }, [isOpen, goal, wallets]);

  if (!isOpen) return null;

  const targetAmount = parseInt(targetAmountStr.replace(/\D/g, "") || "0", 10);
  const currentAmount = parseInt(currentAmountStr.replace(/\D/g, "") || "0", 10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetAmount <= 0) {
      alert("Harap isi nama target dan nominal target tabungan");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        targetAmount,
        currentAmount,
        targetDate: targetDate || undefined,
        icon,
        color,
        walletId: walletId || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error("Gagal menyimpan target tabungan:", err);
      alert("Gagal menyimpan target tabungan.");
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
              style={{ backgroundColor: color }}
            >
              <DynamicIcon name={icon} className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {goal ? "Ubah Target Tabungan" : "Buat Target Tabungan Baru"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Celengan Impian Keluarga
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Goal Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Nama Impian / Target
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Liburan Akhir Tahun, Dana Darurat"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Target Amount */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Target Nominal (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              required
              placeholder="0"
              value={targetAmountStr}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setTargetAmountStr(raw ? Number(raw).toLocaleString("id-ID") : "");
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Initial / Current Balance */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Saldo Terkumpul Saat Ini (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={currentAmountStr}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setCurrentAmountStr(raw ? Number(raw).toLocaleString("id-ID") : "");
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Target Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Target Tanggal Tercapai (Opsional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Icon Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Pilih Ikon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center transition ${
                    icon === ic
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-sm"
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
              Warna Kartu
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition flex items-center justify-center ${
                    color === c ? "ring-2 ring-offset-2 ring-emerald-600" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
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
              disabled={loading || !title.trim() || targetAmount <= 0}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {loading ? "Menyimpan..." : goal ? "Simpan Perubahan" : "Buat Celengan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
