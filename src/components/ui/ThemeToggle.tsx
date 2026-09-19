"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ThemeToggle({ size = "md", className = "" }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  // Size variations
  const sizeMap = {
    sm: { width: "w-[68px]", height: "h-[34px]" },
    md: { width: "w-[84px]", height: "h-[42px]" },
    lg: { width: "w-[124px]", height: "h-[62px]" },
  };

  const { width, height } = sizeMap[size] || sizeMap.md;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative inline-flex items-center justify-center p-0.5 rounded-full focus:outline-none select-none transition-transform duration-300 active:scale-95 ${width} ${height} ${className}`}
      aria-label={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
      title={isDark ? "Mode Gelap aktif (Klik untuk Mode Terang)" : "Mode Terang aktif (Klik untuk Mode Gelap)"}
    >
      {/* Outer ambient glow based on active state */}
      <div
        className={`absolute -inset-1 rounded-full blur-md transition-all duration-700 pointer-events-none opacity-60 group-hover:opacity-90 ${
          isDark
            ? "bg-gradient-to-r from-transparent via-sky-500/20 to-blue-500/50"
            : "bg-gradient-to-r from-amber-500/50 via-orange-500/20 to-transparent"
        }`}
      />

      {/* Main SVG Skeuomorphic Toggle Switch Canvas */}
      <svg
        viewBox="0 0 200 100"
        className="w-full h-full relative z-10 overflow-visible drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Outer Housing 3D Bevel Gradient */}
          <linearGradient id="toggleOuterBevel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3c404d" />
            <stop offset="35%" stopColor="#22252c" />
            <stop offset="100%" stopColor="#101115" />
          </linearGradient>

          {/* Inner Capsule Track Dark Matte Surface */}
          <linearGradient id="toggleInnerTrack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#17181e" />
            <stop offset="50%" stopColor="#20222a" />
            <stop offset="100%" stopColor="#131418" />
          </linearGradient>

          {/* Knob Outer Metallic Ring Gradient */}
          <linearGradient id="knobMetalBezel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#585e6e" />
            <stop offset="30%" stopColor="#3b3f4c" />
            <stop offset="70%" stopColor="#1e2027" />
            <stop offset="100%" stopColor="#121318" />
          </linearGradient>

          {/* Knob Inner Glass Dish Dark Tint */}
          <linearGradient id="knobInnerDish" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#262a36" />
            <stop offset="50%" stopColor="#181b24" />
            <stop offset="100%" stopColor="#0e1015" />
          </linearGradient>

          {/* Sun Core Radial Warm Glow */}
          <radialGradient id="sunCoreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF4D0" />
            <stop offset="45%" stopColor="#FFC107" />
            <stop offset="100%" stopColor="#FF9800" />
          </radialGradient>

          {/* Moon Glowing Crescent Gradient */}
          <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#DDF2FF" />
            <stop offset="75%" stopColor="#90D5FF" />
            <stop offset="100%" stopColor="#60B0FF" />
          </linearGradient>

          {/* Knob Deep Drop Shadow Filter */}
          <filter id="knobShadowFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="4" stdDeviation="4.5" floodColor="#000000" floodOpacity="0.85" />
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
          </filter>

          {/* Inner Glow Aura Filter */}
          <filter id="neonGlowSun" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="neonGlowMoon" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Outer Extruded Stadium / Pill Housing */}
        <rect
          x="3"
          y="3"
          width="194"
          height="94"
          rx="47"
          ry="47"
          fill="url(#toggleOuterBevel)"
          stroke="#4b5060"
          strokeWidth="1.2"
        />

        {/* 2. Inner Recessed Track */}
        <rect
          x="8"
          y="8"
          width="184"
          height="84"
          rx="42"
          ry="42"
          fill="url(#toggleInnerTrack)"
          stroke="#101115"
          strokeWidth="2.5"
        />

        {/* Inset Top Shadow Overlay on Track */}
        <rect
          x="9"
          y="9"
          width="182"
          height="82"
          rx="41"
          ry="41"
          fill="none"
          stroke="rgba(0,0,0,0.55)"
          strokeWidth="2.5"
        />

        {/* =================================================================== */}
        {/* 3. LEFT (SUN) NEON RIM & AMBER GLOW ARC                             */}
        {/* =================================================================== */}
        <path
          d="M 50 14 A 36 36 0 0 0 50 86"
          fill="none"
          stroke="#FF9E0B"
          strokeWidth="3.2"
          strokeLinecap="round"
          filter="url(#neonGlowSun)"
          className={`transition-opacity duration-500 ${
            !isDark ? "opacity-100 drop-shadow-[0_0_6px_#ff9e0b] drop-shadow-[0_0_12px_#f59e0b]" : "opacity-45"
          }`}
        />
        {/* Inner diffuse ambient amber light on the track */}
        <path
          d="M 50 15 A 35 35 0 0 0 50 85"
          fill="none"
          stroke="#FFAA00"
          strokeWidth="6"
          strokeLinecap="round"
          className={`transition-opacity duration-500 blur-[3px] pointer-events-none ${
            !isDark ? "opacity-75" : "opacity-20"
          }`}
        />

        {/* =================================================================== */}
        {/* 4. RIGHT (MOON) NEON RIM & BLUE GLOW ARC                            */}
        {/* =================================================================== */}
        <path
          d="M 150 14 A 36 36 0 0 1 150 86"
          fill="none"
          stroke="#0088FF"
          strokeWidth="3.2"
          strokeLinecap="round"
          filter="url(#neonGlowMoon)"
          className={`transition-opacity duration-500 ${
            isDark ? "opacity-100 drop-shadow-[0_0_8px_#0088ff] drop-shadow-[0_0_14px_#38bdf8]" : "opacity-45"
          }`}
        />
        {/* Inner diffuse ambient blue light on the track */}
        <path
          d="M 150 15 A 35 35 0 0 1 150 85"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="6"
          strokeLinecap="round"
          className={`transition-opacity duration-500 blur-[3px] pointer-events-none ${
            isDark ? "opacity-80" : "opacity-20"
          }`}
        />

        {/* =================================================================== */}
        {/* 5. BACKGROUND ICONS (Stationary under/behind the sliding knob)       */}
        {/* =================================================================== */}

        {/* Left Side: Sun Icon */}
        <g
          className={`transition-all duration-500 origin-center ${
            !isDark
              ? "opacity-95 scale-100 drop-shadow-[0_0_8px_#ffb300]"
              : "opacity-40 scale-90"
          }`}
        >
          {/* 8 Sun Rays */}
          {/* Top / Bottom */}
          <line x1="50" y1="28" x2="50" y2="34" stroke="#FFC107" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="50" y1="66" x2="50" y2="72" stroke="#FFC107" strokeWidth="2.8" strokeLinecap="round" />
          {/* Left / Right */}
          <line x1="28" y1="50" x2="34" y2="50" stroke="#FFC107" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="66" y1="50" x2="72" y2="50" stroke="#FFC107" strokeWidth="2.8" strokeLinecap="round" />
          {/* Diagonals */}
          <line x1="34.5" y1="34.5" x2="39" y2="39" stroke="#FFC107" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="61" y1="61" x2="65.5" y2="65.5" stroke="#FFC107" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="65.5" y1="34.5" x2="61" y2="39" stroke="#FFC107" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="39" y1="61" x2="34.5" y2="65.5" stroke="#FFC107" strokeWidth="2.8" strokeLinecap="round" />

          {/* Sun Center Orb */}
          <circle cx="50" cy="50" r="9" fill="url(#sunCoreGrad)" stroke="#FFE082" strokeWidth="1" />
        </g>

        {/* Right Side: Moon & Stars Icon */}
        <g
          className={`transition-all duration-500 origin-center ${
            isDark
              ? "opacity-100 scale-100 drop-shadow-[0_0_10px_#60a5fa]"
              : "opacity-40 scale-90"
          }`}
        >
          {/* Twinkling 4-point Stars */}
          {/* Star 1 (Top right) */}
          <path
            d="M 162 38 Q 163 41 166 42 Q 163 43 162 46 Q 161 43 158 42 Q 161 41 162 38 Z"
            fill="#E0F2FE"
            className="drop-shadow-[0_0_3px_#38bdf8]"
          />
          {/* Small Star 2 (Middle) */}
          <circle cx="170" cy="50" r="1.2" fill="#BAE6FD" />
          {/* Small Star 3 (Bottom right) */}
          <circle cx="164" cy="59" r="1" fill="#7DD3FC" />

          {/* Crescent Moon */}
          <path
            d="M 152 32 C 143 32 135 40 135 50 C 135 60 143 68 152 68 C 158 68 163 65 166 60 C 156 61 146 53 146 43 C 146 38 149 34 152 32 Z"
            fill="url(#moonGrad)"
            filter="url(#neonGlowMoon)"
          />
        </g>

        {/* =================================================================== */}
        {/* 6. 3D METALLIC SLIDING KNOB (THUMB)                                 */}
        {/* =================================================================== */}
        <g
          className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            transform: isDark ? "translateX(100px)" : "translateX(0px)",
          }}
        >
          {/* Knob Outer Shadowed Group */}
          <g filter="url(#knobShadowFilter)">
            {/* Outer Metallic Bezel Ring */}
            <circle
              cx="50"
              cy="50"
              r="36"
              fill="url(#knobMetalBezel)"
              stroke="#6b7280"
              strokeWidth="1.2"
            />

            {/* Inner Metallic Step Ring */}
            <circle
              cx="50"
              cy="50"
              r="32.5"
              fill="none"
              stroke="#111317"
              strokeWidth="1.8"
            />

            {/* Inner Dark Glass Dish */}
            <circle
              cx="50"
              cy="50"
              r="31"
              fill="url(#knobInnerDish)"
            />

            {/* Knob Dynamic Neon Aura Inside Disc */}
            <circle
              cx="50"
              cy="50"
              r="29"
              fill="none"
              stroke={isDark ? "#0088FF" : "#FF9E0B"}
              strokeWidth="2.5"
              className={`transition-colors duration-500 ${
                isDark
                  ? "drop-shadow-[0_0_8px_#0088ff] opacity-90"
                  : "drop-shadow-[0_0_8px_#ff9e0b] opacity-90"
              }`}
            />

            {/* Inset Deep Glass Radial Gradient */}
            <circle
              cx="50"
              cy="50"
              r="27"
              fill={isDark ? "rgba(10, 24, 48, 0.6)" : "rgba(48, 28, 10, 0.55)"}
              className="transition-colors duration-500"
            />

            {/* High-fidelity Active Icon Inside Knob */}
            {!isDark ? (
              /* Glowing Sun with Rays inside knob */
              <g className="origin-center animate-liquid-pulse">
                {/* 8 Sun Rays */}
                <line x1="50" y1="29" x2="50" y2="35" stroke="#FFD54F" strokeWidth="2.8" strokeLinecap="round" />
                <line x1="50" y1="65" x2="50" y2="71" stroke="#FFD54F" strokeWidth="2.8" strokeLinecap="round" />
                <line x1="29" y1="50" x2="35" y2="50" stroke="#FFD54F" strokeWidth="2.8" strokeLinecap="round" />
                <line x1="65" y1="50" x2="71" y2="50" stroke="#FFD54F" strokeWidth="2.8" strokeLinecap="round" />
                <line x1="35" y1="35" x2="39.5" y2="39.5" stroke="#FFD54F" strokeWidth="2.8" strokeLinecap="round" />
                <line x1="60.5" y1="60.5" x2="65" y2="65" stroke="#FFD54F" strokeWidth="2.8" strokeLinecap="round" />
                <line x1="65" y1="35" x2="60.5" y2="39.5" stroke="#FFD54F" strokeWidth="2.8" strokeLinecap="round" />
                <line x1="39.5" y1="60.5" x2="35" y2="65" stroke="#FFD54F" strokeWidth="2.8" strokeLinecap="round" />

                {/* Sun Core with intense glow */}
                <circle
                  cx="50"
                  cy="50"
                  r="9.5"
                  fill="url(#sunCoreGrad)"
                  stroke="#FFF9C4"
                  strokeWidth="1.2"
                  filter="url(#neonGlowSun)"
                />
              </g>
            ) : (
              /* Glowing Crescent Moon & Stars inside knob */
              <g className="origin-center animate-liquid-pulse">
                {/* 4-point Star */}
                <path
                  d="M 62 40 Q 63 42.5 65.5 43.5 Q 63 44.5 62 47 Q 61 44.5 58.5 43.5 Q 61 42.5 62 40 Z"
                  fill="#FFFFFF"
                  className="drop-shadow-[0_0_4px_#38bdf8]"
                />
                <circle cx="67" cy="49" r="1.2" fill="#E0F2FE" />
                <circle cx="63" cy="56" r="1" fill="#BAE6FD" />

                {/* Crescent Moon */}
                <path
                  d="M 52 33 C 43.5 33 36 40.5 36 50 C 36 59.5 43.5 67 52 67 C 58 67 62.5 64 65.5 59.5 C 55.5 60.5 46.5 53 46.5 43.5 C 46.5 38.5 49 35 52 33 Z"
                  fill="url(#moonGrad)"
                  filter="url(#neonGlowMoon)"
                />
              </g>
            )}

            {/* Specular Glint Crescent along top rim (Glass Reflection) */}
            <path
              d="M 28 35 A 30 30 0 0 1 72 35"
              fill="none"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </button>
  );
}
