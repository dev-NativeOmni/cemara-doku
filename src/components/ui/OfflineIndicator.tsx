"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showBackOnline, setShowBackOnline] = useState<boolean>(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      const timer = setTimeout(() => setShowBackOnline(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showBackOnline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300 pointer-events-none">
      {!isOnline ? (
        <div className="bg-amber-600/95 dark:bg-amber-700/95 text-white px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 text-xs font-bold border border-amber-400/40">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Mode Offline • Data tetap tersimpan di perangkat</span>
        </div>
      ) : (
        <div className="bg-emerald-600/95 dark:bg-emerald-700/95 text-white px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 text-xs font-bold border border-emerald-400/40">
          <Wifi className="w-3.5 h-3.5" />
          <span>Kembali Online • Sinkronisasi cloud aktif</span>
        </div>
      )}
    </div>
  );
}

