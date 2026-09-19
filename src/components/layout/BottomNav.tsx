"use client";

import React, { useState } from "react";
import { NavigationTab } from "@/types";
import {
  Home,
  ArrowLeftRight,
  Plus,
  Receipt,
  ShoppingCart,
  Grid,
  PieChart,
  PiggyBank,
  Wallet,
  Settings,
  FileText,
  X,
  Sparkles,
} from "lucide-react";

interface BottomNavProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenQuickModal: () => void;
  unpaidBillsCount?: number;
  shoppingPendingCount?: number;
  onOpenReportModal?: () => void;
}

export function BottomNav({
  activeTab,
  onSelectTab,
  onOpenQuickModal,
  unpaidBillsCount = 0,
  shoppingPendingCount = 0,
  onOpenReportModal,
}: BottomNavProps) {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const isMoreActive = ["budgets", "savings", "wallets", "settings"].includes(activeTab);

  const handleSelectMoreTab = (tab: NavigationTab) => {
    onSelectTab(tab);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-bottom">
        <div className="max-w-lg mx-auto px-2 h-16 flex items-center justify-between relative">
          {/* Beranda */}
          <button
            onClick={() => onSelectTab("home")}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === "home"
                ? "text-emerald-700 dark:text-emerald-400 font-bold"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-1">Beranda</span>
          </button>

          {/* Transaksi */}
          <button
            onClick={() => onSelectTab("transactions")}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === "transactions"
                ? "text-emerald-700 dark:text-emerald-400 font-bold"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <ArrowLeftRight className="w-5 h-5" />
            <span className="text-[10px] mt-1">Transaksi</span>
          </button>

          {/* Floating Center (+) Catat Button */}
          <div className="flex-1 flex justify-center -mt-6">
            <button
              onClick={onOpenQuickModal}
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 active:scale-95 hover:scale-105 transition transform border-4 border-white dark:border-slate-900"
              aria-label="Catat Transaksi Baru & Scan Struk"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          {/* Tagihan Rutin */}
          <button
            onClick={() => onSelectTab("bills")}
            className={`flex flex-col items-center justify-center flex-1 py-1 relative transition ${
              activeTab === "bills"
                ? "text-emerald-700 dark:text-emerald-400 font-bold"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <div className="relative">
              <Receipt className="w-5 h-5" />
              {unpaidBillsCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {unpaidBillsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1">Tagihan</span>
          </button>

          {/* Daftar Belanja */}
          <button
            onClick={() => onSelectTab("shopping")}
            className={`flex flex-col items-center justify-center flex-1 py-1 relative transition ${
              activeTab === "shopping"
                ? "text-emerald-700 dark:text-emerald-400 font-bold"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {shoppingPendingCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {shoppingPendingCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1">Belanja</span>
          </button>

          {/* Menu Lainnya */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              isMoreActive
                ? "text-emerald-700 dark:text-emerald-400 font-bold"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px] mt-1">Menu</span>
          </button>
        </div>
      </nav>

      {/* Mobile More Features Modal / Bottom Sheet */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl shadow-2xl border-t border-slate-100 dark:border-slate-800 p-5 space-y-4 animate-in slide-in-from-bottom duration-300 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                    Fitur & Menu Lainnya
                  </h3>
                  <p className="text-[10px] text-slate-400">Pilih modul yang ingin Anda kelola</p>
                </div>
              </div>

              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Anggaran */}
              <button
                onClick={() => handleSelectMoreTab("budgets")}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition text-left ${
                  activeTab === "budgets"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                  <PieChart className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs">Anggaran</p>
                  <p className="text-[10px] text-slate-400 truncate">Pagu per kategori</p>
                </div>
              </button>

              {/* Tabungan Impian */}
              <button
                onClick={() => handleSelectMoreTab("savings")}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition text-left ${
                  activeTab === "savings"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs">Tabungan</p>
                  <p className="text-[10px] text-slate-400 truncate">Target celengan</p>
                </div>
              </button>

              {/* Dompet & Rekening */}
              <button
                onClick={() => handleSelectMoreTab("wallets")}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition text-left ${
                  activeTab === "wallets"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs">Dompet</p>
                  <p className="text-[10px] text-slate-400 truncate">Rekening & kas</p>
                </div>
              </button>

              {/* Pengaturan Akun */}
              <button
                onClick={() => handleSelectMoreTab("settings")}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition text-left ${
                  activeTab === "settings"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs">Pengaturan</p>
                  <p className="text-[10px] text-slate-400 truncate">Keluarga & profil</p>
                </div>
              </button>
            </div>

            {/* Monthly Report PDF Button on Mobile Drawer */}
            {onOpenReportModal && (
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onOpenReportModal();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Cetak Laporan Bulanan (PDF)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
