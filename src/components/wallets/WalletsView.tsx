"use client";

import React, { useState } from "react";
import { Wallet, WalletType } from "@/types";
import { formatRupiah } from "@/lib/formatters";
import { DynamicIcon } from "../ui/DynamicIcon";
import { Plus, Wallet as WalletIcon, Edit2, Archive, X, CheckCircle2 } from "lucide-react";

interface WalletsViewProps {
  wallets: Wallet[];
  onCreateWallet: (data: Omit<Wallet, "id" | "updatedAt">) => Promise<void>;
  onUpdateWallet: (id: string, data: Partial<Wallet>) => Promise<void>;
}

const WALLET_ICONS = ["Wallet", "Landmark", "Smartphone", "PiggyBank", "CreditCard", "Coins", "Banknote", "DollarSign"];
const WALLET_COLORS = ["#10B981", "#2563EB", "#0EA5E9", "#8B5CF6", "#F59E0B", "#EC4899", "#14B8A6", "#475569"];

export function WalletsView({ wallets, onCreateWallet, onUpdateWallet }: WalletsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("bank");
  const [initialBalance, setInitialBalance] = useState("");
  const [color, setColor] = useState(WALLET_COLORS[0]);
  const [icon, setIcon] = useState(WALLET_ICONS[0]);
  const [submitting, setSubmitting] = useState(false);

  const totalBalance = wallets.reduce((sum, w) => sum + w.currentBalance, 0);

  const handleOpenCreate = () => {
    setEditingWallet(null);
    setName("");
    setType("bank");
    setInitialBalance("");
    setColor(WALLET_COLORS[0]);
    setIcon(WALLET_ICONS[0]);
    setModalOpen(true);
  };

  const handleOpenEdit = (w: Wallet) => {
    setEditingWallet(w);
    setName(w.name);
    setType(w.type);
    setInitialBalance(w.currentBalance.toString());
    setColor(w.color || WALLET_COLORS[0]);
    setIcon(w.icon || WALLET_ICONS[0]);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const balanceNum = parseInt(initialBalance.replace(/\D/g, "") || "0", 10);
      if (editingWallet) {
        await onUpdateWallet(editingWallet.id, {
          name: name.trim(),
          type,
          color,
          icon,
        });
      } else {
        await onCreateWallet({
          name: name.trim(),
          type,
          currentBalance: balanceNum,
          color,
          icon,
          isArchived: false,
        });
      }
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Daftar Dompet</h3>
          <p className="text-xs text-slate-400">Total {wallets.length} sumber dana aktif</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Dompet</span>
        </button>
      </div>

      {/* Wallets Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {wallets.map((w) => (
          <div
            key={w.id}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4 group"
          >
            {/* Top Row: Icon, Name, Edit */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                  style={{ backgroundColor: w.color || "#10B981" }}
                >
                  <DynamicIcon name={w.icon} className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{w.name}</h4>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                    {w.type}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenEdit(w)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title="Edit Dompet"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Row: Balance */}
            <div>
              <p className="text-[11px] text-slate-400">Saldo Saat Ini</p>
              <p className="text-xl font-extrabold text-slate-800 tracking-tight">
                {formatRupiah(w.currentBalance)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit Wallet */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">
                {editingWallet ? "Edit Dompet" : "Tambah Dompet Baru"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Dompet / Akun
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: BCA Utama, Kas Dapur, GoPay"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Jenis Dompet
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as WalletType)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="bank">Rekening Bank</option>
                    <option value="cash">Kas Tunai</option>
                    <option value="ewallet">E-Wallet</option>
                    <option value="savings">Tabungan</option>
                    <option value="investment">Investasi</option>
                  </select>
                </div>

                {!editingWallet && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Saldo Awal (Rp)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={initialBalance ? Number(initialBalance.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                      onChange={(e) => setInitialBalance(e.target.value.replace(/\D/g, ""))}
                      placeholder="0"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Warna Kartu
                </label>
                <div className="flex items-center gap-2">
                  {WALLET_COLORS.map((c) => (
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

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Ikon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {WALLET_ICONS.map((ic) => (
                    <button
                      type="button"
                      key={ic}
                      onClick={() => setIcon(ic)}
                      className={`p-2 rounded-xl border flex items-center justify-center transition ${
                        icon === ic
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-bold"
                          : "border-slate-200 hover:border-slate-300 text-slate-500 bg-white"
                      }`}
                    >
                      <DynamicIcon name={ic} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
                >
                  {submitting ? "Menyimpan..." : editingWallet ? "Simpan Perubahan" : "Buat Dompet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

