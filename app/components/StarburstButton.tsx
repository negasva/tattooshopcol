'use client';

import Link from 'next/link';

// 12-point starburst SVG path (cx=65, cy=65, R=60, r=45)
const STAR_PATH =
  'M65,5 L76.65,21.53 L95,13.04 L96.82,33.18 L116.96,35 L108.47,53.35 L125,65 L108.47,76.65 L116.96,95 L96.82,96.82 L95,116.96 L76.65,108.47 L65,125 L53.35,108.47 L35,116.96 L33.18,96.82 L13.04,95 L21.53,76.65 L5,65 L21.53,53.35 L13.04,35 L33.18,33.18 L35,13.04 L53.35,21.53 Z';

export default function StarburstButton() {
  return (
    <>
      <style>{`
        @keyframes starburstSpin {
          0%   { transform: rotate(-6deg) scale(1); }
          50%  { transform: rotate(6deg) scale(1.06); }
          100% { transform: rotate(-6deg) scale(1); }
        }
        @keyframes starburstPulse {
          0%, 100% { filter: drop-shadow(0 0 8px #FFD40088); }
          50%       { filter: drop-shadow(0 0 18px #FFD400cc); }
        }
        .starburst-btn {
          animation: starburstSpin 3.5s ease-in-out infinite, starburstPulse 3.5s ease-in-out infinite;
        }
        .starburst-btn:hover {
          animation: none;
          transform: scale(1.1) rotate(0deg);
          filter: drop-shadow(0 0 24px #FFD400);
        }
      `}</style>

      <Link
        href="/calculadora"
        className="starburst-btn"
        style={{
          position: 'fixed',
          bottom: '108px',
          right: '10px',
          zIndex: 800,
          textDecoration: 'none',
          display: 'block',
          transition: 'transform 0.2s, filter 0.2s',
        }}
        title="Encuentra tu kit perfecto"
      >
        <svg width="120" height="120" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow layer */}
          <path d={STAR_PATH} fill="#c9a800" transform="translate(4,4)" opacity="0.4" />
          {/* Main shape */}
          <path d={STAR_PATH} fill="#FFD400" />
          {/* Inner ring accent */}
          <path d={STAR_PATH} fill="none" stroke="#111" strokeWidth="1.5" opacity="0.12" />

          {/* Text */}
          <text
            x="65" y="48"
            textAnchor="middle"
            fontFamily="'Bebas Neue', Arial, sans-serif"
            fontSize="12.5"
            fill="#111"
            letterSpacing="1"
          >
            ENCUENTRA
          </text>
          <text
            x="65" y="63"
            textAnchor="middle"
            fontFamily="'Bebas Neue', Arial, sans-serif"
            fontSize="15"
            fill="#111"
            letterSpacing="1"
          >
            TU KIT
          </text>
          <text
            x="65" y="78"
            textAnchor="middle"
            fontFamily="'Bebas Neue', Arial, sans-serif"
            fontSize="15"
            fill="#111"
            letterSpacing="1"
          >
            PERFECTO
          </text>
          <text
            x="65" y="93"
            textAnchor="middle"
            fontFamily="'Bebas Neue', Arial, sans-serif"
            fontSize="11"
            fill="#111"
            letterSpacing="0.5"
            opacity="0.7"
          >
            CALCULAR AHORA
          </text>
        </svg>
      </Link>
    </>
  );
}
