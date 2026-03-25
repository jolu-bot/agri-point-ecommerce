'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Users, Globe, RefreshCw, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Stats { total: number; active: number; unsubscribed: number; fr: number; en: number; }

export default function NewsletterAdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [locale, setLocale] = useState<'all' | 'fr' | 'en'>('all');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getToken = () => localStorage.getItem('accessToken') || '';

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/newsletter', { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.status === 401) { router.push('/auth/login'); return; }
      const json = await res.json();
      if (json.success) setStats(json.stats);
    } catch {
      setError('Erreur de chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleSend = async () => {
    setConfirmOpen(false);
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ subject, html: body.replace(/\n/g, '<br>'), locale: locale === 'all' ? undefined : locale }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setResult(json);
      setSubject('');
      setBody('');
    } catch (e: unknown) {
      setError((e as Error).message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const targetCount = stats
    ? locale === 'fr' ? stats.fr : locale === 'en' ? stats.en : stats.active
    : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
          <Mail className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Newsletter</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Envoyer un email aux abonnés</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)
        ) : stats ? (
          [
            { label: 'Total abonnés', value: stats.total, icon: Users, color: 'text-gray-700 dark:text-gray-300' },
            { label: 'Actifs', value: stats.active, icon: CheckCircle2, color: 'text-emerald-600' },
            { label: 'FR actifs', value: stats.fr, icon: Globe, color: 'text-blue-600' },
            { label: 'EN actifs', value: stats.en, icon: Globe, color: 'text-purple-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
              </div>
              <p className={`text-2xl font-black ${color}`}>{value.toLocaleString('fr-FR')}</p>
            </div>
          ))
        ) : null}
        <button onClick={loadStats} className="h-20 flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors col-span-full sm:col-span-1">
          <RefreshCw className="w-4 h-4 mr-2" /> Actualiser
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-700 dark:text-emerald-400">Envoi terminé</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-500">{result.sent} email{result.sent !== 1 ? 's' : ''} envoyé(s) sur {result.total} · {result.failed} échec{result.failed !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-2xl text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Compose */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-black text-gray-900 dark:text-white">Composer un email</h2>

        {/* Locale selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Destinataires</label>
          <div className="flex gap-2">
            {([['all', `Tous (${stats?.active ?? 0})`], ['fr', `FR seulement (${stats?.fr ?? 0})`], ['en', `EN only (${stats?.en ?? 0})`]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setLocale(val)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${locale === val ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sujet *</label>
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ex: 🌱 Nouvelle offre exclusive AGRIPOINT..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contenu (HTML autorisé) *</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={10}
            placeholder={'<h2>Bonjour,</h2>\n<p>Votre message ici...</p>\n<p><a href="https://agri-ps.com/produits">Voir nos produits</a></p>'}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm resize-y" />
          <p className="text-xs text-gray-400 mt-1.5">Le contenu sera encadré automatiquement dans le template AGRIPOINT avec lien de désinscription.</p>
        </div>

        {/* Send button */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.05]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {targetCount} destinataire{targetCount !== 1 ? 's' : ''} ciblé{targetCount !== 1 ? 's' : ''}
          </p>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={sending || !subject.trim() || !body.trim() || targetCount === 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20">
            {sending ? <><RefreshCw className="w-4 h-4 animate-spin" /> Envoi en cours…</> : <><Send className="w-4 h-4" /> Envoyer</>}
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Confirmer l&apos;envoi</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Vous allez envoyer <strong>&ldquo;{subject}&rdquo;</strong> à <strong>{targetCount} abonné{targetCount !== 1 ? 's' : ''}</strong>. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmOpen(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Annuler
              </button>
              <button onClick={handleSend} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Envoyer maintenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
