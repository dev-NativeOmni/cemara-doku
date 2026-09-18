"use client";

import React, { useState } from "react";
import { formatRupiah } from "@/lib/formatters";
import { DynamicIcon } from "../ui/DynamicIcon";

export interface CategoryBreakdownItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

interface ExpenseDonutChartProps {
  data: CategoryBreakdownItem[];
  totalExpense: number;
}

export function ExpenseDonutChart({ data, totalExpense }: ExpenseDonutChartProps) {
  const [activeItem, setActiveItem] = useState<CategoryBreakdownItem | null>(null);

  if (totalExpense === 0 || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
        <p className="font-medium">Belum ada data pengeluaran di bulan ini.</p>
      </div>
    );
  }

  // SVG Donut calculation
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
      {/* SVG Donut */}
      <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {data.map((item) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += item.percentage;

            const isHovered = activeItem?.id === item.id;

            return (
              <circle
                key={item.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color || "#10B981"}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer hover:opacity-90"
                onMouseEnter={() => setActiveItem(item)}
                onMouseLeave={() => setActiveItem(null)}
                onClick={() => setActiveItem(activeItem?.id === item.id ? null : item)}
              />
            );
          })}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
          {activeItem ? (
            <div className="animate-in fade-in duration-200">
              <span className="text-[10px] font-bold text-slate-400 block truncate max-w-[90px]">
                {activeItem.name}
              </span>
              <p className="text-xs font-extrabold text-slate-800 dark:text-white">
                {activeItem.percentage.toFixed(0)}%
              </p>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {formatRupiah(activeItem.amount)}
              </p>
            </div>
          ) : (
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">Total Keluar</span>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatRupiah(totalExpense)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend / Breakdown List */}
      <div className="flex-1 w-full max-h-48 overflow-y-auto space-y-2 pr-1">
        {data.slice(0, 6).map((item) => (
          <div
            key={item.id}
            onMouseEnter={() => setActiveItem(item)}
            onMouseLeave={() => setActiveItem(null)}
            className={`flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer ${
              activeItem?.id === item.id
                ? "bg-slate-100 dark:bg-slate-800 font-bold"
                : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-700 dark:text-slate-300 truncate font-medium">
                {item.name}
              </span>
            </div>

            <div className="text-right shrink-0 flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold">
                {item.percentage.toFixed(0)}%
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {formatRupiah(item.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
