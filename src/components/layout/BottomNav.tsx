"use client";

import React from "react";
import { NavigationTab } from "@/types";
import { Home, ArrowLeftRight, Plus, PieChart, PiggyBank, Wallet } from "lucide-react";

interface BottomNavProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenQuickModal: () => void;
}

export function BottomNav({ activeTab, onSelectTab, onOpenQuickModal }: BottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-emerald-950/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-bottom">
      <div className="max-w-lg mx-auto px-2 h-16 flex items-center justify-between relative">
        {/* Beranda */}
        <button
          onClick={() => onSelectTab("home")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === "home"
              ? "text-[#1E4D2B] dark:text-emerald-400 font-bold"
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
              ? "text-[#1E4D2B] dark:text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="text-[10px] mt-1">Transaksi</span>
        </button>

        {/* Center Floating (+) Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenQuickModal}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#1E4D2B] via-[#166534] to-[#0F5132] text-emerald-300 flex items-center justify-center shadow-lg shadow-[#1E4D2B]/40 active:scale-95 hover:scale-105 transition transform border-4 border-white dark:border-slate-900"
            aria-label="Catat Transaksi Baru"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Anggaran */}
        <button
          onClick={() => onSelectTab("budgets")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === "budgets"
              ? "text-[#1E4D2B] dark:text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] mt-1">Anggaran</span>
        </button>

        {/* Tabungan / Celengan */}
        <button
          onClick={() => onSelectTab("savings")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === "savings"
              ? "text-[#1E4D2B] dark:text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <PiggyBank className="w-5 h-5" />
          <span className="text-[10px] mt-1">Tabungan</span>
        </button>

        {/* Dompet */}
        <button
          onClick={() => onSelectTab("wallets")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === "wallets"
              ? "text-[#1E4D2B] dark:text-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] mt-1">Dompet</span>
        </button>
      </div>
    </nav>
  );
}
