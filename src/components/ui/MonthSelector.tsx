"use client";

import React from "react";
import { getMonthName } from "@/lib/formatters";
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from "lucide-react";

interface MonthSelectorProps {
  currentMonth: number; // 1-12
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
  className?: string;
  showReset?: boolean;
}

export function MonthSelector({
  currentMonth,
  currentYear,
  onMonthChange,
  className = "",
  showReset = true,
}: MonthSelectorProps) {
  const now = new Date();
  const realCurrentMonth = now.getMonth() + 1;
  const realCurrentYear = now.getFullYear();
  const isCurrentMonth = currentMonth === realCurrentMonth && currentYear === realCurrentYear;

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

  const handleResetToCurrent = () => {
    onMonthChange(realCurrentMonth, realCurrentYear);
  };

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      {/* Month Navigation Pill */}
      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-1 shadow-sm">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#0F2C59] dark:hover:text-amber-400 transition"
          aria-label="Bulan Sebelumnya"
          title="Bulan Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-0.5 text-xs font-bold text-[#0F2C59] dark:text-amber-300 select-none">
          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            {getMonthName(currentMonth - 1)} {currentYear}
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#0F2C59] dark:hover:text-amber-400 transition"
          aria-label="Bulan Selanjutnya"
          title="Bulan Selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Reset to Current Month (if not currently on this month) */}
      {showReset && !isCurrentMonth && (
        <button
          onClick={handleResetToCurrent}
          className="flex items-center gap-1 text-[11px] font-bold text-[#0F2C59] dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-1.5 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/60 transition shadow-sm animate-in fade-in"
          title="Kembali ke bulan sekarang"
        >
          <RotateCcw className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>Bulan Ini</span>
        </button>
      )}
    </div>
  );
}
