'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Clock, Filter, Search, RefreshCw, Sprout, Download } from 'lucide-react';

interface Registration {
  _id: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  cooperativeName?: string;
  insuranceProvider?: string;
  productType: 'mineral' | 'bio';
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  locale: 'fr' | 'en';
  createdAt: string;
}

interface Summary { pending: number; confirmed: number; cancelled: number; totalAmount: number; }

const STATUS_LABEL: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé' };
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
  confirmed: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
  cancelled: 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400',
};

export default function CampaignInscriptionsPage() {
  const router = useRouter();
  const [data, setData] = useState<{ registrations: Registration[]; total: number; pages: number; summary: Summary } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getToken = () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('accessToken') || '';
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', status: filter });
      const res = await fetch(`/api/admin/campagne-inscriptions?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) { router.push('/auth/login'); return; }
      const json = await res.json();
      if (json.success) setData(json);
    } catch {
      showToast('Erreur de chargement', 'err');
    } finally {
      setLoading(false);
    }
  }, [page, filter, router]);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/campagne-inscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast(status === 'confirmed' ? 'Inscription confirmée ✓' : 'Inscription annulée');
      load();
    } catch (e: unknown) {
      showToast((e as Error).message || 'Erreur', 'err');
    } finally {
      setActionLoading(null);
    }
  };

  const exportCSV = () => {
    if (!data?.registrations.length) return;
    const rows = [
      ['N° Inscription', 'Nom', 'Email', 'Téléphone', 'Coopérative', 'Assurance', 'Produit', 'Quantité', 'Montant (FCFA)', 'Statut', 'Date'],
      ...data.registrations.map(r => [
        r.registrationNumber,
        r.fullName,
        r.email,
        r.phone,
        r.cooperativeName || '',
        r.insuranceProvider || '',
        r.productType === 'mineral' ? 'Engrais Minéraux' : 'Biofertilisants',
        String(r.quantity),
        String(r.totalAmount),
        STATUS_LABEL[r.status],
        new Date(r.createdAt).toLocaleDateString('fr-FR'),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscriptions-campagne-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayed = data?.registrations.filter(r =>
    !search || [r.fullName, r.email, r.phone, r.registrationNumber, r.cooperativeName || '']
      .some(s => s.toLowerCase().includes(search.toLowerCase()))
  ) ?? [];

  const s = data?.summary;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white font-semibold shadow-lg ${toast.type === 'ok' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Inscriptions Campagne</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{data?.total ?? 0} inscription{(data?.total ?? 0) !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} disabled={!displayed.length} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </button>
        </div>
      </div>

      {/* Stats */}
      {s && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'En attente', value: s.pending, color: 'text-amber-600', icon: Clock },
            { label: 'Confirmées', value: s.confirmed, color: 'text-emerald-600', icon: CheckCircle2 },
            { label: 'Annulées', value: s.cancelled, color: 'text-red-500', icon: XCircle },
            { label: 'Montant total', value: `${(s.totalAmount).toLocaleString('fr-FR')} FCFA`, color: 'text-teal-600', icon: Sprout },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
              </div>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === f ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {f === 'all' ? 'Tous' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-xs px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input type="text" placeholder="Nom, email, téléphone…" value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none" />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><Filter className="w-3.5 h-3.5" />{displayed.length} résultat{displayed.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-400"><Sprout className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-semibold">Aucune inscription</p></div>
      ) : (
        <div className="space-y-3">
          {displayed.map(reg => (
            <div key={reg._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-400">{reg.registrationNumber}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLOR[reg.status]}`}>{STATUS_LABEL[reg.status]}</span>
                    <span className="text-xs text-gray-400">{new Date(reg.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-sm mt-2">
                    <div><p className="text-xs text-gray-400">Nom</p><p className="font-semibold text-gray-900 dark:text-white truncate">{reg.fullName}</p></div>
                    <div><p className="text-xs text-gray-400">Email</p><p className="text-gray-700 dark:text-gray-300 truncate">{reg.email}</p></div>
                    <div><p className="text-xs text-gray-400">Téléphone</p><p className="text-gray-700 dark:text-gray-300">{reg.phone}</p></div>
                    <div><p className="text-xs text-gray-400">Produit</p><p className="text-gray-700 dark:text-gray-300">{reg.productType === 'mineral' ? 'Engrais min.' : 'Biofertilisants'} × {reg.quantity}</p></div>
                    {reg.cooperativeName && <div><p className="text-xs text-gray-400">Coopérative</p><p className="text-gray-700 dark:text-gray-300 truncate">{reg.cooperativeName}</p></div>}
                    <div><p className="text-xs text-gray-400">Montant</p><p className="font-bold text-emerald-600">{reg.totalAmount.toLocaleString('fr-FR')} FCFA</p></div>
                  </div>
                </div>
                {reg.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleStatus(reg._id, 'confirmed')} disabled={actionLoading === reg._id}
                      title="Confirmer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-600 rounded-xl text-xs font-bold transition-colors disabled:opacity-50">
                      {actionLoading === reg._id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Confirmer
                    </button>
                    <button onClick={() => handleStatus(reg._id, 'cancelled')} disabled={actionLoading === reg._id}
                      title="Annuler"
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-500 rounded-xl text-xs font-bold transition-colors disabled:opacity-50">
                      <XCircle className="w-3.5 h-3.5" /> Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">
            ← Précédent
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">{page} / {data.pages}</span>
          <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
