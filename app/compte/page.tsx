'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Mail, Phone, MapPin, ShieldCheck, LogOut, Edit3, Save, X,
  CheckCircle, Clock, AlertTriangle, XCircle, Package, ChevronRight,
  Lock, Calendar, Wifi, Copy, Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import Breadcrumb from '@/components/shared/Breadcrumb';

// -- Types ----------------------------------------------------------------------
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: boolean;
  avatar?: string;
  role: string;
  accountStatus: 'pending_email' | 'pending_admin' | 'approved' | 'rejected' | 'suspended';
  emailVerified: boolean;
  uniqueCode?: string;
  address?: {
    street?: string;
    city?: string;
    region?: string;
    quartier?: string;
    country?: string;
  };
  createdAt: string;
  lastLoginAt?: string;
}

interface EditData {
  name: string;
  phone: string;
  whatsapp: boolean;
  address: { city: string; region: string; quartier: string; street: string };
}

export default function ComptePage() {
  const router = useRouter();
  const { locale, T } = useLanguage();
  const [user,    setUser]    = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [editData, setEditData] = useState<EditData>({
    name: '', phone: '', whatsapp: false,
    address: { city: '', region: '', quartier: '', street: '' },
  });

  // -- Locale-aware STATUS_CONFIG -----------------------------------------------
  const STATUS_CONFIG = {
    approved:      { label: locale === 'en' ? 'Active account'      : 'Compte actif',             icon: CheckCircle,   color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800/40' },
    pending_email: { label: locale === 'en' ? 'Email to verify'     : 'Email à vérifier',         icon: Mail,          color: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800/40' },
    pending_admin: { label: locale === 'en' ? 'Awaiting validation' : 'En attente de validation', icon: Clock,         color: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800/40' },
    suspended:     { label: locale === 'en' ? 'Account suspended'   : 'Compte suspendu',          icon: AlertTriangle, color: 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800/40' },
    rejected:      { label: locale === 'en' ? 'Account deactivated' : 'Compte désactivé',         icon: XCircle,       color: 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/40' },
  };

  // -- Locale-aware ROLE_LABELS -------------------------------------------------
  const ROLE_LABELS: Record<string, string> = locale === 'en' ? {
    user: 'Client', admin: 'Admin', superadmin: 'Super Admin', moderator: 'Moderator', distributor: 'Distributor',
  } : {
    user: 'Client', admin: 'Admin', superadmin: 'Super Admin', moderator: 'Modérateur', distributor: 'Distributeur',
  };

  // -- Locale-aware date formatters ---------------------------------------------
  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  };
  const fmtShortDate = (iso?: string) => {
    if (!iso) return '—';
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    }).format(new Date(iso));
  };

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/auth/login?redirect=/compte'); return; }

    try {
      const res = await fetch('/api/auth/me', {
        headers:     { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.status === 401) { router.push('/auth/login?redirect=/compte'); return; }
      const data = await res.json();
      setUser(data.user);
      setEditData({
        name:    data.user.name,
        phone:   data.user.phone || '',
        whatsapp: data.user.whatsapp || false,
        address: {
          city:     data.user.address?.city     || '',
          region:   data.user.address?.region   || '',
          quartier: data.user.address?.quartier || '',
          street:   data.user.address?.street   || '',
        },
      });
    } catch {
      toast.error(locale === 'en' ? 'Error loading profile' : 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  }, [router, locale]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    const token = localStorage.getItem('accessToken');
    setSaving(true);
    try {
      const res  = await fetch('/api/auth/me', {
        method:      'PATCH',
        headers:     { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body:        JSON.stringify(editData),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setEditing(false);
        toast.success(locale === 'en' ? 'Profile updated!' : 'Profil mis à jour !');
      } else {
        toast.error(data.error || (locale === 'en' ? 'Error saving profile' : 'Erreur lors de la sauvegarde'));
      }
    } catch {
      toast.error(locale === 'en' ? 'Connection error' : 'Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    toast.success(locale === 'en' ? 'Signed out' : 'Déconnecté');
    router.push('/');
  };

  const copyCode = () => {
    if (user?.uniqueCode) {
      navigator.clipboard.writeText(user.uniqueCode);
      toast.success(locale === 'en' ? 'Code copied!' : 'Code copié !');
    }
  };

  // -- Loading ----------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
            {locale === 'en' ? 'Loading...' : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const statusCfg = STATUS_CONFIG[user.accountStatus] ?? STATUS_CONFIG.approved;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Breadcrumb ── */}
        <Breadcrumb items={[{ label: T.account.title || 'Mon compte' }]} />

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{T.account.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {locale === 'en' ? 'Manage your profile and information' : 'Gérez votre profil et vos informations'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" /> {T.account.logout}
          </button>
        </div>

        {/* ── Alerte statut (si non actif) ────────────────────────────────── */}
        {user.accountStatus !== 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-4 flex items-start gap-3 ${statusCfg.color}`}
          >
            <StatusIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">{statusCfg.label}</p>
              {user.accountStatus === 'pending_email' && (
                <p className="text-xs mt-0.5 opacity-80">
                  {locale === 'en'
                    ? 'Check your inbox to activate your account.'
                    : 'Vérifiez votre boîte mail pour activer votre compte.'}{' '}
                  <Link href={`/auth/verify-email?email=${user.email}&pending=true`} className="underline font-medium">
                    {locale === 'en' ? 'Resend email →' : "Renvoyer l'email →"}
                  </Link>
                </p>
              )}
              {user.accountStatus === 'pending_admin' && (
                <p className="text-xs mt-0.5 opacity-80">
                  {locale === 'en'
                    ? 'Our team is reviewing your registration. You will receive a confirmation email.'
                    : 'Notre équipe examine votre inscription. Vous recevrez un email de confirmation.'}
                </p>
              )}
              {user.accountStatus === 'suspended' && (
                <p className="text-xs mt-0.5 opacity-80">
                  {locale === 'en'
                    ? 'Your account has been temporarily suspended. Contact us:'
                    : 'Votre compte a été temporairement suspendu. Contactez-nous :'}{' '}
                  <a href="mailto:contact@agripointservice.com" className="underline">contact@agripointservice.com</a>
                </p>
              )}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Carte profil ──────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {user.emailVerified && (
                <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${statusCfg.color}`}>
                <StatusIcon className="w-3 h-3" /> {statusCfg.label}
              </span>
            </div>

            {user.uniqueCode && (
              <button
                onClick={copyCode}
                className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] text-xs font-mono text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full justify-center"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                {user.uniqueCode}
                <Copy className="w-3 h-3 opacity-50" />
              </button>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06] w-full space-y-2 text-left">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                {locale === 'en' ? 'Member since' : 'Inscrit le'} {fmtShortDate(user.createdAt)}
              </div>
              {user.lastLoginAt && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Wifi className="w-3.5 h-3.5" />
                  {locale === 'en' ? 'Last login' : 'Dernière connexion'} {fmtDate(user.lastLoginAt)}
                </div>
              )}
            </div>
          </div>

          {/* ── Informations & édition ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                  {locale === 'en' ? 'Personal information' : 'Informations personnelles'}
                </h3>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
                  >
                    <Edit3 className="w-4 h-4" /> {locale === 'en' ? 'Edit' : 'Modifier'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition">
                      <X className="w-4 h-4" /> {locale === 'en' ? 'Cancel' : 'Annuler'}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-60"
                    >
                      {saving ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      {locale === 'en' ? 'Save' : 'Enregistrer'}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <AnimatePresence mode="wait">
                  {!editing ? (
                    <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { icon: User,   label: locale === 'en' ? 'Full name' : 'Nom complet', value: user.name },
                        { icon: Mail,   label: 'Email',                                         value: user.email },
                        { icon: Phone,  label: locale === 'en' ? 'Phone'    : 'Téléphone',    value: user.phone ? `+237 ${user.phone}` : '—' },
                        { icon: Phone,  label: 'WhatsApp',                                      value: user.whatsapp ? (user.phone ? `+237 ${user.phone}` : (locale === 'en' ? 'Yes' : 'Oui')) : (locale === 'en' ? 'No' : 'Non') },
                        { icon: MapPin, label: locale === 'en' ? 'Region'   : 'Région',       value: user.address?.region   || '—' },
                        { icon: MapPin, label: locale === 'en' ? 'City'     : 'Ville',        value: user.address?.city     || '—' },
                        { icon: MapPin, label: locale === 'en' ? 'District' : 'Quartier',     value: user.address?.quartier || '—' },
                        { icon: MapPin, label: locale === 'en' ? 'Address'  : 'Adresse',      value: user.address?.street   || '—' },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label}>
                          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5" /> {label}
                          </p>
                          <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{value}</p>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { field: 'name',  label: locale === 'en' ? 'Full name' : 'Nom complet', type: 'text', placeholder: locale === 'en' ? 'Your name'  : 'Votre nom' },
                        { field: 'phone', label: locale === 'en' ? 'Phone'     : 'Téléphone',   type: 'tel',  placeholder: '6XXXXXXXX' },
                      ].map(({ field, label, type, placeholder }) => (
                        <div key={field}>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
                          <input
                            type={type}
                            value={editData[field as 'name' | 'phone']}
                            onChange={e => setEditData({ ...editData, [field]: e.target.value })}
                            placeholder={placeholder}
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                          />
                        </div>
                      ))}
                      {[
                        { field: 'region',   label: locale === 'en' ? 'Region'   : 'Région',   placeholder: locale === 'en' ? 'e.g. Centre'             : 'Ex: Centre' },
                        { field: 'city',     label: locale === 'en' ? 'City'     : 'Ville',    placeholder: locale === 'en' ? 'e.g. Yaoundé'            : 'Ex: Yaoundé' },
                        { field: 'quartier', label: locale === 'en' ? 'District' : 'Quartier', placeholder: locale === 'en' ? 'e.g. Bastos'             : 'Ex: Bastos' },
                        { field: 'street',   label: locale === 'en' ? 'Address'  : 'Adresse',  placeholder: locale === 'en' ? 'e.g. Ahmadou Ahidjo St.' : 'Ex: Rue Ahmadou Ahidjo' },
                      ].map(({ field, label, placeholder }) => (
                        <div key={field}>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
                          <input
                            type="text"
                            value={editData.address[field as keyof typeof editData.address]}
                            onChange={e => setEditData({ ...editData, address: { ...editData.address, [field]: e.target.value } })}
                            placeholder={placeholder}
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                          />
                        </div>
                      ))}
                      <div className="sm:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editData.whatsapp}
                            onChange={e => setEditData({ ...editData, whatsapp: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {locale === 'en' ? 'My number is also on WhatsApp' : 'Mon numéro est aussi sur WhatsApp'}
                          </span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Sécurité ──────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm p-6">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">{T.account.security}</h3>
              <div className="space-y-3">
                {[
                  {
                    icon: Mail,
                    label: locale === 'en' ? 'Verified email' : 'Email vérifié',
                    value: user.emailVerified
                      ? (locale === 'en' ? 'Verified'     : 'Vérifié')
                      : (locale === 'en' ? 'Not verified' : 'Non vérifié'),
                    color: user.emailVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
                    action: !user.emailVerified ? (
                      <Link href={`/auth/verify-email?email=${user.email}&pending=true`} className="text-xs text-blue-600 hover:underline font-medium">
                        {locale === 'en' ? 'Verify →' : 'Vérifier →'}
                      </Link>
                    ) : null,
                  },
                  {
                    icon: ShieldCheck,
                    label: locale === 'en' ? 'Password' : 'Mot de passe',
                    value: locale === 'en' ? 'Change' : 'Changer',
                    action: (
                      <Link href="/auth/forgot-password" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                        {locale === 'en' ? 'Update →' : 'Modifier →'}
                      </Link>
                    ),
                  },
                ].map(({ icon: Icon, label, value, color, action }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${color || 'text-gray-600 dark:text-gray-400'}`}>{value}</span>
                      {action}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Raccourcis ────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm p-6">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">
                {locale === 'en' ? 'My activities' : 'Mes activités'}
              </h3>
              <div className="space-y-2">
                {[
                  {
                    href: '/commande',
                    icon: Package,
                    label: locale === 'en' ? 'My orders'         : 'Mes commandes',
                    desc:  locale === 'en' ? 'Your purchase history'        : 'Historique de vos achats',
                  },
                  {
                    href: '/produits',
                    icon: ChevronRight,
                    label: locale === 'en' ? 'Product catalogue' : 'Catalogue produits',
                    desc:  locale === 'en' ? 'Biofertilisers & accessories' : 'Biofertilisants & accessoires',
                  },
                ].map(({ href, icon: Icon, label, desc }) => (
                  <Link key={href} href={href} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition group">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
