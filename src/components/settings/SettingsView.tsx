"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Category, UserProfile } from "@/types";
import { createCategory, deleteCategory } from "@/services/categoryService";
import { getHouseholdMembers } from "@/services/authService";
import { compressImageFile } from "@/lib/imageUtils";
import { DynamicIcon } from "../ui/DynamicIcon";
import { CategoryModal } from "../categories/CategoryModal";
import {
  Copy,
  Check,
  LogOut,
  Users,
  Shield,
  Heart,
  Plus,
  Trash2,
  Tag,
  Camera,
  Save,
  Upload,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Crown,
} from "lucide-react";

interface SettingsViewProps {
  categories: Category[];
  onRefreshCategories: () => Promise<void>;
}

const AVATAR_PRESETS = [
  "👨‍💼", "👩‍💼", "👨‍🦱", "👩‍🦰", 
  "👨‍🦳", "👩‍🦳", "🧔", "🧕", 
  "👶", "🧑‍💻", "🌿", "🌸", 
  "👑", "🐻", "🐱", "🦊"
];

export function SettingsView({ categories, onRefreshCategories }: SettingsViewProps) {
  const { user, userProfile, household, updateProfile, changeMemberRole, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Members state
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [updatingRoleUid, setUpdatingRoleUid] = useState<string | null>(null);

  // Profile Edit State
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.avatar || AVATAR_PRESETS[0]);
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || user?.photoURL || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Category manager state
  const [categoryType, setCategoryType] = useState<"expense" | "income">("expense");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load all household members
  const fetchMembers = useCallback(async () => {
    if (!household?.memberUids || household.memberUids.length === 0) return;
    setLoadingMembers(true);
    try {
      const fetched = await getHouseholdMembers(household.memberUids);
      setMembers(fetched);
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setLoadingMembers(false);
    }
  }, [household?.memberUids]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "");
      setSelectedAvatar(userProfile.avatar || AVATAR_PRESETS[0]);
      setPhotoURL(userProfile.photoURL || user?.photoURL || "");
    }
  }, [userProfile, user?.photoURL]);

  const handleCopyInviteCode = () => {
    if (!household?.inviteCode) return;
    navigator.clipboard.writeText(household.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 256, 256, 0.85);
      setPhotoURL(compressedDataUrl);
    } catch (err) {
      console.error("Gagal mengunggah foto:", err);
      alert("Gagal mengunggah foto profil");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleResetToGooglePhoto = () => {
    if (user?.photoURL) {
      setPhotoURL(user.photoURL);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoURL("");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setSavingProfile(true);
    setProfileSuccess(false);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        avatar: selectedAvatar,
        photoURL: photoURL.trim() || "",
      });
      setProfileSuccess(true);
      await fetchMembers();
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleRole = async (targetUid: string, currentRole: "owner" | "member") => {
    const newRole = currentRole === "owner" ? "member" : "owner";
    const confirmMsg =
      newRole === "owner"
        ? "Jadikan anggota ini sebagai Kepala Keluarga?"
        : "Ubah peran Kepala Keluarga ini menjadi Anggota?";
    if (!confirm(confirmMsg)) return;

    setUpdatingRoleUid(targetUid);
    try {
      await changeMemberRole(targetUid, newRole);
      await fetchMembers();
    } catch (err) {
      console.error("Gagal mengubah peran:", err);
      alert("Gagal mengubah peran anggota");
    } finally {
      setUpdatingRoleUid(null);
    }
  };

  const handleCreateCategory = async (newCat: Omit<Category, "id">): Promise<string> => {
    if (!household) throw new Error("Rumah tangga tidak ditemukan");
    const id = await createCategory(household.id, newCat);
    await onRefreshCategories();
    return id;
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    if (!household) return;
    setDeletingId(cat.id);
    try {
      await deleteCategory(household.id, cat.id);
      await onRefreshCategories();
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === categoryType);

  return (
    <div className="space-y-6 pb-28 max-w-5xl mx-auto px-4 pt-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Profile & Infra */}
        <div className="space-y-6">
          {/* 1. Profile & Avatar Edit Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Foto Profil & Akun</h4>
                <p className="text-xs text-slate-400">Unggah foto profil kustom atau gunakan foto akun Google Anda</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Clickable Profile Photo with upload overlay */}
                <div className="relative group shrink-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400/40 flex items-center justify-center text-4xl shadow-inner overflow-hidden cursor-pointer relative"
                    title="Klik untuk unggah foto baru"
                  >
                    {photoURL ? (
                      <img
                        src={photoURL}
                        alt="Foto Profil"
                        className="w-full h-full object-cover"
                        onError={() => setPhotoURL("")}
                      />
                    ) : (
                      <span>{selectedAvatar}</span>
                    )}

                    {/* Hover Camera Overlay */}
                    <div className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-2xl">
                      <Camera className="w-6 h-6" />
                      <span className="text-[9px] font-bold mt-0.5">Ubah Foto</span>
                    </div>
                  </div>

                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 rounded-2xl flex items-center justify-center text-xs text-emerald-600 dark:text-emerald-300 font-bold">
                      Memproses...
                    </div>
                  )}
                </div>

                {/* Display Name & Action Buttons */}
                <div className="flex-1 w-full space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Nama Panggilan
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Misal: Ayah / Bunda / Iswah"
                      required
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  {/* Photo Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs font-semibold transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Foto</span>
                    </button>

                    {user?.photoURL && photoURL !== user.photoURL && (
                      <button
                        type="button"
                        onClick={handleResetToGooglePhoto}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium transition"
                        title="Gunakan foto dari akun Google"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Foto Google</span>
                      </button>
                    )}

                    {photoURL && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-medium transition"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Avatar Preset Grid */}
              {!photoURL && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Atau Pilih Karakter Avatar
                  </label>
                  <div className="grid grid-cols-8 gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                    {AVATAR_PRESETS.map((av) => (
                      <button
                        type="button"
                        key={av}
                        onClick={() => {
                          setSelectedAvatar(av);
                          setPhotoURL("");
                        }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition transform hover:scale-110 ${
                          selectedAvatar === av && !photoURL
                            ? "bg-white dark:bg-slate-700 shadow-md ring-2 ring-emerald-400"
                            : "hover:bg-white/80"
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                {profileSuccess ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Profil & Foto berhasil disimpan!
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">{user?.email}</span>
                )}

                <button
                  type="submit"
                  disabled={savingProfile || !displayName.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingProfile ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Theme Settings Card (Poin 7) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sun className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tema Tampilan</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs font-bold ${
                  theme === "light"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Terang</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs font-bold ${
                  theme === "dark"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Gelap</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs font-bold ${
                  theme === "system"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Sistem</span>
              </button>
            </div>
          </div>

          {/* Technical & Spark Plan Status Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Status Infrastruktur</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-slate-400 text-[11px]">Database</p>
                <p className="font-bold text-slate-800 dark:text-white mt-0.5">Cloud Firestore</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-slate-400 text-[11px]">Biaya Langganan</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Rp 0 (Spark Plan)</p>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={signOut}
            className="w-full py-3.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300 rounded-2xl font-bold text-xs border border-rose-200/80 dark:border-rose-800 flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun</span>
          </button>
        </div>

        {/* Right Column: Household Members & Category Management */}
        <div className="space-y-6">
          {/* 2. Household & Registered Members Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/60 p-1.5 flex items-center justify-center shadow-sm">
                <img src="/logo.png" alt="Cemara" className="w-full h-full object-contain drop-shadow" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">{household?.name || "Keluarga Cemara"}</h3>
                <p className="text-xs text-slate-400">Buku Kas Rumah Tangga Kolaboratif</p>
              </div>
            </div>

            {/* Invite Code Box */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  <span>Kode Undangan Pasangan</span>
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold border border-emerald-200 dark:border-emerald-800">
                  Buku Kas Bersama
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Bagikan kode 6-digit ini ke pasangan Anda agar dapat login dan mengelola buku kas bersama secara real-time:
              </p>

              <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3 mt-1 shadow-sm">
                <span className="font-mono text-xl font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400">
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

            {/* Missing Owner Alert */}
            {members.length > 0 && !members.some((m) => m.role === "owner") && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200">Belum ada Kepala Keluarga</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">Pulihkan status Kepala Keluarga untuk mengelola rumah tangga</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => user && handleToggleRole(user.uid, "member")}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-bold shrink-0 shadow-sm transition"
                >
                  Jadikan Saya Kepala
                </button>
              </div>
            )}

            {/* Members List */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Anggota Terdaftar ({members.length || household?.memberUids.length || 1})</span>
                </h4>
                {loadingMembers && <span className="text-[10px] text-slate-400">Memuat anggota...</span>}
              </div>

              <div className="space-y-2">
                {(members.length > 0 ? members : userProfile ? [userProfile] : []).map((m) => {
                  const isCurrentUserOwner = userProfile?.role === "owner";
                  const noOwnerInHousehold = !members.some((item) => item.role === "owner");
                  const canManageThisUser = isCurrentUserOwner || noOwnerInHousehold || m.uid === user?.uid;

                  return (
                    <div
                      key={m.uid}
                      className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-xl shadow-inner shrink-0 overflow-hidden">
                          {m.photoURL ? (
                            <img src={m.photoURL} alt={m.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{m.avatar || "👤"}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white truncate flex items-center gap-1.5">
                            <span>{m.displayName || "Pengguna"}</span>
                            {m.uid === user?.uid && (
                              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.2 rounded">
                                (Saya)
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{m.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {updatingRoleUid === m.uid ? (
                          <span className="text-[10px] text-slate-400 font-medium">Menyimpan...</span>
                        ) : (
                          <>
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0 ${
                                m.role === "owner"
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                  : "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300"
                              }`}
                            >
                              {m.role === "owner" && <Crown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                              {m.role === "owner" ? "Kepala Keluarga" : "Anggota"}
                            </span>

                            {canManageThisUser && (
                              <button
                                type="button"
                                onClick={() => handleToggleRole(m.uid, m.role)}
                                title={m.role === "owner" ? "Ubah jadi Anggota" : "Jadikan Kepala Keluarga"}
                                className="text-[10px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition"
                              >
                                {m.role === "owner" ? "Jadikan Anggota" : "Jadikan Kepala"}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Category Management Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Kelola Kategori</h4>
                  <p className="text-xs text-slate-400">Pemasukan & Pengeluaran Kustom</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {/* Category Type Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCategoryType("expense")}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  categoryType === "expense"
                    ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                Pengeluaran ({categories.filter((c) => c.type === "expense").length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryType("income")}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  categoryType === "income"
                    ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                Pemasukan ({categories.filter((c) => c.type === "income").length})
              </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredCategories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: c.color || "#10B981" }}
                    >
                      <DynamicIcon name={c.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{c.name}</p>
                      <span className="text-[10px] text-slate-400">
                        {c.isDefault ? "Bawaan" : "Kustom"}
                      </span>
                    </div>
                  </div>

                  {!c.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(c)}
                      disabled={deletingId === c.id}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Creation Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        defaultType={categoryType}
        onSave={handleCreateCategory}
      />
    </div>
  );
}
