"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Copy, Check, LogOut, Trees, Users, Shield, Sparkles, Heart } from "lucide-react";

export function SettingsView() {
  const { user, userProfile, household, signOut } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyInviteCode = () => {
    if (!household?.inviteCode) return;
    navigator.clipboard.writeText(household.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 pb-24 max-w-2xl mx-auto px-4 pt-2">
      {/* Household Info Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
            <Trees className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{household?.name || "Keluarga Cemara"}</h3>
            <p className="text-xs text-slate-400">Buku Kas Rumah Tangga Kolaboratif</p>
          </div>
        </div>

        {/* Invite Code Box */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Kode Undangan Pasangan</span>
            </span>
            <span className="text-[10px] bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              Buku Kas Bersama
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Bagikan kode 6-digit ini ke pasangan Anda agar dapat login dan mengelola buku kas bersama secara real-time:
          </p>

          <div className="flex items-center justify-between bg-white border border-emerald-200 rounded-xl p-3 mt-1 shadow-sm">
            <span className="font-mono text-xl font-extrabold tracking-widest text-emerald-900">
              {household?.inviteCode || "------"}
            </span>

            <button
              onClick={handleCopyInviteCode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Tersalin!" : "Salin Kode"}</span>
            </button>
          </div>
        </div>

        {/* Member list info */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>Anggota Terdaftar</span>
          </h4>
          <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                {userProfile?.displayName?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{userProfile?.displayName}</p>
                <p className="text-[11px] text-slate-400">{user?.email}</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold uppercase">
              {userProfile?.role === "owner" ? "Kepala Keluarga" : "Anggota"}
            </span>
          </div>
        </div>
      </div>

      {/* Technical & Spark Plan Status Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Status Infrastruktur</span>
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-slate-400 text-[11px]">Database</p>
            <p className="font-bold text-slate-800 mt-0.5">Cloud Firestore</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-slate-400 text-[11px]">Biaya Langganan</p>
            <p className="font-bold text-emerald-600 mt-0.5">Rp 0 (Spark Plan)</p>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={signOut}
        className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-bold text-xs border border-rose-200/80 flex items-center justify-center gap-2 transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Keluar dari Akun</span>
      </button>
    </div>
  );
}

