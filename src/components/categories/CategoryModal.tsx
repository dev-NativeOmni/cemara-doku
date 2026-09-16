"use client";

import React, { useState } from "react";
import { Category } from "@/types";
import { DynamicIcon } from "../ui/DynamicIcon";
import { X, Check } from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "income" | "expense";
  onSave: (category: Omit<Category, "id">) => Promise<string>;
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
  "#2563EB", // Blue
  "#0EA5E9", // Sky
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#6366F1", // Indigo
  "#84CC16", // Lime
  "#64748B", // Slate
];

export function CategoryModal({
  isOpen,
  onClose,
  defaultType = "expense",
  onSave,
  onCreated,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">(defaultType);
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0]);
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama kategori wajib diisi");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
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
      setName("");
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menyimpan kategori");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-base">Tambah Kategori Kustom</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Segment Control for Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Jenis Kategori
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  type === "expense"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  type === "income"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Nama Kategori
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Skincare, Hewan Peliharaan, Freelance"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Pilihan Warna
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition transform ${
                    color === c ? "scale-110 ring-2 ring-offset-2 ring-emerald-500 shadow-md" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Pilihan Ikon
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-xl">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-xl flex items-center justify-center transition ${
                    icon === ic
                      ? "bg-emerald-50 border-2 border-emerald-600 text-emerald-700 shadow-sm"
                      : "border border-slate-200 hover:border-slate-300 text-slate-500 bg-white"
                  }`}
                >
                  <DynamicIcon name={ic} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Preview Box */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ backgroundColor: color }}
            >
              <DynamicIcon name={icon} className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{name || "Nama Kategori"}</p>
              <p className="text-[10px] text-slate-400 capitalize">
                Kategori {type === "expense" ? "Pengeluaran" : "Pemasukan"}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{submitting ? "Menyimpan..." : "Simpan Kategori Baru"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
