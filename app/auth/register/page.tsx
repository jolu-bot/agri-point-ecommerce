'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail, Lock, Eye, EyeOff, User, Phone, MapPin,
  ArrowRight, ArrowLeft, CheckCircle, Leaf, Shield, Sprout, Package, Handshake,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { TurnstileCaptcha } from '@/components/auth/TurnstileCaptcha';

// --- Données Cameroun ---------------------------------------------------------
const REGIONS = [
  'Adamaoua','Centre','Est','Extrême-Nord','Littoral',
  'Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest',
];

const CITIES_BY_REGION: Record<string, string[]> = {
  'Centre':       ['Yaoundé','Mbalmayo','Bafia','Obala','Eseka','Nanga Eboko'],
  'Littoral':     ['Douala','Nkongsamba','Edéa','Loum','Mbanga','Yabassi'],
  'Ouest':        ['Bafoussam','Dschang','Foumban','Mbouda','Bangangté','Bafang'],
  'Nord-Ouest':   ['Bamenda','Kumbo','Wum','Nkambe','Mbengwi','Fundong'],
  'Sud-Ouest':    ['Buea','Limbe','Kumba','Mamfe','Mundemba','Tiko'],
  'Nord':         ['Garoua','Ngaoundéré','Guider','Figuil','Tchollire'],
  'Adamaoua':     ['Ngaoundéré','Meiganga','Banyo','Tibati','Nganha'],
  'Est':          ['Bertoua','Abong-Mbang','Batouri','Yokadouma','Doumé'],
  'Sud':          ['Ebolowa','Kribi','Sangmélima','Lolodorf','Ambam'],
  'Extrême-Nord': ['Maroua','Kousseri','Mokolo','Kaélé','Meri','Mindif'],
};

