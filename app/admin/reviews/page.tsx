'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, CheckCircle2, Trash2, Filter, Search, RefreshCw, MessageSquare } from 'lucide-react';

interface Review {
  _id: string;
  productId: string;
  userName: string;
  rating: number;
  text: string;
  verified: boolean;
  createdAt: string;
}

interface ReviewsData {
  reviews: Review[];
  total: number;
  page: number;
  pages: number;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', filter });
      const res = await fetch(`/api/admin/reviews?${params}`);
      const json = await res.json();
      if (json.success) setData(json);
    } catch {
      showToast('Erreur de chargement', 'err');
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, action: 'approve' | 'delete') => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast(action === 'approve' ? 'Avis approuvé ✓' : 'Avis supprimé');
      load();
    } catch (e: unknown) {
      showToast((e as Error).message || 'Erreur', 'err');
    } finally {
      setActionLoading(null);
    }
  };

  const displayed = data?.reviews.filter(r =>
    !search || r.userName.toLowerCase().includes(search.toLowerCase()) || r.text.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white font-semibold shadow-lg transition-all ${toast.type === 'ok' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Avis clients</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{data?.total ?? 0} avis au total</p>
          </div>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === f ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : 'Approuvés'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-xs px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Filter className="w-3.5 h-3.5" />
          <span>{displayed.length} résultat{displayed.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Aucun avis</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(review => (
            <div key={review._id}
              className={`bg-white dark:bg-gray-900 border rounded-2xl p-4 transition-all ${review.verified ? 'border-emerald-200 dark:border-emerald-800/30' : 'border-amber-200 dark:border-amber-800/40'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{review.userName}</span>
                    <StarRow rating={review.rating} />
                    {review.verified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Approuvé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full">
                        En attente
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{review.text}</p>
                  <p className="text-xs text-gray-400 mt-1">Produit: {review.productId}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!review.verified && (
                    <button
                      onClick={() => handleAction(review._id, 'approve')}
                      disabled={actionLoading === review._id}
                      title="Approuver"
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-600 transition-colors disabled:opacity-50">
                      {actionLoading === review._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(review._id, 'delete')}
                    disabled={actionLoading === review._id}
                    title="Supprimer"
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-500 transition-colors disabled:opacity-50">
                    {actionLoading === review._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
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
