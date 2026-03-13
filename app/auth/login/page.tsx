'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, AlertTriangle, Clock, MailCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { TurnstileCaptcha } from '@/components/auth/TurnstileCaptcha';

type AlertState = null | 'EMAIL_NOT_VERIFIED' | 'ACCOUNT_LOCKED' | 'ACCOUNT_SUSPENDED' | 'ACCOUNT_REJECTED' | 'PENDING_ADMIN';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get('redirect') || '/compte';
  const { locale, T } = useLanguage();
  const en = locale === 'en';

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [alert,        setAlert]        = useState<AlertState>(null);
  const [alertMsg,     setAlertMsg]     = useState('');
  const [resending,    setResending]    = useState(false);
  const [cfToken,      setCfToken]      = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);

    try {
      const res  = await fetch('/api/auth/login', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ email, password, cfToken }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.accessToken)  localStorage.setItem('accessToken',  data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        if (data.user)         localStorage.setItem('user',         JSON.stringify(data.user));

        toast.success(en ? `Welcome ${data.user?.name ?? ''}! 👋` : `Bienvenue ${data.user?.name ?? ''} ! 👋`);

        const role = data.user?.role;
        if (role === 'admin' || role === 'superadmin') {
          router.push('/admin');
        } else {
          router.push(redirectTo);
        }
        return;
      }

      const code = data.code as AlertState;
      if (code) {
        setAlert(code);
        setAlertMsg(data.error || '');
      } else if (res.status === 423) {
        setAlert('ACCOUNT_LOCKED');
        setAlertMsg(data.error || (en ? 'Account temporarily locked.' : 'Compte temporairement verrouillé.'));
      } else {
        toast.error(data.error || (en ? 'Incorrect credentials' : 'Identifiants incorrects'));
      }
    } catch {
      toast.error(en ? 'Connection error. Check your network.' : 'Erreur de connexion. Vérifiez votre réseau.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) { toast.error(en ? 'Enter your email' : 'Entrez votre email'); return; }
    setResending(true);
    try {
      const res  = await fetch('/api/auth/resend-verification', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(en ? 'Email sent!' : 'Email envoyé !');
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&pending=true`);
      } else {
        toast.error(data.error || (en ? 'Error sending email' : "Erreur lors de l'envoi"));
      }
    } catch {
      toast.error(en ? 'Connection error' : 'Erreur de connexion');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-green-900 items-center justify-center p-12 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="relative text-white text-center max-w-sm z-10">
          <Link href="/">
            <Image src="/images/logo.png" alt="AGRIPOINT SERVICES" width={100} height={79} className="mx-auto mb-6 drop-shadow-xl" />
          </Link>
          <h1 className="text-4xl font-black mb-4 leading-tight">
            AGRIPOINT SERVICES<br /><span className="text-emerald-300">SERVICE</span>
          </h1>
          <p className="text-emerald-100/80 leading-relaxed mb-8">
            {en
              ? 'The reference platform for Cameroonian farmers. Biofertilizers, advice, delivery.'
              : 'La plateforme de référence pour les agriculteurs camerounais. Biofertilisants, conseils, livraison.'}
          </p>
          <div className="space-y-3 text-left">
            {(en
              ? ['20,000+ hectares cultivated', '10,000 satisfied farmers', '100% organic products']
              : ['20 000+ hectares cultivés', '10 000 agriculteurs satisfaits', '100% produits biologiques']
            ).map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-emerald-100/90">
                <div className="w-5 h-5 rounded-full bg-emerald-400/30 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-3 h-3 text-emerald-300" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <Image src="/images/logo.png" alt="AGRIPOINT SERVICES" width={80} height={63} className="mx-auto" />
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{T.auth.loginTitle}</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {en ? 'Access your AGRIPOINT SERVICES member area' : 'Accédez à votre espace AGRIPOINT SERVICES'}
            </p>
          </div>

          {/* Alertes métier */}
          <AnimatePresence>
            {alert && (
              <motion.div
                key={alert}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`rounded-xl p-4 mb-5 border ${
                  alert === 'EMAIL_NOT_VERIFIED'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40'
                    : alert === 'ACCOUNT_LOCKED' || alert === 'PENDING_ADMIN'
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40'
                }`}
              >
                {alert === 'EMAIL_NOT_VERIFIED' && (
                  <>
                    <div className="flex items-start gap-3">
                      <MailCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm">
                          {en ? 'Email not verified' : 'Email non vérifié'}
                        </p>
                        <p className="text-blue-700 dark:text-blue-400 text-xs mt-0.5">
                          {alertMsg || (en ? 'Check your inbox and click the confirmation link.' : 'Vérifiez votre boîte mail et cliquez sur le lien de confirmation.')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/30 hover:bg-blue-200 dark:hover:bg-blue-700/30 rounded-lg transition disabled:opacity-60"
                    >
                      {resending ? <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> : <Mail className="w-4 h-4" />}
                      {resending
                        ? (en ? 'Sending...' : 'Envoi...')
                        : (en ? 'Resend verification email' : 'Renvoyer le mail de vérification')}
                    </button>
                  </>
                )}
                {(alert === 'ACCOUNT_LOCKED' || alert === 'PENDING_ADMIN') && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                        {alert === 'ACCOUNT_LOCKED'
                          ? (en ? 'Account locked'     : 'Compte verrouillé')
                          : (en ? 'Pending validation' : 'En attente de validation')}
                      </p>
                      <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">{alertMsg}</p>
                    </div>
                  </div>
                )}
                {(alert === 'ACCOUNT_SUSPENDED' || alert === 'ACCOUNT_REJECTED') && (
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-300 text-sm">
                        {alert === 'ACCOUNT_SUSPENDED'
                          ? (en ? 'Account suspended'   : 'Compte suspendu')
                          : (en ? 'Account deactivated' : 'Compte désactivé')}
                      </p>
                      <p className="text-red-700 dark:text-red-400 text-xs mt-0.5">
                        {alertMsg || (en ? 'Contact us for more information.' : "Contactez-nous pour plus d'informations.")}
                      </p>
                      <a href="mailto:contact@agripointservice.com" className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium mt-1 inline-block">
                        contact@agripointservice.com →
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {en ? 'Email address' : 'Adresse email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {T.auth.password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{en ? 'Remember me' : 'Se souvenir de moi'}</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                  {T.auth.forgotPassword}
                </Link>
              </div>

              <TurnstileCaptcha onToken={setCfToken} onError={() => setCfToken('')} />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-lg hover:shadow-emerald-600/20 text-sm"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><LogIn className="w-4 h-4" /> {T.auth.loginBtn}</>
                }
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
              {T.auth.noAccount}{' '}
              <Link href="/auth/register" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                {T.auth.registerTitle}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
