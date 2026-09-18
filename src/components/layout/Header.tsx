"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { formatRupiah, getMonthName } from "@/lib/formatters";
import { NavigationTab } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Users,
  Calendar,
  Plus,
  Wallet,
  Sun,
  Moon,
  FileText,
} from "lucide-react";

interface HeaderProps {
  currentMonth: number; // 1-12
  currentYear: number;
  totalBalance: number;
  onMonthChange: (month: number, year: number) => void;
  onOpenSettings: () => void;
  activeTab?: NavigationTab;
  onOpenQuickModal?: () => void;
  onOpenReportModal?: () => void;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  home: { title: "Beranda", subtitle: "Ringkasan & arus kas keuangan" },
  transactions: { title: "Transaksi", subtitle: "Daftar pencatatan pemasukan, pengeluaran & transfer" },
  budgets: { title: "Anggaran", subtitle: "Target & pagu pengeluaran per kategori" },
  savings: { title: "Tabungan Impian", subtitle: "Target tabungan terencana & celengan masa depan" },
  wallets: { title: "Dompet & Akun", subtitle: "Kelola rekening bank, e-wallet, dan saldo tunai" },
  settings: { title: "Pengaturan", subtitle: "Kelola profil, anggota keluarga, dan kategori" },
};

export function Header({
  currentMonth,
  currentYear,
  totalBalance,
  onMonthChange,
  onOpenSettings,
  activeTab = "home",
  onOpenQuickModal,
  onOpenReportModal,
}: HeaderProps) {
  const { userProfile, household } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showBalance, setShowBalance] = useState(true);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      onMonthChange(12, currentYear - 1);
    } else {
      onMonthChange(currentMonth - 1, currentYear);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      onMonthChange(1, currentYear + 1);
    } else {
      onMonthChange(currentMonth + 1, currentYear);
    }
  };

  const currentTabMeta = TAB_TITLES[activeTab] || TAB_TITLES.home;
  const isMonthSensitiveTab = ["home", "transactions", "budgets"].includes(activeTab);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#090D16]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. DESKTOP NAVBAR (lg:flex)                                               */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex px-8 py-3.5 items-center justify-between">
        {/* Left: Page Title & Subtitle */}
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            {currentTabMeta.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {currentTabMeta.subtitle}
          </p>
        </div>

        {/* Center: Month Navigator (Only shown on month-sensitive tabs) */}
        {isMonthSensitiveTab && (
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition shadow-none hover:shadow-sm"
              aria-label="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3 text-xs font-bold text-slate-800 dark:text-slate-200 select-none">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{getMonthName(currentMonth - 1)} {currentYear}</span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition shadow-none hover:shadow-sm"
              aria-label="Bulan Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: Net Balance Pill, PDF Report, Theme Toggle & CTA */}
        <div className="flex items-center gap-2.5">
          {/* Total Balance Pill */}
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Saldo
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                  aria-label="Toggle Saldo"
                >
                  {showBalance ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                {showBalance ? formatRupiah(totalBalance) : "••••••••••"}
              </p>
            </div>
          </div>

          {/* Monthly Report PDF Button */}
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-slate-200 dark:border-slate-800 transition"
              title="Cetak Laporan Bulanan (PDF)"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-800 transition"
            title={isDark ? "Mode Terang" : "Mode Gelap"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Quick Transaction Button */}
          {onOpenQuickModal && (
            <button
              onClick={onOpenQuickModal}
              className="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Catat</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE / TABLET FIXED NAVBAR (lg:hidden)                               */}
      {/* ========================================================================= */}
      <div className="flex lg:hidden items-center justify-between px-4 py-3 max-w-5xl mx-auto">
        {/* Left: App Logo & Household / App Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100/80 dark:border-emerald-800 flex items-center justify-center p-1 shadow-sm shrink-0">
            <img src="/logo.png" alt="Cemara" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider leading-none">
              Buku Kas
            </p>
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white truncate leading-tight mt-0.5">
              {household?.name || "Keluarga Cemara"}
            </h2>
          </div>
        </div>

        {/* Right: Controls & Profile Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {/* PDF Report Button on mobile */}
          {onOpenReportModal && isMonthSensitiveTab && (
            <button
              onClick={onOpenReportModal}
              className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 transition"
              title="Cetak Laporan Bulanan (PDF)"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition"
            title={isDark ? "Mode Terang" : "Mode Gelap"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Profile Badge (Tap to go to Settings) */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 transition shadow-sm max-w-[130px]"
            title="Buka Pengaturan Akun"
          >
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt="Profile"
                className="w-6 h-6 rounded-full object-cover border border-emerald-500/60 shrink-0"
              />
            ) : userProfile?.avatar ? (
              <span className="text-sm leading-none shrink-0">{userProfile.avatar}</span>
            ) : (
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
            <span className="font-semibold truncate text-[11px] text-slate-700 dark:text-slate-200">
              {userProfile?.displayName?.split(" ")[0] || "Saya"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
