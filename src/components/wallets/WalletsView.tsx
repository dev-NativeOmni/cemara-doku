"use client";

import React, { useState } from "react";
import { Wallet, WalletType } from "@/types";
import { formatRupiah } from "@/lib/formatters";
import { DynamicIcon } from "../ui/DynamicIcon";
import { TotalBalanceCard } from "../dashboard/TotalBalanceCard";
import { Plus, Wallet as WalletIcon, Edit2, Archive, X, CheckCircle2 } from "lucide-react";

interface WalletsViewProps {
  wallets: Wallet[];
  onCreateWallet: (data: Omit<Wallet, "id" | "updatedAt">) => Promise<void>;
  onUpdateWallet: (id: string, data: Partial<Wallet>) => Promise<void>;
}

const WALLET_ICONS = ["Wallet", "Landmark", "Smartphone", "PiggyBank", "CreditCard", "Coins", "Banknote", "DollarSign"];
const WALLET_COLORS = ["#0F2C59", "#D4AF37", "#1A365D", "#2563EB", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899"];

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
          currentBalance: balanceNum,
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
    <div className="space-y-5 pb-28 max-w-5xl lg:max-w-7xl mx-auto px-4 lg:px-0 pt-3 lg:pt-0">
      {/* Total Balance Hero Card */}
      <TotalBalanceCard
        totalBalance={totalBalance}
        walletCount={wallets.length}
        onOpenQuickModal={handleOpenCreate}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-white">Daftar Dompet</h3>
          <p className="text-xs text-slate-400">Total {wallets.length} sumber dana aktif</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#0F2C59] via-[#153464] to-[#1A365D] hover:from-[#0A1F3F] hover:to-[#0F2C59] text-white rounded-2xl text-xs font-bold shadow-md shadow-[#0F2C59]/20 border border-amber-400/25 transition"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Tambah Dompet</span>
        </button>
      </div>

      {/* Wallets Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {wallets.map((w) => (
          <div
            key={w.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                  style={{ backgroundColor: w.color || "#0F2C59" }}
                >
                  <DynamicIcon name={w.icon} className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{w.name}</h4>
                  <span className="text-[11px] text-slate-400 capitalize">{w.type}</span>
                </div>
              </div>

              <button
                onClick={() => handleOpenEdit(w)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition"
                title="Edit Saldo & Info Dompet"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-50 dark:border-slate-800 flex items-baseline justify-between">
              <span className="text-xs text-slate-400 font-medium">Saldo Dompet</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatRupiah(w.currentBalance)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Create/Edit Wallet */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                {editingWallet ? "Edit Saldo & Dompet" : "Tambah Dompet Baru"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Nama Dompet / Rekening</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BCA, Dompet Tunai, GoPay"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Jenis Sumber Dana</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as WalletType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="bank">Bank / Rekening</option>
                  <option value="cash">Tunai / Cash</option>
                  <option value="ewallet">E-Wallet (GoPay, OVO, ShopeePay)</option>
                  <option value="savings">Tabungan / Celengan</option>
                  <option value="investment">Investasi</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {editingWallet ? "Penyesuaian Saldo (Rp)" : "Saldo Awal (Rp)"}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={initialBalance ? Number(initialBalance.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                  onChange={(e) => setInitialBalance(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Ikon</label>
                <div className="grid grid-cols-4 gap-2">
                  {WALLET_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center transition ${
                        icon === ic
                          ? "border-[#0F2C59] dark:border-amber-400 bg-[#0F2C59]/10 dark:bg-amber-400/10 text-[#0F2C59] dark:text-amber-400"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <DynamicIcon name={ic} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Warna</label>
                <div className="flex flex-wrap gap-2">
                  {WALLET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition flex items-center justify-center ${
                        color === c ? "ring-2 ring-offset-2 ring-amber-500" : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-[#0F2C59] via-[#153464] to-[#1A365D] hover:from-[#0A1F3F] hover:to-[#0F2C59] text-white font-bold text-xs rounded-2xl shadow-lg shadow-[#0F2C59]/25 border border-amber-400/25 transition disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Dompet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