// --- Indicateur de force du mot de passe -------------------------------------
function PasswordStrengthBar({ password }: { password: string }) {
  const { locale } = useLanguage();
  const en = locale === 'en';

  const passwordChecks = [
    { label: en ? '8+ characters' : '8+ caractères', ok: password.length >= 8 },
    { label: en ? 'Uppercase' : 'Majuscule',          ok: /[A-Z]/.test(password) },
    { label: en ? 'Number' : 'Chiffre',               ok: /[0-9]/.test(password) },
    { label: en ? 'Special char' : 'Spécial',         ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = passwordChecks.filter(c => c.ok).length;
  const strengthLabels = [
    en ? 'Very weak'   : 'Très faible',
    en ? 'Weak'        : 'Faible',
    en ? 'Medium'      : 'Moyen',
    en ? 'Strong'      : 'Fort',
    en ? 'Very strong' : 'Très fort',
  ];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];

  if (!password) return null;
  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score - 1] : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${
          score <= 1 ? 'text-red-500' : score === 2 ? 'text-yellow-500' : 'text-emerald-600'
        }`}>
          {strengthLabels[score]}
        </span>
        <div className="flex gap-2">
          {passwordChecks.map((c, i) => (
            <span key={i} className={`text-[10px] flex items-center gap-0.5 ${
              c.ok ? 'text-emerald-600' : 'text-gray-400'
            }`}>
              <CheckCircle className={`w-3 h-3 ${c.ok ? 'opacity-100' : 'opacity-30'}`} />
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Indicateur d'étapes ------------------------------------------------------
function StepIndicator({ current, total }: { current: number; total: number }) {
  const { locale } = useLanguage();
  const en = locale === 'en';

  const steps = [
    { label: en ? 'Identity' : 'Identité',     icon: User   },
    { label: en ? 'Location' : 'Localisation', icon: MapPin },
    { label: en ? 'Security' : 'Sécurité',     icon: Shield },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => {
        const Icon  = s.icon;
        const done  = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                done    ? 'bg-emerald-600 border-emerald-600 text-white' :
                active  ? 'bg-white dark:bg-gray-900 border-emerald-600 text-emerald-600 shadow-md shadow-emerald-100' :
                          'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
              }`}>
                {done
                  ? <CheckCircle className="w-5 h-5" />
                  : <Icon className="w-4 h-4" />
                }
              </div>
              <span className={`text-[10px] mt-1 font-medium ${
                active ? 'text-emerald-600' : done ? 'text-emerald-500' : 'text-gray-400'
              }`}>{s.label}</span>
            </div>
            {i < total - 1 && (
              <div className={`w-14 h-0.5 mt-[-14px] transition-all duration-500 ${
                i < current ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Types --------------------------------------------------------------------
interface FormData {
  name:            string;
  email:           string;
  phone:           string;
  whatsapp:        string;
  sameAsPhone:     boolean;
  region:          string;
  city:            string;
  quartier:        string;
  password:        string;
  confirmPassword: string;
}

// --- Composant principal ------------------------------------------------------
export default function RegisterPage() {
  const router  = useRouter();
  const { locale } = useLanguage();
  const en = locale === 'en';

  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [cfToken, setCfToken] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', whatsapp: '',
    sameAsPhone: true, region: '', city: '', quartier: '',
    password: '', confirmPassword: '',
  });

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // Villes disponibles selon la région choisie
  const cities = form.region ? (CITIES_BY_REGION[form.region] || []) : [];

  // -- Validation par étape --------------------------------------------------
  const validateStep = (): boolean => {
    if (step === 0) {
      if (!form.name.trim() || form.name.trim().length < 2) {
        toast.error(en ? 'Name required (min 2 chars)' : 'Nom requis (min 2 caractères)'); return false;
      }
      if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        toast.error(en ? 'Invalid email address' : 'Adresse email invalide'); return false;
      }
    }
    if (step === 1) {
      if (!form.phone.trim()) {
        toast.error(en ? 'Phone number required' : 'Numéro de téléphone requis'); return false;
      }
      if (!form.region) {
        toast.error(en ? 'Please choose your region' : 'Veuillez choisir votre région'); return false;
      }
      if (!form.city) {
        toast.error(en ? 'Please choose your city' : 'Veuillez choisir votre ville'); return false;
      }
    }
    if (step === 2) {
      if (form.password.length < 8) {
        toast.error(en ? 'Password too short (min 8 chars)' : 'Mot de passe trop court (min 8 caractères)'); return false;
      }
      if (form.password !== form.confirmPassword) {
        toast.error(en ? 'Passwords do not match' : 'Les mots de passe ne correspondent pas'); return false;
      }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  // -- Soumission ------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:            form.name.trim(),
          email:           form.email.trim(),
          password:        form.password,
          confirmPassword: form.confirmPassword,
          phone:           form.phone.trim(),
          whatsapp:        form.sameAsPhone ? form.phone.trim() : form.whatsapp.trim(),
          region:          form.region,
          city:            form.city,
          quartier:        form.quartier.trim(),
          cfToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || (en ? 'Registration error' : "Erreur d'inscription"));
        return;
      }

      // Stocker aussi en localStorage (double support)
      localStorage.setItem('accessToken',  data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user',         JSON.stringify(data.user));

      toast.success(en ? 'Account created! Check your email to activate your account.' : 'Compte créé ! Vérifiez votre email pour activer votre compte.');
      router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}&pending=true`);
    } catch (err) {
      toast.error(en ? 'Server connection error' : 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // -- Variants d'animation --------------------------------------------------
  const slideVariants = {
    enter:  (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
  };
  const [direction, setDirection] = useState(1);
  const goNext = () => { setDirection(1);  next(); };
  const goPrev = () => { setDirection(-1); prev(); };

  return (
    <div className="min-h-screen flex">
      {/* ── Panneau gauche (brand) ──────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-green-900 items-center justify-center p-12 overflow-hidden">
        {/* Décorations */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-8 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl" />

        <div className="relative text-white text-center max-w-sm z-10">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="AGRIPOINT SERVICES"
              width={120}
              height={95}
              className="mx-auto mb-6 drop-shadow-xl"
            />
          </Link>
          <h1 className="text-4xl font-black mb-3 leading-tight">
            {en ? 'Join the' : 'Rejoignez la'}<br />
            <span className="text-emerald-300">{en ? 'green revolution' : 'révolution verte'}</span>
          </h1>
          <p className="text-emerald-100/80 leading-relaxed mb-8 text-sm">
            {en
              ? 'More than 10,000 Cameroonian farmers trust AGRIPOINT SERVICES to boost their yields.'
              : 'Plus de 10 000 agriculteurs camerounais font confiance à AGRIPOINT SERVICES pour booster leurs rendements.'}
          </p>

          {/* Avantages */}
          <div className="space-y-4 text-left">
            {([
              { Icon: Sprout,    title: en ? 'Premium Biofertilizers'    : 'Biofertilisants premium',     desc: en ? 'Quality guaranteed'    : 'Qualité garantie' },
              { Icon: Leaf,      title: en ? 'Certified organic products' : 'Produits certifiés biologiques', desc: en ? 'Eco-friendly'        : 'Écologiques' },
              { Icon: Package,   title: en ? 'Delivery everywhere'        : 'Livraison partout',           desc: en ? 'Across all 10 regions' : 'Dans toutes les 10 régions' },
              { Icon: Handshake, title: en ? 'Expert support'             : 'Accompagnement expert',       desc: en ? 'Dedicated advisors'    : 'Conseillers agricoles dédiés' },
            ] as { Icon: ComponentType<{ className?: string }>; title: string; desc: string }[]).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"
              >
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <item.Icon className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{item.title}</p>
                  <p className="text-xs text-emerald-200/80">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panneau droit (formulaire) ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/">
              <Image src="/images/logo.png" alt="AGRIPOINT SERVICES" width={90} height={71} className="mx-auto" />
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              {en ? 'Create an account' : 'Créer un compte'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {en ? `Step ${step + 1} of 3` : `Étape ${step + 1} sur 3`}
              {' · '}
              {(en
                ? ['Your identity', 'Your location', 'Your password']
                : ['Votre identité', 'Votre localisation', 'Votre mot de passe']
              )[step]}
            </p>
          </div>

          {/* Indicateur d'étapes */}
          <StepIndicator current={step} total={3} />

          {/* Carte formulaire */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-lg p-6 overflow-hidden">
            <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); goNext(); }}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >

                  {/* ── ÉTAPE 1 : Identité ─────────────────────────────────── */}
                  {step === 0 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          {en ? 'Full name' : 'Nom complet'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                            placeholder="Jean-Pierre Nkomo"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          {en ? 'Email address' : 'Adresse email'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={form.email}
                            onChange={e => set('email', e.target.value)}
                            placeholder="vous@exemple.com"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {en ? 'A verification link will be sent to this email' : 'Un lien de vérification sera envoyé à cet email'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── ÉTAPE 2 : Localisation ─────────────────────────────── */}
                  {step === 1 && (
                    <div className="space-y-4">
                      {/* Téléphone */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          {en ? 'Phone' : 'Téléphone'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex">
                          <span className="flex items-center bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-200 dark:border-white/[0.08] rounded-l-xl px-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                            🇨🇲 +237
                          </span>
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={e => {
                              set('phone', e.target.value);
                              if (form.sameAsPhone) set('whatsapp', e.target.value);
                            }}
                            placeholder="6XX XXX XXX"
                            required
                            className="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          />
                        </div>
                      </div>

                      {/* WhatsApp */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          WhatsApp
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer mb-2">
                          <input
                            type="checkbox"
                            checked={form.sameAsPhone}
                            onChange={e => set('sameAsPhone', e.target.checked)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          {en ? 'Same as phone' : 'Identique au téléphone'}
                        </label>
                        {!form.sameAsPhone && (
                          <div className="relative flex">
                            <span className="flex items-center bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-200 dark:border-white/[0.08] rounded-l-xl px-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                              🇨🇲 +237
                            </span>
                            <input
                              type="tel"
                              value={form.whatsapp}
                              onChange={e => set('whatsapp', e.target.value)}
                              placeholder="6XX XXX XXX"
                              className="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                            />
                          </div>
                        )}
                      </div>

                      {/* Région */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          {en ? 'Region' : 'Région'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          <select
                            value={form.region}
                            onChange={e => { set('region', e.target.value); set('city', ''); }}
                            required
                            title={en ? 'Choose a region' : 'Choisir une région'}
                            aria-label={en ? 'Choose a region' : 'Choisir une région'}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition appearance-none cursor-pointer"
                          >
                            <option value="">{en ? '— Choose a region —' : '— Choisir une région —'}</option>
                            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Ville */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          {en ? 'City' : 'Ville'} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.city}
                          onChange={e => set('city', e.target.value)}
                          required
                          disabled={!form.region}
                          title={en ? 'Choose a city' : 'Choisir une ville'}
                          aria-label={en ? 'Choose a city' : 'Choisir une ville'}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50 cursor-pointer"
                        >
                          <option value="">
                            {form.region
                              ? (en ? '— Choose a city —' : '— Choisir une ville —')
                              : (en ? 'Select a region first' : "Sélectionnez d'abord une région")}
                          </option>
                          {cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      {/* Quartier (optionnel) */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          {en ? 'District / Locality' : 'Quartier / Localité'}
                          <span className="text-gray-400 font-normal ml-1">{en ? '(optional)' : '(optionnel)'}</span>
                        </label>
                        <input
                          type="text"
                          value={form.quartier}
                          onChange={e => set('quartier', e.target.value)}
                          placeholder="Ex: Tsinga, Makepe, Banengo..."
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* ── ÉTAPE 3 : Sécurité ─────────────────────────────────── */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          {en ? 'Password' : 'Mot de passe'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showPwd ? 'text' : 'password'}
                            value={form.password}
                            onChange={e => set('password', e.target.value)}
                            placeholder={en ? 'Minimum 8 characters' : 'Minimum 8 caractères'}
                            required
                            className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPwd(p => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <PasswordStrengthBar password={form.password} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          {en ? 'Confirm password' : 'Confirmer le mot de passe'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showCpw ? 'text' : 'password'}
                            value={form.confirmPassword}
                            onChange={e => set('confirmPassword', e.target.value)}
                            placeholder={en ? 'Repeat password' : 'Répétez le mot de passe'}
                            required
                            className={`w-full pl-10 pr-12 py-3 rounded-xl border transition focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 dark:bg-gray-800 placeholder:text-gray-400 ${
                              form.confirmPassword && form.password !== form.confirmPassword
                                ? 'border-red-400 focus:ring-red-400 text-red-600'
                                : form.confirmPassword && form.password === form.confirmPassword
                                ? 'border-emerald-400 focus:ring-emerald-500 text-gray-900 dark:text-white'
                                : 'border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white focus:ring-emerald-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCpw(p => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {form.confirmPassword && form.password === form.confirmPassword && (
                            <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                      </div>

                      {/* Récapitulatif */}
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30 p-4 text-sm space-y-1.5">
                        <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs uppercase tracking-wide mb-2">
                          {en ? 'Summary' : 'Récapitulatif'}
                        </p>
                        {[
                          { l: en ? 'Name'   : 'Nom',    v: form.name      },
                          { l: 'Email',                   v: form.email     },
                          { l: en ? 'Tel.'   : 'Tél',    v: `+237 ${form.phone}` },
                          { l: en ? 'Region' : 'Région', v: form.region    },
                          { l: en ? 'City'   : 'Ville',  v: `${form.city}${form.quartier ? `, ${form.quartier}` : ''}` },
                        ].map(({ l, v }) => (
                          <div key={l} className="flex justify-between text-xs">
                            <span className="text-gray-500">{l} :</span>
                            <span className="font-medium text-gray-800 dark:text-gray-300 truncate ml-2 max-w-[200px]">{v}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-400 text-center leading-relaxed">
                        {en ? (
                          <>
                            By creating an account, you accept our{' '}
                            <Link href="/cgv" className="text-emerald-600 hover:underline">Terms</Link> and our{' '}
                            <Link href="/confidentialite" className="text-emerald-600 hover:underline">Privacy Policy</Link>.
                          </>
                        ) : (
                          <>
                            En créant un compte, vous acceptez nos{' '}
                            <Link href="/cgv" className="text-emerald-600 hover:underline">CGV</Link> et notre{' '}
                            <Link href="/confidentialite" className="text-emerald-600 hover:underline">politique de confidentialité</Link>.
                          </>
                        )}
                      </p>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* ── Navigation entre étapes ─────────────────────────────────── */}
              {step === 2 && (
                <TurnstileCaptcha onToken={setCfToken} onError={() => setCfToken('')} />
              )}

              <div className={`flex gap-3 mt-6 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> {en ? 'Back' : 'Retour'}
                  </button>
                )}

                {step < 2 ? (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-md shadow-emerald-200 dark:shadow-none"
                  >
                    {en ? 'Next' : 'Suivant'} <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm transition shadow-md shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {en ? 'Creating...' : 'Création en cours...'}
                      </>
                    ) : (
                      <>
                        <Sprout className="w-4 h-4" />
                        {en ? 'Create my account' : 'Créer mon compte'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            {en ? 'Already have an account?' : 'Déjà un compte ?'}{' '}
            <Link href="/auth/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              {en ? 'Sign in' : 'Se connecter'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
