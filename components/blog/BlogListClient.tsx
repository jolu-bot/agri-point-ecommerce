'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Eye, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  coverImage?: string;
  readTime: number;
  publishedAt?: string;
  views: number;
}

const CATEGORIES = [
  { key: 'all',          label: 'Tous',          color: 'emerald' },
  { key: 'culture',      label: 'Cultures',      color: 'lime' },
  { key: 'sol',          label: 'Sol',           color: 'amber' },
  { key: 'fertilisation', label: 'Fertilisation', color: 'blue' },
  { key: 'actualite',    label: 'Actualités',    color: 'purple' },
];

const CAT_BADGE: Record<string, string> = {
  culture:      'bg-lime-50 dark:bg-lime-950/30 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-800/40',
  sol:          'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
  fertilisation:'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
  actualite:    'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
};

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

export default function BlogListClient() {
  const [posts, setPosts]   = useState<BlogPost[]>([]);
  const [category, setCat]  = useState('all');
  const [page, setPage]     = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = async (cat: string, pg: number, append: boolean) => {
    if (!append) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams({ page: String(pg), ...(cat !== 'all' ? { category: cat } : {}) });
      const res  = await fetch(`/api/blog?${params}`);
      const data = await res.json();
      setPosts(prev => append ? [...prev, ...data.posts] : data.posts);
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    load(category, 1, false);
  }, [category]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(category, next, true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2">Blog Agro</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl">
            Conseils pratiques sur la fertilisation, la santé des sols et l'agriculture durable au Cameroun.
          </p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${category === c.key ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/[0.08] hover:border-emerald-400'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500 py-16">Aucun article disponible</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Cover image */}
                <Link href={`/blog/${post.slug}`} className="block relative h-44 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 overflow-hidden">
                  {post.coverImage ? (
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl opacity-40">🌱</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${CAT_BADGE[post.category] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {CATEGORIES.find(c => c.key === post.category)?.label ?? post.category}
                    </span>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-5">
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="font-black text-gray-900 dark:text-white text-base mb-2 line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">{post.excerpt}</p>

                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime} min</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views}</span>
                    {post.publishedAt && (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(post.publishedAt)}</span>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="text-center mt-10">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition disabled:opacity-60"
            >
              {loadingMore ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Charger plus'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
