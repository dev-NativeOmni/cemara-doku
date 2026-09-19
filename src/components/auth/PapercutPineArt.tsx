"use client";

import React from "react";

interface PapercutPineArtProps {
  className?: string;
}

export function PapercutPineArt({ className = "" }: PapercutPineArtProps) {
  return (
    <div className={`relative w-full h-full overflow-hidden select-none pointer-events-none ${className}`}>
      {/* 1. Deep Forest Botanical Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1b3427] via-[#244233] to-[#12231a]" />

      {/* 2. SVG Layered Papercut Wave Curves & 3D Botanical Leaves */}
      <svg
        viewBox="0 0 500 650"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          {/* Paper Edge Drop Shadows for 3D Depth */}
          <filter id="paperShadow1" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="-8" dy="6" stdDeviation="10" floodColor="#0a1610" floodOpacity="0.6" />
          </filter>

          <filter id="paperShadow2" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="-6" dy="4" stdDeviation="7" floodColor="#0d1f16" floodOpacity="0.5" />
          </filter>

          <filter id="paperShadow3" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="-4" dy="3" stdDeviation="5" floodColor="#11261c" floodOpacity="0.4" />
          </filter>

          <filter id="leafShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#060e0a" floodOpacity="0.45" />
          </filter>

          {/* Leaf Gradients */}
          <linearGradient id="deepPineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2d4e3d" />
            <stop offset="50%" stopColor="#1e372b" />
            <stop offset="100%" stopColor="#13241c" />
          </linearGradient>

          <linearGradient id="midPineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3d6852" />
            <stop offset="50%" stopColor="#2c4d3c" />
            <stop offset="100%" stopColor="#1b3226" />
          </linearGradient>

          <linearGradient id="brightFernGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a7c63" />
            <stop offset="50%" stopColor="#365e4a" />
            <stop offset="100%" stopColor="#234032" />
          </linearGradient>

          <linearGradient id="monsteraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#375d49" />
            <stop offset="100%" stopColor="#1e3529" />
          </linearGradient>

          {/* Paper Wave Gradient */}
          <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#FAFCFA" />
            <stop offset="100%" stopColor="#EFF4F1" />
          </linearGradient>
        </defs>

        {/* ================================================================= */}
        {/* BOTANICAL LAYER 1: Deep Background Leaves                         */}
        {/* ================================================================= */}
        <g opacity="0.85">
          {/* Large Monstera Leaf on Top Right */}
          <path
            d="M 320 40 C 380 20 460 60 480 130 C 490 170 470 230 430 260 C 390 280 340 260 320 220 C 310 180 300 120 320 40 Z"
            fill="url(#deepPineGrad)"
            filter="url(#leafShadow)"
          />
          {/* Monstera cuts */}
          <path d="M 370 100 Q 400 120 430 110" stroke="#16291f" strokeWidth="6" strokeLinecap="round" />
          <path d="M 360 140 Q 400 160 440 150" stroke="#16291f" strokeWidth="6" strokeLinecap="round" />
          <path d="M 350 180 Q 380 210 420 200" stroke="#16291f" strokeWidth="6" strokeLinecap="round" />
        </g>

        {/* ================================================================= */}
        {/* BOTANICAL LAYER 2: Middle Palm & Cemara Pine Fronds               */}
        {/* ================================================================= */}
        <g filter="url(#leafShadow)">
          {/* Palm Frond Fan in Center */}
          <g transform="translate(180, 180) rotate(15)">
            <path d="M 0 180 Q 80 100 200 40" stroke="#254333" strokeWidth="4" fill="none" />
            {/* Palm Leaflets */}
            <path d="M 30 155 L 90 90 L 40 150" fill="url(#midPineGrad)" />
            <path d="M 50 140 L 120 70 L 60 135" fill="url(#midPineGrad)" />
            <path d="M 70 125 L 150 50 L 80 120" fill="url(#midPineGrad)" />
            <path d="M 90 110 L 180 35 L 100 105" fill="url(#brightFernGrad)" />
            <path d="M 110 95 L 200 25 L 120 90" fill="url(#brightFernGrad)" />
            <path d="M 130 80 L 220 20 L 140 75" fill="url(#brightFernGrad)" />
            <path d="M 150 65 L 230 20 L 160 60" fill="url(#brightFernGrad)" />
            {/* Bottom fan leaflets */}
            <path d="M 40 160 L 90 190 L 50 165" fill="url(#deepPineGrad)" />
            <path d="M 60 145 L 120 175 L 70 150" fill="url(#deepPineGrad)" />
            <path d="M 80 130 L 150 160 L 90 135" fill="url(#midPineGrad)" />
            <path d="M 100 115 L 180 145 L 110 120" fill="url(#midPineGrad)" />
            <path d="M 120 100 L 200 130 L 130 105" fill="url(#midPineGrad)" />
          </g>

          {/* Detailed Cemara / Fern Branch (Bottom Center) */}
          <g transform="translate(160, 360) rotate(-20)">
            <path d="M 0 250 Q 80 120 180 0" stroke="#1d3729" strokeWidth="5" fill="none" />
            {/* Fern Leaflet Pairs */}
            {[
              { x: 30, y: 210, len: 45, ang: 35 },
              { x: 50, y: 180, len: 55, ang: 38 },
              { x: 70, y: 150, len: 65, ang: 42 },
              { x: 90, y: 120, len: 75, ang: 45 },
              { x: 110, y: 90, len: 70, ang: 48 },
              { x: 130, y: 60, len: 60, ang: 50 },
              { x: 150, y: 30, len: 50, ang: 52 },
              { x: 170, y: 5, len: 35, ang: 55 },
            ].map((f, i) => (
              <g key={i}>
                {/* Right Leaflet */}
                <path
                  d={`M ${f.x} ${f.y} C ${f.x + f.len * 0.5} ${f.y - f.ang * 0.3} ${f.x + f.len * 0.8} ${f.y - f.ang * 0.7} ${f.x + f.len} ${f.y - f.ang} C ${f.x + f.len * 0.7} ${f.y - f.ang * 0.2} ${f.x + f.len * 0.3} ${f.y + 4} ${f.x} ${f.y + 4} Z`}
                  fill={i % 2 === 0 ? "url(#brightFernGrad)" : "url(#midPineGrad)"}
                />
                {/* Left Leaflet */}
                <path
                  d={`M ${f.x} ${f.y} C ${f.x - f.len * 0.5} ${f.y + f.ang * 0.3} ${f.x - f.len * 0.8} ${f.y + f.ang * 0.7} ${f.x - f.len} ${f.y + f.ang} C ${f.x - f.len * 0.7} ${f.y + f.ang * 0.2} ${f.x - f.len * 0.3} ${f.y - 4} ${f.x} ${f.y - 4} Z`}
                  fill={i % 2 === 0 ? "url(#midPineGrad)" : "url(#deepPineGrad)"}
                />
              </g>
            ))}
          </g>

          {/* Tropical Broad Leaf on Bottom Right */}
          <path
            d="M 300 520 C 340 450 420 440 480 470 C 510 490 530 530 520 570 C 500 620 430 640 370 630 C 330 610 290 570 300 520 Z"
            fill="url(#monsteraGrad)"
          />
          {/* Leaf Ribs */}
          <path d="M 330 530 Q 430 530 490 510" stroke="#16291f" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 350 560 Q 420 570 480 560" stroke="#16291f" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>

        {/* ================================================================= */}
        {/* PAPERCUT CURVES: 3-Tier Layered Wave Organic Cutout               */}
        {/* ================================================================= */}

        {/* Tier 3: Deepest Paper Wave (Dark green-tinted shadow base) */}
        <path
          d="M 0 0 L 190 0 C 230 90 200 170 150 220 C 100 270 90 350 140 410 C 190 470 180 540 120 650 L 0 650 Z"
          fill="#1b3024"
          filter="url(#paperShadow1)"
          opacity="0.9"
        />

        {/* Tier 2: Mid Paper Wave (Soft sage white transition) */}
        <path
          d="M 0 0 L 160 0 C 210 80 180 160 130 215 C 80 270 70 345 120 405 C 175 470 160 545 95 650 L 0 650 Z"
          fill="#E2ECE6"
          filter="url(#paperShadow2)"
        />

        {/* Tier 1: Front Clean Paper Wave (Forms the left white card container) */}
        <path
          d="M 0 0 L 130 0 C 180 75 155 155 110 210 C 65 265 55 340 100 400 C 150 465 140 540 70 650 L 0 650 Z"
          fill="url(#paperGrad)"
          filter="url(#paperShadow3)"
        />

        {/* Subtle Paper Inner Highlight Stroke along edge */}
        <path
          d="M 130 0 C 180 75 155 155 110 210 C 65 265 55 340 100 400 C 150 465 140 540 70 650"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}
