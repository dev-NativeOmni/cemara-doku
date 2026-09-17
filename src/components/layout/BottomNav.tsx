"use client";

import React from "react";
import { NavigationTab } from "@/types";
import { Home, ArrowLeftRight, Plus, PieChart, Wallet } from "lucide-react";

interface BottomNavProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenQuickModal: () => void;
}

export function BottomNav({ activeTab, onSelectTab, onOpenQuickModal }: BottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-bottom">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Beranda */}
        <button
          onClick={() => onSelectTab("home")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === "home" ? "text-emerald-700 font-bold" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1">Beranda</span>
        </button>

        {/* Transaksi */}
        <button
          onClick={() => onSelectTab("transactions")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === "transactions" ? "text-emerald-700 font-bold" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="text-[10px] mt-1">Transaksi</span>
        </button>

        {/* Center Floating (+) Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenQuickModal}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 active:scale-95 hover:scale-105 transition transform border-4 border-white"
            aria-label="Catat Transaksi Baru"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Anggaran */}
        <button
          onClick={() => onSelectTab("budgets")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === "budgets" ? "text-emerald-700 font-bold" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] mt-1">Anggaran</span>
        </button>

        {/* Dompet */}
        <button
          onClick={() => onSelectTab("wallets")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === "wallets" ? "text-emerald-700 font-bold" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] mt-1">Dompet</span>
        </button>
      </div>
    </nav>
  );
}

