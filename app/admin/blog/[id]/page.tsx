'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface FormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  coverImage: string;
  tags: string;
  readTime: number;
  isPublished: boolean;
}

const EMPTY: FormData = {
  title: '', excerpt: '', content: '', category: 'culture',
  author: '', coverImage: '', tags: '', readTime: 5, isPublished: false,
};

export default function AdminBlogEditPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params?.id as string;
  const isNew   = id === 'new';

  const [form,    setForm]    = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState<string | null>(null);

  const token = () => typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/admin/blog/${id}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => {
        if (d.post) setForm({
          title:       d.post.title,
          excerpt:     d.post.excerpt,
          content:     d.post.content,
          category:    d.post.category,
          author:      d.post.author,
          coverImage:  d.post.coverImage || '',
          tags:        (d.post.tags || []).join(', '),
          readTime:    d.post.readTime || 5,
          isPublished: d.post.isPublished,
        });
      })
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        ...form,
        tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      };
      const url    = isNew ? '/api/admin/blog' : `/api/admin/blog/${id}`;
      const method = isNew ? 'POST' : 'PATCH';
      const res    = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (res.ok) {
        setToast('Article sauvegardé ✓');
        setTimeout(() => router.push('/admin/blog'), 1200);
      } else {
        setToast(d.error || 'Erreur');
      }
    } catch { setToast('Erreur réseau'); }
    finally { setSaving(false); }
  };

  const inputCls = 'w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-gray-900 dark:text-white';

  if (loading) return <div className="flex items-center justify-center p-16"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;

  return (
    <div className="p-6 max-w-3xl">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg bg-emerald-600 text-white">{toast}</div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin/blog')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">{isNew ? 'Nouvel article' : 'Modifier l\'article'}</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Titre *</label>
          <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre de l'article" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Catégorie *</label>
            <select className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="culture">Cultures</option>
              <option value="sol">Sol</option>
              <option value="fertilisation">Fertilisation</option>
              <option value="actualite">Actualités</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Auteur *</label>
            <input className={inputCls} value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Nom de l'auteur" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Extrait *</label>
          <textarea className={inputCls} rows={3} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Résumé court (160 caractères)" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Contenu HTML *</label>
          <textarea className={inputCls} rows={12} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="<p>Contenu de l'article en HTML...</p>" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Image de couverture (URL)</label>
          <input className={inputCls} value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} placeholder="https://..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Tags (séparés par virgule)</label>
            <input className={inputCls} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="maïs, fertilisant, SARAH" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Temps de lecture (min)</label>
            <input className={inputCls} type="number" min={1} max={60} value={form.readTime} onChange={e => setForm(f => ({ ...f, readTime: parseInt(e.target.value) || 5 }))} />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <input
            type="checkbox"
            id="isPublished"
            checked={form.isPublished}
            onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
            className="w-4 h-4 accent-emerald-600"
          />
          <label htmlFor="isPublished" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
            Publier l'article
          </label>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Sauvegarder
        </button>
      </div>
    </div>
  );
}
