"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Trees, Mail, Lock, User, ArrowRight, PlusCircle, Users, AlertCircle } from "lucide-react";

export function AuthScreen() {
  const { user, userProfile, loginGoogle, loginEmail, registerEmail, createHousehold, joinHousehold } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [onboardingMode, setOnboardingMode] = useState<"choose" | "create" | "join">("choose");

  // Auth form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Household onboarding states
  const [householdName, setHouseholdName] = useState("Keluarga Kami");
  const [inviteCode, setInviteCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await loginEmail(email, password);
      } else {
        if (!displayName.trim()) {
          throw new Error("Nama lengkap harus diisi");
        }
        await registerEmail(email, password, displayName);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat masuk");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal masuk dengan Google");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createHousehold(householdName);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal membuat buku kas keluarga");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await joinHousehold(inviteCode);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal bergabung ke keluarga");
    } finally {
      setSubmitting(false);
    }
  };

  // If user is authenticated but not yet associated with a household
  if (user && !userProfile?.householdId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
              <Trees className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Selamat Datang di Cemara!</h1>
            <p className="text-sm text-slate-500 mt-1">
              Halo, <span className="font-semibold text-slate-700">{user.displayName || user.email}</span>. Pilih cara memulai buku kas rumah tangga Anda.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {onboardingMode === "choose" && (
            <div className="space-y-4">
              <button
                onClick={() => setOnboardingMode("create")}
                className="w-full p-4.5 rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/50 hover:bg-emerald-50 transition flex items-center gap-4 text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-base group-hover:text-emerald-800">Buat Buku Kas Baru</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Mulai buku kas baru untuk keluarga Anda dan dapatkan kode undangan</p>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-600" />
              </button>

              <button
                onClick={() => setOnboardingMode("join")}
                className="w-full p-4.5 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white transition flex items-center gap-4 text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-base group-hover:text-slate-900">Gabung Buku Kas Pasangan</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Masukkan 6 digit kode undangan yang diberikan pasangan Anda</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          )}

          {onboardingMode === "create" && (
            <form onSubmit={handleCreateHousehold} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Nama Rumah Tangga / Keluarga
                </label>
                <input
                  type="text"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  placeholder="Misal: Keluarga Cemara"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOnboardingMode("choose")}
                  className="w-1/3 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
                >
                  {submitting ? "Membuat..." : "Buat & Mulai"}
                </button>
              </div>
            </form>
          )}

          {onboardingMode === "join" && (
            <form onSubmit={handleJoinHousehold} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Kode Undangan (6 Digit)
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="CONTOH: 7K2M9P"
                  maxLength={10}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl tracking-widest font-mono font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOnboardingMode("choose")}
                  className="w-1/3 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm transition"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={submitting || !inviteCode.trim()}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
                >
                  {submitting ? "Memproses..." : "Gabung Sekarang"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-900/20">
        {/* Brand Header */}
        <div className="bg-emerald-700 px-6 pt-8 pb-7 text-center relative overflow-hidden text-white">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-600 rounded-full blur-2xl opacity-60 pointer-events-none" />
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl mb-3 shadow-inner border border-white/20">
            <Trees className="w-8 h-8 text-emerald-200" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Cemara</h1>
          <p className="text-emerald-100 text-xs mt-1">Pencatatan Keuangan Rumah Tangga yang Rapi & Harmonis</p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition ${
              mode === "login"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(null); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition ${
              mode === "register"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm flex items-center justify-center gap-3 transition shadow-sm mb-5 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Lanjutkan dengan Google</span>
          </button>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 uppercase font-medium">atau via email</span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap / Panggilan
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Misal: Ayah / Bunda"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 mt-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-md shadow-emerald-700/25 disabled:opacity-50 transition"
            >
              {submitting ? "Memproses..." : mode === "login" ? "Masuk ke Aplikasi" : "Daftar Akun"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

