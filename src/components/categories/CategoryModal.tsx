"use client";

import React, { useState } from "react";
import { Category } from "@/types";
import { DynamicIcon } from "../ui/DynamicIcon";
import { X, Check } from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "income" | "expense";
  categoryToEdit?: Category | null;
  onSave: (category: Omit<Category, "id">) => Promise<string>;
  onUpdate?: (id: string, data: Partial<Category>) => Promise<void>;
  onCreated?: (newCategoryId: string) => void;
}

const AVAILABLE_ICONS = [
  "ShoppingBag",
  "Zap",
  "Users",
  "Car",
  "HeartHandshake",
  "Coffee",
  "Activity",
  "Utensils",
  "BookOpen",
  "Sparkles",
  "Gamepad2",
  "Film",
  "Shirt",
  "Baby",
  "Home",
  "PawPrint",
  "GraduationCap",
  "PiggyBank",
  "Plane",
  "Music",
  "Dumbbell",
  "Briefcase",
  "Gift",
  "TrendingUp",
  "PlusCircle",
  "MoreHorizontal",
];

const AVAILABLE_COLORS = [
  "#10B981", // Emerald
  "#059669", // Deep Emerald
  "#0D9488", // Teal
  "#0EA5E9", // Sky
  "#2563EB", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#475569", // Slate Gray
];

export function CategoryModal({
  isOpen,
  onClose,
  defaultType = "expense",
  categoryToEdit,
  onSave,
  onUpdate,
  onCreated,
}: CategoryModalProps) {
  const [name, setName] = useState(categoryToEdit?.name || "");
  const [type, setType] = useState<"income" | "expense">(categoryToEdit?.type || defaultType);
  const [icon, setIcon] = useState(categoryToEdit?.icon || AVAILABLE_ICONS[0]);
  const [color, setColor] = useState(categoryToEdit?.color || AVAILABLE_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || "");
      setType(categoryToEdit.type || defaultType);
      setIcon(categoryToEdit.icon || AVAILABLE_ICONS[0]);
      setColor(categoryToEdit.color || AVAILABLE_COLORS[0]);
    } else {
      setName("");
      setType(defaultType);
      setIcon(AVAILABLE_ICONS[0]);
      setColor(AVAILABLE_COLORS[0]);
    }
  }, [categoryToEdit, defaultType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      if (categoryToEdit && onUpdate) {
        await onUpdate(categoryToEdit.id, {
          name: name.trim(),
          type,
          icon,
          color,
        });
      } else {
        const newId = await onSave({
          name: name.trim(),
          type,
          icon,
          color,
          isDefault: false,
        });
        if (onCreated) {
          onCreated(newId);
        }
      }
      setName("");
      onClose();
    } catch (err) {
      console.error("Failed to save category:", err);
      alert(categoryToEdit ? "Gagal memperbarui kategori" : "Gagal menambahkan kategori baru");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              {categoryToEdit ? "Edit Kategori" : "Tambah Kategori Kustom"}
            </h3>
            <p className="text-xs text-slate-400">
              {categoryToEdit ? "Perbarui nama, jenis, ikon, atau warna kategori" : "Buat kategori pengeluaran atau pemasukan baru"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                type === "expense"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                type === "income"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Nama Kategori</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Contoh: Skincare, Kursus Anak, Hobi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Ikon</label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-xl flex items-center justify-center transition ${
                    icon === ic
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
                  }`}
                >
                  <DynamicIcon name={ic} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Warna</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map((c) => (
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

          {/* Preview Badge */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Pratinjau Kategori:</span>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs shadow-sm"
                style={{ backgroundColor: color }}
              >
                <DynamicIcon name={icon} className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                {name.trim() || "Nama Kategori"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>
                {submitting
                  ? "Menyimpan..."
                  : categoryToEdit
                  ? "Simpan Perubahan"
                  : "Buat Kategori"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
