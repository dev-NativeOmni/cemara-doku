"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PapercutPineArt } from "./PapercutPineArt";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  PlusCircle,
  Users,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export function AuthScreen() {
  const { user, userProfile, loginGoogle, loginEmail, registerEmail, createHousehold, joinHousehold } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [onboardingMode, setOnboardingMode] = useState<"choose" | "create" | "join">("choose");

  // Auth form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  // =========================================================================
  // ONBOARDING SCREEN (If logged in but without household)
  // =========================================================================
  if (user && !userProfile?.householdId) {
    return (
      <div className="min-h-screen bg-[#EAF0EC] dark:bg-[#0B130E] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
        {/* Soft Background Botanical Ambience */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-300/25 dark:bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2D4E3D]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Master Card with Papercut Art */}
        <div className="w-full max-w-4xl min-h-[560px] bg-white dark:bg-slate-900 rounded-[36px] sm:rounded-[44px] shadow-[0_25px_70px_rgba(18,45,30,0.18)] border border-slate-100 dark:border-emerald-950/60 overflow-hidden flex flex-col md:flex-row relative z-10">
          {/* Left Form Area */}
          <div className="w-full md:w-[55%] p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 p-2 flex items-center justify-center shadow-sm">
                <img src="/logo.png" alt="Cemara Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Selamat Datang!</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hai, <span className="font-bold text-[#3D5A47] dark:text-emerald-400">{user.displayName || user.email}</span>
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {onboardingMode === "choose" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Pilih cara untuk memulai buku kas rumah tangga Anda:
                </p>

                <button
                  onClick={() => setOnboardingMode("create")}
                  className="w-full p-4 rounded-3xl border-2 border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all duration-300 flex items-center gap-4 text-left group hover:scale-[1.01]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#3D5A47] text-white flex items-center justify-center shrink-0 shadow-md">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-[#3D5A47] dark:group-hover:text-emerald-400">
                      Buat Buku Kas Baru
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Mulai sebagai Kepala Keluarga & dapatkan kode undangan
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#3D5A47] dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setOnboardingMode("join")}
                  className="w-full p-4 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850 transition-all duration-300 flex items-center gap-4 text-left group hover:scale-[1.01]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-slate-900 dark:group-hover:text-white">
                      Gabung Buku Kas Pasangan
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Masukkan 6 digit kode undangan dari pasangan Anda
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {onboardingMode === "create" && (
              <form onSubmit={handleCreateHousehold} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 ml-4 mb-1.5">
                    Nama Rumah Tangga / Keluarga
                  </label>
                  <input
                    type="text"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    placeholder="Misal: Keluarga Cemara"
                    required
                    className="w-full px-5 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5A47] transition shadow-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOnboardingMode("choose")}
                    className="w-1/3 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 rounded-full bg-[#3D5A47] hover:bg-[#2D4536] text-white font-bold text-xs shadow-lg shadow-[#3D5A47]/30 disabled:opacity-50 transition active:scale-95"
                  >
                    {submitting ? "Membuat..." : "Buat & Mulai"}
                  </button>
                </div>
              </form>
            )}

            {onboardingMode === "join" && (
              <form onSubmit={handleJoinHousehold} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 ml-4 mb-1.5">
                    Kode Undangan (6 Digit)
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="CONTOH: 7K2M9P"
                    maxLength={10}
                    required
                    className="w-full px-5 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center text-lg tracking-widest font-mono font-bold text-slate-800 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#3D5A47] transition shadow-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOnboardingMode("choose")}
                    className="w-1/3 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !inviteCode.trim()}
                    className="flex-1 py-3.5 rounded-full bg-[#3D5A47] hover:bg-[#2D4536] text-white font-bold text-xs shadow-lg shadow-[#3D5A47]/30 disabled:opacity-50 transition active:scale-95"
                  >
                    {submitting ? "Memproses..." : "Gabung Sekarang"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Papercut Pine Art */}
          <div className="hidden md:block w-[45%] relative">
            <PapercutPineArt />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN LOGIN / REGISTER SCREEN (Matching the Exact Reference Art)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#EFF4F1] dark:bg-[#0A120D] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-[#3D5A47] selection:text-white">
      {/* Soft Blurred Background Leaf Ambience */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#3D5A47]/15 dark:bg-emerald-950/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#264433]/15 dark:bg-emerald-950/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-4xl min-h-[590px] bg-white dark:bg-slate-900 rounded-[36px] sm:rounded-[44px] shadow-[0_25px_70px_rgba(18,45,30,0.18)] border border-slate-100 dark:border-emerald-950/60 overflow-hidden flex flex-col md:flex-row relative z-10">
        {/* ================================================================= */}
        {/* LEFT FORM SECTION                                                 */}
        {/* ================================================================= */}
        <div className="w-full md:w-[54%] p-8 sm:p-12 lg:p-14 flex flex-col justify-center relative z-20">
          {/* Header Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-1">
              {mode === "login" ? "Log in" : "Daftar Akun"}
            </h1>
            <p className="text-xs text-slate-400">
              {mode === "login"
                ? "Masuk ke buku kas rumah tangga Cemara Anda"
                : "Daftarkan akun baru untuk mengelola keuangan keluarga"}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 ml-4 mb-1">
                  Nama lengkap
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Misal: Ayah / Bunda / Iswah"
                  required
                  className="w-full px-5 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5A47] dark:focus:ring-emerald-500 transition shadow-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 ml-4 mb-1">
                Login, email or phone number
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full px-5 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5A47] dark:focus:ring-emerald-500 transition shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 ml-4 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-5 pr-12 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5A47] dark:focus:ring-emerald-500 transition shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-full bg-[#3D5A47] hover:bg-[#2D4536] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#3D5A47]/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
              >
                {submitting ? "Memproses..." : mode === "login" ? "Log in" : "Daftar Akun"}
              </button>
            </div>
          </form>

          {/* Social Divider */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
            <span className="bg-white dark:bg-slate-900 px-4 text-xs text-slate-400 font-medium whitespace-nowrap">
              — or log in with —
            </span>
            <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
          </div>

          {/* Social Buttons */}
          <div className="flex items-center justify-center gap-3">
            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center justify-center transition shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50"
              title="Masuk dengan Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            </button>
          </div>

          {/* Bottom Switcher */}
          <div className="text-center mt-6">
            {mode === "login" ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                  className="text-[#3D5A47] dark:text-emerald-400 font-bold hover:underline"
                >
                  Daftar sekarang
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sudah memiliki akun?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="text-[#3D5A47] dark:text-emerald-400 font-bold hover:underline"
                >
                  Masuk di sini
                </button>
              </p>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT PAPERCUT PINE ART SECTION                                  */}
        {/* ================================================================= */}
        <div className="hidden md:block w-[46%] relative overflow-hidden">
          <PapercutPineArt />
        </div>
      </div>
    </div>
  );
}
