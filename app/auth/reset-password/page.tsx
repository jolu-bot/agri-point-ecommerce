'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Lock, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Strength {
  length: boolean;
  upper:  boolean;
  number: boolean;
  special: boolean;
}

function PasswordStrengthBar({ password }: { password: string }) {
  const checks: Strength = {
    length:  password.length >= 8,
    upper:   /[A-Z]/.test(password),
    number:  /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const colors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'];
  const labels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort 💪'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-gray-200 dark:bg-gray-700'}`}
          />
        ))}
      </div>
      {score > 0 && (
        <div className="flex gap-3 flex-wrap">
          {([['length','8+ caractères'], ['upper','Majuscule'], ['number','Chiffre'], ['special','Caractère spécial']] as const).map(([k, label]) => (
            <span key={k} className={`text-xs flex items-center gap-1 ${checks[k] ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
              <span className="text-base leading-none">{checks[k] ? '✓' : '○'}</span> {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token  = params.get('token') || '';

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Token manquant. Utilisez le lien reçu par email.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { toast.error('Lien invalide. Redemandez un email de réinitialisation.'); return; }
    if (password.length < 8) { toast.error('Le mot de passe doit faire au moins 8 caractères'); return; }
    if (password !== confirm) { toast.error('Les mots de passe ne correspondent pas'); return; }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password, confirmPassword: confirm }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success('Mot de passe réinitialisé !');
        setTimeout(() => router.push('/auth/login'), 3000);
      } else {
        toast.error(data.error || 'Erreur lors de la réinitialisation');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const passwordOk = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const confirmOk  = confirm.length > 0 && password === confirm;

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-green-900 items-center justify-center p-12 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="relative text-white text-center max-w-xs z-10">
          <Link href="/"><Image src="/images/logo.png" alt="AGRIPOINT SERVICES" width={100} height={79} className="mx-auto mb-6 drop-shadow-xl" /></Link>
          <h1 className="text-3xl font-black mb-3">Nouveau<br /><span className="text-emerald-300">mot de passe</span></h1>
          <p className="text-emerald-100/70 text-sm leading-relaxed">
            Choisissez un mot de passe fort et unique pour protéger votre compte AGRIPOINT SERVICES.
          </p>
          <div className="mt-8 bg-white/10 rounded-2xl p-4 text-left space-y-2">
            {['8 caractères minimum', 'Au moins 1 majuscule', 'Au moins 1 chiffre', 'Caractère spécial conseillé'].map(tip => (
              <p key={tip} className="text-sm text-emerald-100/70 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> {tip}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link href="/"><Image src="/images/logo.png" alt="AGRIPOINT SERVICES" width={80} height={63} className="mx-auto" /></Link>
          </div>

          {/* ── Succès ─────────────────────────────────────────────────────── */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-lg p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </motion.div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Mot de passe mis à jour !</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la connexion...
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition text-sm"
              >
                Se connecter <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            /* ── Formulaire ──────────────────────────────────────────────── */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-lg p-8"
            >
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Réinitialiser le mot de passe</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Choisissez un nouveau mot de passe sécurisé</p>
              </div>

              {!token && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 mb-6 text-center">
                  <p className="text-red-700 dark:text-red-400 text-sm font-medium">Lien invalide ou expiré</p>
                  <Link href="/auth/forgot-password" className="text-red-600 hover:underline text-sm">
                    Redemander un email →
                  </Link>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Nouveau mot de passe"
                      autoComplete="new-password"
                      disabled={!token}
                      className="w-full pl-10 pr-11 py-3 text-sm rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthBar password={password} />
                </div>

                {/* Confirmer */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type={showConf ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Confirmer le mot de passe"
                      autoComplete="new-password"
                      disabled={!token}
                      className={`w-full pl-10 pr-11 py-3 text-sm rounded-xl border transition focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 disabled:opacity-50 ${
                        confirm && !confirmOk
                          ? 'border-red-300 focus:ring-red-400'
                          : confirmOk
                          ? 'border-emerald-400 focus:ring-emerald-500'
                          : 'border-gray-200 dark:border-white/[0.08] focus:ring-emerald-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConf(!showConf)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {confirmOk && (
                      <CheckCircle className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                    )}
                  </div>
                  {confirm && !confirmOk && (
                    <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !token || !passwordOk || !confirmOk}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enregistrement...</>
                    : <><ShieldCheck className="w-4 h-4" /> Réinitialiser le mot de passe</>
                  }
                </button>
              </form>
            </motion.div>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            <Link href="/auth/login" className="text-emerald-600 hover:underline font-medium">
              ← Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
