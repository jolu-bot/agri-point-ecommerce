'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, Loader2, ArrowRight, MessageCircle, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

/* ─── Config ─────────────────────────────────────────────────── */
const LAUNCH_DATE = new Date(
  process.env.NEXT_PUBLIC_LAUNCH_DATE ?? '2026-04-30T00:00:00Z',
);

/* ─── Types ──────────────────────────────────────────────────── */
interface CounterUnit { value: number; label: string }

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      jours:    Math.floor(diff / 86_400_000),
      heures:   Math.floor((diff % 86_400_000) / 3_600_000),
      minutes:  Math.floor((diff % 3_600_000) / 60_000),
      secondes: Math.floor((diff % 60_000) / 1_000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return time;
}

const PARTNERS = [
  { name: 'MINADER',    logo: '/images/partners/minader-real.jpg'  },
  { name: 'CAMPOST',    logo: '/images/partners/campost-real.png'  },
  { name: 'EMOH',       logo: '/images/partners/emoh-bleu.png'     },
  { name: 'CIVIA',      logo: '/images/partners/civia-real.jpeg'   },
  { name: 'Bange Bank', logo: '/images/partners/bange-bank.png'    },
  { name: 'Planopac',   logo: '/images/partners/planopac.jpg'      },
  { name: 'CMA',        logo: '/images/partners/cma.jpg'           },
];

/* ─── Floating leaves (pure CSS, no canvas) ─────────────────── */
const LEAVES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left:  `${(i * 8.3) % 100}%`,
  size:  16 + (i % 5) * 6,
  delay: i * 0.7,
  dur:   8 + (i % 5) * 3,
  rotate: 30 + (i * 17) % 120,
}));

function FloatingLeaf({ leaf }: { leaf: typeof LEAVES[number] }) {
  return (
    <motion.div
      className="pointer-events-none absolute top-[-60px] text-emerald-400/20 dark:text-emerald-600/15 select-none"
      style={{ left: leaf.left, fontSize: leaf.size }}
      animate={{
        y: ['0vh', '110vh'],
        rotate: [0, leaf.rotate],
        opacity: [0, 0.7, 0.7, 0],
      }}
      transition={{
        duration: leaf.dur,
        delay: leaf.delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      🌿
    </motion.div>
  );
}

/* ─── Digit flip cell ────────────────────────────────────────── */
function DigitCell({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-xl">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={str}
            initial={{ y: -32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute text-2xl sm:text-3xl font-black tabular-nums text-white"
          >
            {str}
          </motion.span>
        </AnimatePresence>
        {/* Reflection line */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-black/20 dark:bg-black/40" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
        {label}
      </span>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function ComingSoonPage() {
  const { jours, heures, minutes, secondes } = useCountdown(LAUNCH_DATE);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const units: CounterUnit[] = [
    { value: jours,    label: 'Jours'    },
    { value: heures,   label: 'Heures'   },
    { value: minutes,  label: 'Minutes'  },
    { value: secondes, label: 'Secondes' },
  ];

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), locale: 'fr' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Erreur réseau');
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  }

  const socials = [
    { icon: MessageCircle, label: 'WhatsApp',  href: 'https://wa.me/237657393939',   color: 'hover:bg-green-500'  },
    { icon: Facebook,      label: 'Facebook',  href: 'https://facebook.com/agri-ps', color: 'hover:bg-blue-600'  },
    { icon: Instagram,     label: 'Instagram', href: 'https://instagram.com/agri_ps',color: 'hover:bg-pink-500'  },
    { icon: Linkedin,      label: 'LinkedIn',  href: 'https://linkedin.com/company/agri-ps', color: 'hover:bg-sky-600' },
    { icon: Youtube,       label: 'YouTube',   href: 'https://youtube.com/@agri-ps', color: 'hover:bg-red-600'   },
  ];

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto bg-gradient-to-br from-gray-950 via-emerald-950 to-gray-900 flex flex-col items-center justify-center px-4 py-16">
      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-green-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[100px]" />
      </div>

      {/* ── Floating leaves ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {LEAVES.map(l => <FloatingLeaf key={l.id} leaf={l} />)}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center gap-8">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <div className="relative w-40 sm:w-52 h-16 sm:h-20">
            <Image
              src="/images/logo-slogan-transparent.png"
              alt="AGRIPOINT SERVICES"
              fill
              className="object-contain brightness-0 invert drop-shadow-lg"
              priority
            />
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold text-emerald-300 tracking-wide uppercase">
            Lancement imminent
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
            Quelque chose{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              d&apos;exceptionnel
            </span>{' '}
            arrive.
          </h1>
          <p className="text-base sm:text-lg text-white/60 max-w-lg mx-auto">
            Notre plateforme agricole de nouvelle génération est en cours de finalisation.
            Revenez dans quelques jours&nbsp;!
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 sm:gap-5"
        >
          {units.map((u, i) => (
            <div key={u.label} className="flex items-center gap-3 sm:gap-5">
              <DigitCell value={u.value} label={u.label} />
              {i < units.length - 1 && (
                <span className="text-2xl sm:text-3xl font-black text-white/30 mb-6 select-none">:</span>
              )}
            </div>
          ))}
        </motion.div>

        {/* Email subscription */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                Parfait&nbsp;! Vous serez le premier informé.
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubscribe} className="space-y-3">
                <p className="text-sm text-white/50 font-medium">
                  Soyez notifié dès le lancement
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      ref={inputRef}
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 text-base focus:outline-none focus:border-emerald-500/60 focus:bg-white/15 transition-all"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={status === 'loading'}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 flex-shrink-0 shadow-lg shadow-emerald-500/30"
                  >
                    {status === 'loading'
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <ArrowRight className="w-4 h-4" />}
                    <span className="hidden sm:inline">M&apos;avertir</span>
                  </motion.button>
                </div>
                {status === 'error' && (
                  <p className="text-xs text-red-400 text-left pl-1">{errorMsg}</p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex items-center gap-3"
        >
          {socials.map(s => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.92 }}
              className={`w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/60 transition-colors ${s.color} hover:text-white hover:border-transparent`}
            >
              <s.icon className="w-4 h-4" />
            </motion.a>
          ))}
        </motion.div>

        {/* Partners */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="w-full max-w-2xl space-y-4"
        >
          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/30">
              Partenaires institutionnels
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Logo grid */}
          <div className="flex flex-wrap justify-center items-center gap-3">
            {PARTNERS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + i * 0.08, duration: 0.4 }}
                title={p.name}
                className="h-10 px-3 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
              >
                <div className="relative h-7 w-20">
                  <Image
                    src={p.logo}
                    alt={p.name}
                    fill
                    className="object-contain"
                    sizes="80px"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="text-xs text-white/25 font-medium tracking-wider uppercase"
        >
          © {new Date().getFullYear()} AGRIPOINT SERVICES SARL — Cameroun
        </motion.p>
      </div>
    </div>
  );
}
