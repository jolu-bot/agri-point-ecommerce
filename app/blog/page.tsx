import { Metadata } from 'next';
import BlogListClient from '@/components/blog/BlogListClient';

export const metadata: Metadata = {
  title: 'Blog Agro — AGRIPOINT SERVICES',
  description: 'Conseils pratiques sur la fertilisation, la santé des sols et l'agriculture au Cameroun.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  return <BlogListClient />;
}
