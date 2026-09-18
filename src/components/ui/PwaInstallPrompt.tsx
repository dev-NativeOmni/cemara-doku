"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user dismissed recently
    const dismissedUntil = localStorage.getItem("cemara_pwa_dismissed");
    if (dismissedUntil && new Date().getTime() < parseInt(dismissedUntil, 10)) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Hide for 7 days
    const nextWeek = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("cemara_pwa_dismissed", nextWeek.toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto sm:max-w-sm z-40 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 flex items-center justify-center shrink-0">
          <img src="/logo.png" alt="Cemara" className="w-full h-full object-contain drop-shadow" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
            Pasang Aplikasi Cemara
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Akses lebih cepat & dapat dibuka secara offline di layar utama HP Anda.
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pasang</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Nanti Saja
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg self-start"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

