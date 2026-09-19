"use client";

import React from "react";

interface LiquidHomeButtonProps {
  isActive: boolean;
  onClick: () => void;
  showLabel?: boolean;
}

export function LiquidHomeButton({ isActive, onClick, showLabel = false }: LiquidHomeButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center justify-center focus:outline-none select-none transition-transform duration-300 active:scale-95"
      aria-label="Beranda"
    >
      {/* Outer Dark Glass Capsule Pill Container (matching the source image) */}
      <div
        className={`relative flex items-center gap-2.5 px-1.5 py-1 rounded-full transition-all duration-500 backdrop-blur-xl ${
          isActive
            ? "bg-[#16181d]/90 dark:bg-[#0e1015]/95 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_-1px_1px_rgba(0,0,0,0.8)] border border-white/10"
            : "bg-[#1a1d24]/70 dark:bg-[#12141a]/80 shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/5 opacity-85 hover:opacity-100"
        }`}
      >
        {/* The Circular Button Area with the Chromatic Prism Ring */}
        <div className="relative w-[52px] h-[52px] flex items-center justify-center shrink-0">
          {/* 1. Ambient Caustic Glow Aura (underneath diffusion) */}
          <div
            className={`absolute -inset-1.5 rounded-full blur-md transition-all duration-700 pointer-events-none ${
              isActive
                ? "opacity-100 animate-liquid-pulse"
                : "opacity-40 group-hover:opacity-75"
            }`}
            style={{
              background:
                "radial-gradient(circle, rgba(255, 184, 0, 0.45) 0%, rgba(0, 229, 255, 0.35) 40%, rgba(236, 72, 153, 0.25) 70%, transparent 85%)",
            }}
          />

          {/* 2. Outer Beveled Track Rim (Machined dark metallic bezel) */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#3a3f4b] via-[#1e2128] to-[#0d0e12] p-[2.5px] shadow-[0_4px_12px_rgba(0,0,0,0.7)]">
            {/* 3. The Rotating Liquid Chromatic Rainbow Prism Ring */}
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <div
                className={`absolute -inset-[50%] w-[200%] h-[200%] animate-liquid-spin ${
                  isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                }`}
                style={{
                  background:
                    "conic-gradient(from 0deg, #ff0055 0%, #ff3b00 8%, #ffaa00 16%, #ffffff 22%, #fff677 27%, #ff9900 32%, #00ff88 44%, #00e1ff 55%, #0066ff 68%, #7e22ce 78%, #ec4899 88%, #ff0055 100%)",
                }}
              />

              {/* High-intensity Specular Hotspot Beam Overlay */}
              <div
                className="absolute -inset-[50%] w-[200%] h-[200%] animate-liquid-spin pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 15%, rgba(255,255,255,0.95) 0%, rgba(255,230,100,0.8) 12%, rgba(255,80,0,0.5) 25%, transparent 50%)",
                }}
              />
            </div>
          </div>

          {/* 4. Top Glint / Hot Flare Highlight (The fiery white-yellow star at top of ring) */}
          <div className="absolute top-[1px] left-1/2 -translate-x-1/2 w-4 h-2 bg-gradient-to-r from-amber-300 via-white to-amber-200 rounded-full blur-[0.6px] shadow-[0_0_8px_#ffffff,0_0_16px_#ffb800,0_0_24px_#ff4500] pointer-events-none z-20" />

          {/* 5. Bottom Secondary Prism Glint */}
          <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-3.5 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-200 to-purple-400 rounded-full blur-[0.8px] opacity-80 pointer-events-none z-20" />

          {/* 6. Central Elevated Inset Matte Button Disc */}
          <div
            className={`relative z-10 w-[41px] h-[41px] rounded-full flex items-center justify-center transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-b from-[#2d313a] via-[#1c1e25] to-[#111317] shadow-[inset_0_2px_3px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.85),0_2px_8px_rgba(0,0,0,0.6)]"
                : "bg-gradient-to-b from-[#262a32] via-[#181a20] to-[#0e1014] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.12),inset_0_-2px_4px_rgba(0,0,0,0.8)]"
            }`}
          >
            {/* Inner Glass Bevel Ring */}
            <div className="absolute inset-[1px] rounded-full border border-white/10 pointer-events-none" />

            {/* 3D Tactile Silver-White House Icon */}
            <svg
              className={`w-[21px] h-[21px] transition-transform duration-300 ${
                isActive
                  ? "scale-105 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-white"
                  : "text-slate-300 group-hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2.5L2 11.5H5.5V20.5C5.5 21.05 5.95 21.5 6.5 21.5H10.5V15.5C10.5 14.95 10.95 14.5 11.5 14.5H12.5C13.05 14.5 13.5 14.95 13.5 15.5V21.5H17.5C18.05 21.5 18.5 21.05 18.5 20.5V11.5H22L12 2.5Z" />
            </svg>
          </div>
        </div>

        {/* Optional "Home" Text Label (if capsule style expanded) */}
        {showLabel && (
          <span
            className={`text-xs font-extrabold pr-2.5 tracking-wide transition-colors ${
              isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
            }`}
          >
            Home
          </span>
        )}
      </div>
    </button>
  );
}
