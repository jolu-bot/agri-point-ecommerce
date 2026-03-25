'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, Eye, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  coverImage?: string;
  readTime: number;
  publishedAt?: string;
  views: number;
}

interface Props {
  post: BlogPost;
  related: Omit<BlogPost, 'content'>[];
}

const CAT_BADGE: Record<string, string> = {
  culture:      'bg-lime-50 text-lime-700 border border-lime-200',
  sol:          'bg-amber-50 text-amber-700 border border-amber-200',
  fertilisation:'bg-blue-50 text-blue-700 border border-blue-200',
  actualite:    'bg-purple-50 text-purple-700 border border-purple-200',
};

const CAT_LABELS: Record<string, string> = {
  culture: 'Cultures', sol: 'Sol', fertilisation: 'Fertilisation', actualite: 'Actualités',
};

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

export default function BlogArticleClient({ post, related }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-emerald-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{post.title}</span>
        </nav>

        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden shadow-sm mb-10"
        >
          {/* Cover image */}
          {post.coverImage && (
            <div className="relative h-64 sm:h-80 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20">
              <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
            </div>
          )}

          <div className="p-6 sm:p-10">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${CAT_BADGE[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                {CAT_LABELS[post.category] ?? post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3.5 h-3.5" />{post.readTime} min</span>
              <span className="flex items-center gap-1 text-xs text-gray-400"><Eye className="w-3.5 h-3.5" />{post.views} vues</span>
              {post.publishedAt && (
                <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="w-3.5 h-3.5" />{formatDate(post.publishedAt)}</span>
              )}
              <span className="text-xs text-gray-400">par <strong className="text-gray-600 dark:text-gray-300">{post.author}</strong></span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base mb-8 leading-relaxed font-medium">{post.excerpt}</p>

            {/* Article content */}
            <div
              className="article-content prose prose-emerald dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </motion.article>

        {/* Related posts */}
        {related.length > 0 && (
          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-5">Articles similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(r => (
                <Link
                  key={r._id}
                  href={`/blog/${r.slug}`}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {r.coverImage ? (
                    <div className="relative h-32 bg-gray-100 dark:bg-gray-800">
                      <Image src={r.coverImage} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10 flex items-center justify-center">
                      <span className="text-3xl opacity-30">🌱</span>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
