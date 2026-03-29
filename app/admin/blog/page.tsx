'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BlogPost {
  _id: string;
  title: string;
  category: string;
  author: string;
  isPublished: boolean;
  views: number;
  publishedAt?: string;
  createdAt: string;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const token = () => typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blog', { headers: { Authorization: `Bearer ${token()}` } });
      const d   = await res.json();
      if (d.posts) setPosts(d.posts);
    } catch { showToast('Erreur de chargement', 'err'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const togglePublish = async (post: BlogPost) => {
    setActionId(post._id);
    try {
      const res = await fetch(`/api/admin/blog/${post._id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });
      if (res.ok) { showToast(!post.isPublished ? 'Article publié ✓' : 'Article dépublié'); load(); }
    } catch { showToast('Erreur', 'err'); }
    finally { setActionId(null); }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    setActionId(id);
    try {
      await fetch(`/api/admin/blog/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
      showToast('Article supprimé');
      load();
    } catch { showToast('Erreur', 'err'); }
    finally { setActionId(null); }
  };

  const CAT_BADGE: Record<string, string> = {
    culture: 'bg-lime-50 text-lime-700', sol: 'bg-amber-50 text-amber-700',
    fertilisation: 'bg-blue-50 text-blue-700', actualite: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="p-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition"
        >
          <Plus className="w-4 h-4" /> Nouvel article
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-white/[0.06]">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Titre</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Catégorie</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Auteur</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Statut</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Vues</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {posts.map(post => (
                <tr key={post._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-900 dark:text-white line-clamp-1 max-w-xs">{post.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(post.createdAt).toLocaleDateString('fr-FR')}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CAT_BADGE[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {post.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">{post.author}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => togglePublish(post)}
                      disabled={actionId === post._id}
                      aria-label={post.isPublished ? 'Dépublier l\'article' : 'Publier l\'article'}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${post.isPublished ? 'bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-600' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                    >
                      {actionId === post._id ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden /> : post.isPublished ? <Eye className="w-3 h-3" aria-hidden /> : <EyeOff className="w-3 h-3" aria-hidden />}
                      {post.isPublished ? 'Publié' : 'Brouillon'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-500 text-xs">{post.views}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/blog/${post._id}`} aria-label="Modifier l'article" className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition">
                        <Pencil className="w-3.5 h-3.5" aria-hidden />
                      </Link>
                      <button
                        onClick={() => deletePost(post._id)}
                        disabled={actionId === post._id}
                        aria-label="Supprimer l'article"
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && <p className="text-center text-gray-500 py-10 text-sm">Aucun article</p>}
        </div>
      )}
    </div>
  );
}
