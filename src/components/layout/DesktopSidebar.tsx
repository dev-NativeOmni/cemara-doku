"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { NavigationTab } from "@/types";
import {
  Home,
  ArrowLeftRight,
  PieChart,
  Wallet,
  Settings,
  Plus,
  LogOut,
  Copy,
  Check,
  Users,
  ShieldCheck,
} from "lucide-react";

interface DesktopSidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenQuickModal: () => void;
  transactionCount?: number;
}

export function DesktopSidebar({
  activeTab,
  onSelectTab,
  onOpenQuickModal,
  transactionCount,
}: DesktopSidebarProps) {
  const { user, userProfile, household, signOut } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyInviteCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (household?.inviteCode) {
      navigator.clipboard.writeText(household.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const navItems = [
    { id: "home" as NavigationTab, label: "Beranda", icon: Home },
    {
      id: "transactions" as NavigationTab,
      label: "Transaksi",
      icon: ArrowLeftRight,
      badge: transactionCount,
    },
    { id: "budgets" as NavigationTab, label: "Anggaran", icon: PieChart },
    { id: "wallets" as NavigationTab, label: "Dompet & Akun", icon: Wallet },
    { id: "settings" as NavigationTab, label: "Pengaturan", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200/80 z-30 flex-col justify-between select-none">
      {/* Top Brand & Nav */}
      <div className="p-5 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100/80 p-1.5 flex items-center justify-center shrink-0 shadow-sm">
            <img src="/logo.png" alt="Cemara" className="w-full h-full object-contain drop-shadow" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-slate-900 text-base leading-tight tracking-tight">
              Cemara
            </h1>
            <p className="text-xs text-slate-400 font-medium truncate">
              {household?.name || "Buku Kas Keluarga"}
            </p>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={onOpenQuickModal}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 active:scale-[0.98] transition"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Catat Transaksi</span>
        </button>

        {/* Navigation List */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-emerald-700 stroke-[2.5]" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Household & Profile Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        {/* Invite Code Quick Box */}
        {household?.inviteCode && (
          <div
            onClick={handleCopyInviteCode}
            className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between cursor-pointer hover:border-emerald-300 transition group"
            title="Klik untuk menyalin kode undangan keluarga"
          >
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 font-medium block">Kode Undangan:</span>
              <span className="text-xs font-mono font-bold text-emerald-800 tracking-wider">
                {household.inviteCode}
              </span>
            </div>
            <div className="p-1 text-slate-400 group-hover:text-emerald-600 transition">
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </div>
          </div>
        )}

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div
            onClick={() => onSelectTab("settings")}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
          >
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm shrink-0 group-hover:border-emerald-500 transition"
              />
            ) : userProfile?.avatar ? (
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm shadow-sm shrink-0">
                {userProfile.avatar}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Users className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700 transition">
                {userProfile?.displayName || user?.email?.split("@")[0] || "Pengguna"}
              </p>
              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {userProfile?.role === "owner" ? "Kepala Keluarga" : "Anggota"}
              </p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            title="Keluar dari akun"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
