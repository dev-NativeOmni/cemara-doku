"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah, getMonthName } from "@/lib/formatters";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Trees, Users } from "lucide-react";

interface HeaderProps {
  currentMonth: number; // 1-12
  currentYear: number;
  totalBalance: number;
  onMonthChange: (month: number, year: number) => void;
  onOpenSettings: () => void;
}

export function Header({
  currentMonth,
  currentYear,
  totalBalance,
  onMonthChange,
  onOpenSettings,
}: HeaderProps) {
  const { userProfile, household } = useAuth();
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

  return (
    <header className="bg-gradient-to-b from-emerald-800 to-emerald-700 text-white pt-6 pb-6 px-4 md:px-6 rounded-b-[2rem] shadow-lg shadow-emerald-950/15 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10 space-y-4">
        {/* Top Profile & Household Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-100 shadow-inner">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-emerald-200 font-medium">Buku Kas</p>
              <h2 className="text-sm font-bold text-white leading-tight">
                {household?.name || "Keluarga Cemara"}
              </h2>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/15 text-xs text-emerald-100 transition shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="font-medium">{userProfile?.displayName || "Saya"}</span>
          </button>
        </div>

        {/* Month Picker Row */}
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
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-center shadow-inner">
          <div className="flex items-center justify-center gap-2 text-emerald-200 text-xs font-medium mb-1">
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
  );
}

