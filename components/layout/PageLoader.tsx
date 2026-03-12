'use client';

import { useState, useEffect } from 'react';
import {
  AnimatePresence,
  motion,
  animate,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
} from 'framer-motion';
import Image from 'next/image';

/* ─────────────────────────────────────────────────────────────────────────────
 * Deterministic geometry — no Math.random() so SSR and client agree perfectly
 * ───────────────────────────────────────────────────────────────────────────── */
const RINGS = [
  { delay: 0    },
  { delay: 0.55 },
  { delay: 1.1  },
];

const PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const angle  = (i / 16) * 2 * Math.PI;
  const radius = 100 + (i % 4) * 28;
  return {
    id:          i,
    cx:          Math.round(Math.cos(angle) * radius),
    cy:          Math.round(Math.sin(angle) * radius),
    size:        2 + (i % 3),
    baseOpacity: 0.08 + (i % 5) * 0.04,
    delay:       i * 0.12,
    dur:         1.8 + (i % 4) * 0.45,
    float:       4 + (i % 3) * 2,
  };
});

const LETTERS = 'AGRIPOINT'.split('');

/* SVG arc — r=34, circumference ≈ 213.6 */
const R   = 34;
const CIR = 2 * Math.PI * R;

/* ═══════════════════════════════════════════════════════════════════════════
 * PageLoader — shown once on the very first render of the root layout.
 *
 * Design language (Figma premium+++) :
 *  • Deep forest-green radial gradient background
 *  • 3 expanding sonar rings + 16 floating ambient particles
 *  • Logo spring pop-in with glow halo + circular SVG progress arc
 *  • "AGRIPOINT" spring letter stagger + slide-in divider + tagline
 *  • Thin hair-line linear progress bar filling left → right
 *  • EXIT: cinema-curtain slide-UP (y: 0 → -100%) with expo-in ease
 * ══════════════════════════════════════════════════════════════════════════ */
export default function PageLoader() {
  const [isVisible,  setIsVisible]  = useState(true);
  const [displayPct, setDisplayPct] = useState(0);

  /* MotionValue drives both the SVG arc and the linear bar simultaneously */
  const progressMV = useMotionValue(0);
  const dashOffset = useTransform(progressMV, v => CIR - (v / 100) * CIR);
  const barScaleX  = useTransform(progressMV, [0, 100], [0, 1]);

  /* Sync readable integer for the percentage label */
  useMotionValueEvent(progressMV, 'change', v => setDisplayPct(Math.round(v)));

  useEffect(() => {
    const controls = animate(progressMV, 100, {
      duration: 1.9,
      ease:     [0.16, 1, 0.3, 1], // expo-out — snappy start, graceful finish
    });
    const timer = setTimeout(() => setIsVisible(false), 2400);

    return () => {
      controls.stop();
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="page-loader"
          initial={{ y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none"
          aria-hidden="true"
          role="presentation"
          style={{
            background:
              'radial-gradient(ellipse at 58% 36%, #1e7226 0%, #0f3d14 44%, #050e06 100%)',
          }}
        >
          {/* ── Dot-grid texture overlay ──────────────────────────────────── */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize:  '28px 28px',
            }}
          />

          {/* ── Edge vignette ─────────────────────────────────────────────── */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)]" />

          {/* ── Sonar / ripple rings ──────────────────────────────────────── */}
          {RINGS.map((ring, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-emerald-300/25 pointer-events-none"
              style={{ width: 90, height: 90 }}
              animate={{ scale: [1, 6.5], opacity: [0.55, 0] }}
              transition={{
                delay:    ring.delay,
                duration: 2.6,
                repeat:   Infinity,
                ease:     'easeOut',
              }}
            />
          ))}

          {/* ── Central ambient glow blob ─────────────────────────────────── */}
          <div className="absolute w-80 h-80 rounded-full bg-emerald-500/[0.07] blur-3xl pointer-events-none" />

          {/* ── Floating particles ────────────────────────────────────────── */}
          {PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-emerald-300 pointer-events-none"
              style={{ width: p.size, height: p.size, x: p.cx, opacity: p.baseOpacity }}
              animate={{ y: [p.cy - p.float, p.cy + p.float, p.cy - p.float] }}
              transition={{
                delay:    p.delay,
                duration: p.dur,
                repeat:   Infinity,
                ease:     'easeInOut',
              }}
            />
          ))}

          {/* ═══════════════════════════════════════════════════════════
           *  LOGO  +  circular SVG progress ring
           * ═════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1,   opacity: 1, y: 0  }}
            transition={{ type: 'spring', stiffness: 210, damping: 18, delay: 0.12 }}
            className="relative z-10 mb-8"
          >
            {/* SVG ring — rotated -90° so the arc starts at top */}
            <svg
              width="160" height="160" viewBox="0 0 80 80"
              className="absolute -inset-[25px] -rotate-90"
              aria-hidden
            >
              <circle
                cx="40" cy="40" r={R}
                fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5"
              />
              <motion.circle
                cx="40" cy="40" r={R}
                fill="none"
                stroke="url(#arcGrad)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray={CIR}
                style={{ strokeDashoffset: dashOffset }}
              />
              <defs>
                <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#34d399" />
                  <stop offset="100%" stopColor="#6ee7b7" />
                </linearGradient>
              </defs>
            </svg>

            {/* Glow halo behind logo */}
            <div className="absolute inset-0 -m-4 rounded-full bg-emerald-500/10 blur-2xl" />

            {/* Logo — full-colour SVG (red PP mark + green wordmark) */}
            <Image
              src="/images/logo.svg"
              alt="AgriPoint Services"
              width={108}
              height={86}
              priority
              unoptimized
              className="relative z-10 drop-shadow-[0_2px_28px_rgba(110,231,183,0.4)]"
            />
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════
           *  Brand name — spring letter-by-letter stagger
           * ═════════════════════════════════════════════════════════ */}
          <div className="z-10 flex items-end gap-[0.15em] mb-2.5">
            {LETTERS.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 18, scaleY: 0.6 }}
                animate={{ opacity: 1, y: 0,  scaleY: 1   }}
                transition={{
                  delay:     0.3 + i * 0.048,
                  type:      'spring',
                  stiffness: 320,
                  damping:   22,
                }}
                className="text-[23px] sm:text-[28px] font-black tracking-[0.2em] text-white drop-shadow-md leading-none"
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* ── Divider ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.55, ease: 'easeOut' }}
            className="z-10 w-28 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent mb-2.5"
          />

          {/* ── Tagline ──────────────────────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="z-10 text-[9px] sm:text-[10px] tracking-[0.28em] text-emerald-300/65 font-semibold uppercase mb-10"
          >
            Produire + · Gagner + · Mieux vivre
          </motion.p>

          {/* ── Hair-line progress bar + percentage counter ───────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            className="z-10 flex flex-col items-center gap-2"
          >
            <div className="w-44 h-[1.5px] bg-white/[0.08] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-400 rounded-full origin-left"
                style={{
                  scaleX:    barScaleX,
                  boxShadow: '0 0 8px rgba(110,231,183,0.5)',
                }}
              />
            </div>
            <span className="text-[9px] tabular-nums text-white/25 font-mono">
              {displayPct}%
            </span>
          </motion.div>

          {/* ── Footer micro text ─────────────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.7 }}
            className="absolute bottom-7 text-[8px] tracking-[0.22em] text-white/15 uppercase"
          >
            SARL · Cameroun · Agropastoral
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
