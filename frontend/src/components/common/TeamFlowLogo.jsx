import React from 'react';

/**
 * TeamFlowLogo
 * Pure vector SVG implementation of the 3D Glassmorphic Stack with glowing neon flow.
 * Crisp, ultra-sharp, 100% transparent, and pixel-perfect at any size.
 */
export default function TeamFlowLogo({ className = "w-10 h-10" }) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_12px_rgba(168,85,247,0.5)]"
      >
        <defs>
          {/* Top Layer Glass Gradient */}
          <linearGradient id="tfGlassTop" x1="15" y1="20" x2="85" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#A855F7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E879F9" stopOpacity="0.5" />
          </linearGradient>

          {/* Middle Layer Glass Gradient */}
          <linearGradient id="tfGlassMid" x1="15" y1="42" x2="85" y2="67" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#818CF8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0.45" />
          </linearGradient>

          {/* Bottom Layer Glass Gradient */}
          <linearGradient id="tfGlassBot" x1="15" y1="64" x2="85" y2="89" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#C084FC" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#E879F9" stopOpacity="0.4" />
          </linearGradient>

          {/* Glowing Border Gradients */}
          <linearGradient id="tfStrokeTop" x1="15" y1="18" x2="85" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>

          <linearGradient id="tfStrokeMid" x1="15" y1="40" x2="85" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>

          <linearGradient id="tfStrokeBot" x1="15" y1="62" x2="85" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#E879F9" />
          </linearGradient>

          {/* Vibrant Neon Flow Laser */}
          <linearGradient id="tfNeonFlow" x1="20" y1="85" x2="85" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="35%" stopColor="#F43F5E" />
            <stop offset="70%" stopColor="#D946EF" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          <filter id="tfGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. BOTTOM GLASS SLAB */}
        <path
          d="M50 63 L82 74 C86 75.5 86 78.5 82 80 L50 91 C46 92.5 44 92.5 40 91 L18 80 C14 78.5 14 75.5 18 74 L40 63 C44 61.5 46 61.5 50 63 Z"
          fill="url(#tfGlassBot)"
          stroke="url(#tfStrokeBot)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* 2. MIDDLE GLASS SLAB */}
        <path
          d="M50 41 L82 52 C86 53.5 86 56.5 82 58 L50 69 C46 70.5 44 70.5 40 69 L18 58 C14 56.5 14 53.5 18 52 L40 41 C44 39.5 46 39.5 50 41 Z"
          fill="url(#tfGlassMid)"
          stroke="url(#tfStrokeMid)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* 3. TOP GLASS SLAB */}
        <path
          d="M50 19 L82 30 C86 31.5 86 34.5 82 36 L50 47 C46 48.5 44 48.5 40 47 L18 36 C14 34.5 14 31.5 18 30 L40 19 C44 17.5 46 17.5 50 19 Z"
          fill="url(#tfGlassTop)"
          stroke="url(#tfStrokeTop)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* 4. NEON FLOW ENERGY CURRENT (S-Curve threading through) */}
        <path
          d="M26 86 C32 78 38 72 52 64 C66 56 68 46 54 38 C42 30 58 20 78 16"
          stroke="url(#tfNeonFlow)"
          strokeWidth="4.5"
          strokeLinecap="round"
          filter="url(#tfGlow)"
        />

        {/* 5. CRISP WHITE CORE HIGHLIGHT */}
        <path
          d="M26 86 C32 78 38 72 52 64 C66 56 68 46 54 38 C42 30 58 20 78 16"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.95"
        />
      </svg>
    </div>
  );
}
