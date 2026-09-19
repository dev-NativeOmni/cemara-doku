"use client";

import React from "react";

interface LiquidHomeButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export function LiquidHomeButton({ isActive, onClick }: LiquidHomeButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center justify-center focus:outline-none select-none transition-all duration-300 active:scale-90"
      aria-label="Beranda"
    >
      {/* Outer Dark Frosted Glass Pod Rim */}
      <div
        className={`relative w-[54px] h-[54px] rounded-full p-[2px] transition-all duration-500 flex items-center justify-center ${
          isActive
            ? "scale-105"
            : "hover:scale-102 opacity-85 hover:opacity-100"
        }`}
      >
        {/* Ambient Diffuse Glow Aura */}
        <div
          className={`absolute -inset-2 rounded-full blur-md transition-opacity duration-500 pointer-events-none ${
            isActive ? "opacity-95 animate-liquid-pulse" : "opacity-40 group-hover:opacity-75"
          }`}
          style={{
            background:
              "radial-gradient(circle, rgba(255, 200, 80, 0.45) 0%, rgba(0, 229, 255, 0.35) 45%, rgba(236, 72, 153, 0.25) 75%, transparent 90%)",
          }}
        />

        {/* SVG Canvas for Pixel-Exact Chromatic Dispersion & Bevels */}
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 overflow-visible">
          <defs>
            {/* Outer Bevel Gradient */}
            <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a505d" />
              <stop offset="40%" stopColor="#22252c" />
              <stop offset="100%" stopColor="#111317" />
            </linearGradient>

            {/* Inner Disc Gradient */}
            <linearGradient id="discGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#323640" />
              <stop offset="45%" stopColor="#1e2026" />
              <stop offset="100%" stopColor="#131418" />
            </linearGradient>

            {/* 3D Metallic House Gradient */}
            <linearGradient id="houseMetalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#E4E7EE" />
              <stop offset="100%" stopColor="#B2B8C4" />
            </linearGradient>

            {/* Rotating Conic Rainbow Dispersion */}
            <linearGradient id="causticTop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="15%" stopColor="#7B00FF" />
              <stop offset="30%" stopColor="#FF0055" />
              <stop offset="42%" stopColor="#FF8800" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="58%" stopColor="#FFEA00" />
              <stop offset="70%" stopColor="#FF4400" />
              <stop offset="85%" stopColor="#00FF88" />
              <stop offset="100%" stopColor="#00CCFF" />
            </linearGradient>

            <linearGradient id="causticBottom" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF0077" />
              <stop offset="25%" stopColor="#FF9900" />
              <stop offset="45%" stopColor="#00FFFF" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#0077FF" />
              <stop offset="75%" stopColor="#7700FF" />
              <stop offset="100%" stopColor="#FF0077" />
            </linearGradient>

            {/* Shadow filter for 3D embossed house */}
            <filter id="houseShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* 1. Outer Dark Bevel Track */}
          <circle cx="50" cy="50" r="48" fill="url(#bezelGrad)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

          {/* 2. Rotating Chromatic Dispersion Caustic Ring */}
          <g className="animate-liquid-spin origin-center">
            {/* Outer Rainbow Spectrum Track */}
            <circle
              cx="50"
              cy="50"
              r="43"
              fill="none"
              stroke="url(#causticTop)"
              strokeWidth="5"
              strokeDasharray="270"
              strokeDashoffset="0"
              strokeLinecap="round"
              className="opacity-95"
            />
            <circle
              cx="50"
              cy="50"
              r="43"
              fill="none"
              stroke="url(#causticBottom)"
              strokeWidth="4"
              strokeDasharray="120"
              strokeDashoffset="180"
              strokeLinecap="round"
              className="opacity-90"
            />
          </g>

          {/* 3. Static Fiery Hot White-Gold Flare at Top (12 o'clock) */}
          <path
            d="M 28 20 A 43 43 0 0 1 72 20"
            fill="none"
            stroke="#FFF8C0"
            strokeWidth="4"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_#ffffff] drop-shadow-[0_0_16px_#ffb800]"
          />
          {/* Pure White Hot Core */}
          <ellipse
            cx="50"
            cy="7.5"
            rx="9"
            ry="3"
            fill="#FFFFFF"
            className="drop-shadow-[0_0_6px_#ffffff] drop-shadow-[0_0_12px_#ffea79]"
          />

          {/* 4. Bottom Specular Cyan-Blue Glint (6 o'clock) */}
          <path
            d="M 35 88 A 43 43 0 0 0 65 88"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="3"
            strokeLinecap="round"
            className="drop-shadow-[0_0_6px_#00E5FF] opacity-90"
          />
          <ellipse
            cx="50"
            cy="92.5"
            rx="7"
            ry="2"
            fill="#E0FFFF"
            className="drop-shadow-[0_0_4px_#00E5FF] opacity-95"
          />

          {/* 5. Inset Matte Dark Center Disc */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="url(#discGrad)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.2"
            className="shadow-inner"
          />

          {/* Inner Glass Bevel Stroke */}
          <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1" />

          {/* 6. 3D Metallic Silver House Icon (Exact geometry from image) */}
          <path
            d="M 50 27 L 27 46 L 33 46 L 33 69 C 33 70.5 34.2 71.5 35.5 71.5 L 45 71.5 L 45 58.5 C 45 57 46.2 56 47.5 56 L 52.5 56 C 53.8 56 55 57 55 58.5 L 55 71.5 L 64.5 71.5 C 65.8 71.5 67 70.5 67 69 L 67 46 L 73 46 Z"
            fill="url(#houseMetalGrad)"
            filter="url(#houseShadow)"
          />
        </svg>
      </div>
    </button>
  );
}
