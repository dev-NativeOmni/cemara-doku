"use client";

import React, { useState } from "react";
import { Transaction } from "@/types";
import { formatRupiah } from "@/lib/formatters";
import { TrendingUp, AlertCircle } from "lucide-react";

interface DailyTrendChartProps {
  transactions: Transaction[];
  currentMonth: number;
  currentYear: number;
}

export function DailyTrendChart({
  transactions,
  currentMonth,
  currentYear,
}: DailyTrendChartProps) {
  const [hoveredDay, setHoveredDay] = useState<{ day: number; amount: number } | null>(null);

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const dailyExpenses: number[] = new Array(daysInMonth).fill(0);

  // Filter expenses and accumulate per day
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const date = t.transactionDate instanceof Date ? t.transactionDate : (t.transactionDate as any)?.toDate?.() || new Date();
      const day = date.getDate();
      if (day >= 1 && day <= daysInMonth) {
        dailyExpenses[day - 1] += t.amount;
      }
    });

  const maxExpense = Math.max(...dailyExpenses, 1);
  const totalExpense = dailyExpenses.reduce((sum, val) => sum + val, 0);
  const averageDaily = totalExpense > 0 ? totalExpense / daysInMonth : 0;

  // Find peak day
  let peakDay = 1;
  let peakAmount = 0;
  dailyExpenses.forEach((amt, idx) => {
    if (amt > peakAmount) {
      peakAmount = amt;
      peakDay = idx + 1;
    }
  });

  if (totalExpense === 0) {
    return (
      <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
        <p className="font-medium">Belum ada data pengeluaran harian di bulan ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-1">
      {/* Top Peak / Hover Info Bar */}
      <div className="flex items-center justify-between text-xs">
        <div>
          {hoveredDay ? (
            <div className="animate-in fade-in duration-150">
              <span className="text-slate-400">Tgl {hoveredDay.day}: </span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {formatRupiah(hoveredDay.amount)}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-slate-400">Rata-rata/hari: </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {formatRupiah(Math.round(averageDaily))}
              </span>
            </div>
          )}
        </div>

        {peakAmount > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
            <TrendingUp className="w-3 h-3" />
            <span>Puncak: Tgl {peakDay} ({formatRupiah(peakAmount)})</span>
          </div>
        )}
      </div>

      {/* Bar Chart Grid */}
      <div className="h-32 flex items-end gap-1 sm:gap-1.5 pt-4 pb-1">
        {dailyExpenses.map((amount, idx) => {
          const day = idx + 1;
          const heightPercent = maxExpense > 0 ? (amount / maxExpense) * 100 : 0;
          const isPeak = day === peakDay && peakAmount > 0;
          const isHovered = hoveredDay?.day === day;

          return (
            <div
              key={day}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setHoveredDay({ day, amount })}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-8 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-lg whitespace-nowrap z-20 pointer-events-none">
                  Tgl {day}: {formatRupiah(amount)}
                </div>
              )}

              {/* Bar */}
              <div
                style={{ height: `${Math.max(heightPercent, 4)}%` }}
                className={`w-full rounded-t-md transition-all duration-300 ${
                  isHovered
                    ? "bg-rose-600 dark:bg-rose-500 shadow-md shadow-rose-600/30"
                    : isPeak
                    ? "bg-amber-500 dark:bg-amber-400"
                    : amount > 0
                    ? "bg-[#0F2C59]/80 hover:bg-[#0F2C59] dark:bg-amber-500/70 dark:hover:bg-amber-500"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
              />

              {/* Day Label (Show every 5 days or first/last to avoid clutter) */}
              {(day === 1 || day % 5 === 0 || day === daysInMonth) && (
                <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                  {day}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

