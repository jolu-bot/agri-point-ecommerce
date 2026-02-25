'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Leaf, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '6+ caractères', ok: password.length >= 6 },
    { label: 'Majuscule', ok: /[A-Z]/.test(password) },
    { label: 'Chiffre', ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'];

  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score] : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map((c, i) => (
          <span key={i} className={`text-[10px] flex items-center gap-1 ${c.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
            <CheckCircle className={`w-3 h-3 ${c.ok ? 'opacity-100' : 'opacity-40'}`} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur d\'inscription');
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Compte créé avec succès !');
      router.push('/');
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Erreur d\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex">
      {/* â”€â”€ Left panel (brand) â”€â”€ */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-green-900 items-center justify-center p-12 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />

        <div className="relative text-white text-center max-w-sm">
          <div className="w-20 h-20 bg-white/15 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <Leaf className="w-10 h-10 text-emerald-200" />
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight">
            Rejoignez<br />
            <span className="text-emerald-300">la communauté</span>
          </h1>
          <p className="text-emerald-100/80 leading-relaxed mb-8">
            Plus de 10 000 agriculteurs font déjà confiance à AGRI POINT pour leurs cultures.
          </p>
          <div className="space-y-3 text-left">
            {['Accès à tous nos produits', 'Suivi de vos commandes', 'Conseils AgriBot personnalisés', 'Offres exclusives membres'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-emerald-100/90">
                <div className="w-5 h-5 rounded-full bg-emerald-400/30 flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-3 h-3 text-emerald-300" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* â”€â”€ Right panel (form) â”€â”€ */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <Image src="/images/logo.png" alt="AGRI POINT SERVICE SAS" width={1280} height={1012} className="mx-auto mb-3 h-24 w-auto" />
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Créer un compte</h2>
            <p className="text-gray-500 dark:text-gray-400">Rejoignez la communauté AGRI POINT</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text" id="name" name="name"
                    value={formData.name} onChange={handleChange}
                    required placeholder="Jean Dupont"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email" id="email" name="email"
                    value={formData.email} onChange={handleChange}
                    required placeholder="votre@email.com"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'} id="password" name="password"
                    value={formData.password} onChange={handleChange}
                    required minLength={6} placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <PasswordStrength password={formData.password} />
              </div>

              {/* Confirmer */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'} id="confirmPassword" name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleChange}
                    required minLength={6} placeholder="••••••••"
                    className={`w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm
                      ${formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-400 dark:border-red-600'
                        : 'border-gray-200 dark:border-gray-700'}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              {/* CGU */}
              <div className="flex items-start gap-2">
                <input id="terms" type="checkbox" required
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 flex-shrink-0" />
                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                  J&apos;accepte les{' '}
                  <Link href="/conditions" className="text-emerald-600 hover:underline font-medium">CGU</Link>
                  {' '}et la{' '}
                  <Link href="/confidentialite" className="text-emerald-600 hover:underline font-medium">politique de confidentialité</Link>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-emerald-600/30 text-sm mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Créer mon compte</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                Se connecter
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
