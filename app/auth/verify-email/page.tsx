'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, XCircle, Mail, RefreshCw, ArrowRight, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

type Status = 'pending' | 'verifying' | 'success' | 'error' | 'resent';

function VerifyEmailContent() {
  const router       = useRouter();
  const params       = useSearchParams();
  const token        = params.get('token');
  const email        = params.get('email') || '';
  const isPending    = params.get('pending') === 'true';

  const [status,  setStatus]  = useState<Status>(isPending && !token ? 'pending' : 'verifying');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(email);
  const [resending,   setResending]   = useState(false);

  // ── Vérification automatique du token ──────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      setStatus('verifying');
      try {
        const res  = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          localStorage.setItem('accessToken',  data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('user',         JSON.stringify(data.user));
          setStatus('success');
          setMessage(data.message || 'Email vérifié avec succès !');
          setTimeout(() => router.push('/compte'), 3500);
        } else {
          setStatus('error');
          setMessage(data.error || 'Lien invalide ou expiré.');
        }
      } catch {
        setStatus('error');
        setMessage('Erreur de connexion. Veuillez réessayer.');
      }
    };

    verify();
  }, [token, router]);

  // ── Renvoyer l'email ────────────────────────────────────────────────────────
  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) { toast.error('Entrez votre adresse email'); return; }
    setResending(true);
    try {
      const res  = await fetch('/api/auth/resend-verification', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('resent');
        toast.success('Email envoyé ! Vérifiez votre boîte mail.');
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-green-900 items-center justify-center p-12 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="relative text-white text-center max-w-xs z-10">
          <Link href="/"><Image src="/images/logo.png" alt="AGRI POINT" width={100} height={79} className="mx-auto mb-6 drop-shadow-xl" /></Link>
          <h1 className="text-3xl font-black mb-3">Vérification<br /><span className="text-emerald-300">de votre email</span></h1>
          <p className="text-emerald-100/70 text-sm leading-relaxed">
            Cette étape garantit la sécurité de votre compte et assure la livraison de vos confirmations de commande.
          </p>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link href="/"><Image src="/images/logo.png" alt="AGRI POINT" width={80} height={63} className="mx-auto" /></Link>
          </div>

          {/* ── En attente de vérification ─────────────────────────────────── */}
          {(status === 'pending' || status === 'resent') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-lg p-8 text-center"
            >
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Vérifiez votre email</h2>
              {email && (
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Un lien de vérification a été envoyé à<br />
                  <strong className="text-emerald-600 dark:text-emerald-400">{email}</strong>
                </p>
              )}
              {!email && (
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Consultez votre boîte mail et cliquez sur le lien de vérification.
                </p>
              )}

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 mb-6 text-left">
                <p className="text-amber-800 dark:text-amber-300 text-sm font-medium mb-1">💡 Conseils</p>
                <ul className="text-amber-700 dark:text-amber-400 text-xs space-y-1">
                  <li>• Pensez à vérifier vos <strong>spams / courrier indésirable</strong></li>
                  <li>• Le lien expire dans <strong>24 heures</strong></li>
                  <li>• Vérifiez que l'email est correct ci-dessous</li>
                </ul>
              </div>

              <div className="border-t border-gray-100 dark:border-white/[0.06] pt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Vous n'avez pas reçu l'email ?</p>
                <form onSubmit={handleResend} className="space-y-3">
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={e => setResendEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={resending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition disabled:opacity-60"
                  >
                    {resending
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi...</>
                      : <><RefreshCw className="w-4 h-4" /> Renvoyer l'email</>
                    }
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── Vérification en cours ──────────────────────────────────────── */}
          {status === 'verifying' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-lg p-12 text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vérification en cours...</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Veuillez patienter</p>
            </motion.div>
          )}

          {/* ── Succès ─────────────────────────────────────────────────────── */}
          {status === 'success' && (
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
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                🎉 Email vérifié !
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                {message || 'Votre compte est maintenant actif. Bienvenue sur AGRI POINT SERVICE !'}
              </p>
              <p className="text-xs text-gray-400 mb-4">Redirection automatique vers votre compte...</p>
              <Link
                href="/compte"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition text-sm"
              >
                Accéder à mon compte <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          {/* ── Erreur ─────────────────────────────────────────────────────── */}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-lg p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Lien invalide</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{message}</p>

              <form onSubmit={handleResend} className="space-y-3 border-t border-gray-100 dark:border-white/[0.06] pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Recevoir un nouveau lien :</p>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={e => setResendEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition disabled:opacity-60"
                >
                  {resending
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi...</>
                    : <><RefreshCw className="w-4 h-4" /> Renvoyer le lien</>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
