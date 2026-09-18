"use client";

import React, { useState } from "react";
import { formatRupiah } from "@/lib/formatters";
import { Wallet, Eye, EyeOff, Plus, ChevronRight } from "lucide-react";

interface TotalBalanceCardProps {
  totalBalance: number;
  walletCount?: number;
  onOpenQuickModal?: () => void;
  onNavigateToWallets?: () => void;
}

export function TotalBalanceCard({
  totalBalance,
  walletCount = 0,
  onOpenQuickModal,
  onNavigateToWallets,
}: TotalBalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F2C59] via-[#153464] to-[#1A365D] text-white p-5 sm:p-6 shadow-xl shadow-blue-950/20 border border-amber-400/25 transition-all">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-40 h-40 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between space-y-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-300">
            <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-amber-400/25 shadow-inner">
              <Wallet className="w-4 h-4 text-amber-300" />
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              Total Saldo Seluruh Dompet
            </span>
          </div>

          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white transition backdrop-blur-md border border-white/10"
            aria-label="Toggle Saldo"
            title={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Large Balance Display */}
        <div className="py-1">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm font-sans">
            {showBalance ? formatRupiah(totalBalance) : "••••••••••"}
          </div>
        </div>

        {/* Bottom Actions & Wallet Link */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          {onNavigateToWallets ? (
            <button
              onClick={onNavigateToWallets}
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 transition font-medium group"
            >
              <span>{walletCount > 0 ? `${walletCount} Dompet Terhubung` : "Kelola Dompet"}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <span className="text-amber-200/80">
              {walletCount > 0 ? `${walletCount} Dompet Aktif` : "Saldo Keseluruhan"}
            </span>
          )}

          {onOpenQuickModal && (
            <button
              onClick={onOpenQuickModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold rounded-xl border border-amber-400/40 transition active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Catat Transaksi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
