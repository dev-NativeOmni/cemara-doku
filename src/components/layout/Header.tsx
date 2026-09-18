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
  home: { title: "Beranda", subtitle: "Ringkasan & arus kas keuangan keluarga" },
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

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP TOP BAR (Only visible on lg: screens and above)               */}
      {/* ========================================================================= */}
      <header className="hidden lg:flex sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-8 py-3.5 items-center justify-between">
        {/* Left: Page Title & Breadcrumb */}
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {currentTabMeta.title}
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {currentTabMeta.subtitle}
          </p>
        </div>

        {/* Center: Month Navigator */}
        <div className="flex items-center bg-slate-100/90 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-1 shadow-sm">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition shadow-none hover:shadow-sm"
            aria-label="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 px-3 text-xs font-bold text-slate-800 dark:text-white select-none">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{getMonthName(currentMonth - 1)} {currentYear}</span>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition shadow-none hover:shadow-sm"
            aria-label="Bulan Selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Net Balance Pill, PDF Report, Theme Toggle & CTA */}
        <div className="flex items-center gap-2.5">
          {/* Total Balance Pill */}
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Saldo
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
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
              className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-700 transition"
              title="Cetak Laporan Bulanan (PDF)"
            >
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-700 transition"
            title={isDark ? "Mode Terang" : "Mode Gelap"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
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
      </header>

      {/* ========================================================================= */}
      {/* 2. MOBILE / TABLET HEADER (Kept 100% intact on screens < lg)             */}
      {/* ========================================================================= */}
      <header className="block lg:hidden bg-gradient-to-b from-emerald-800 to-emerald-700 text-white pt-6 pb-6 px-4 md:px-8 rounded-b-[2rem] shadow-lg shadow-emerald-950/15 relative overflow-hidden">
        {/* Background ambient accents */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 space-y-4">
          {/* Top Profile & Household Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center p-1 shadow-inner shrink-0">
                <img src="/logo.png" alt="Cemara" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div>
                <p className="text-[11px] md:text-xs text-emerald-200 font-medium">Buku Kas</p>
                <h2 className="text-sm md:text-base font-bold text-white leading-tight">
                  {household?.name || "Keluarga Cemara"}
                </h2>
              </div>
            </div>

            {/* Profile & Dark Toggle Badge */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/15 text-white transition"
                title={isDark ? "Mode Terang" : "Mode Gelap"}
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onOpenSettings}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/15 text-xs text-emerald-100 transition shadow-sm"
              >
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    className="w-5 h-5 rounded-full object-cover border border-white/40"
                  />
                ) : userProfile?.avatar ? (
                  <span className="text-sm leading-none">{userProfile.avatar}</span>
                ) : (
                  <Users className="w-3.5 h-3.5" />
                )}
                <span className="font-medium truncate max-w-[120px]">
                  {userProfile?.displayName || "Saya"}
                </span>
              </button>
            </div>
          </div>

          {/* Month Picker Row (Mobile) */}
          <div className="flex items-center justify-between bg-black/15 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 w-fit mx-auto">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white/15 rounded-full text-emerald-200 hover:text-white transition"
              aria-label="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-3 tracking-wide">
              {getMonthName(currentMonth - 1)} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-white/15 rounded-full text-emerald-200 hover:text-white transition"
              aria-label="Bulan Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Total Net Balance Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 md:p-5 text-center shadow-inner max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-emerald-200 text-xs md:text-sm font-medium mb-1">
              <span>Total Saldo Seluruh Dompet</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="hover:text-white transition"
                aria-label="Toggle Saldo"
              >
                {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {showBalance ? formatRupiah(totalBalance) : "••••••••••"}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
