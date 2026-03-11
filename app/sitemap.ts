import type { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agri-ps.com';

const STATIC_ROUTES: { url: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { url: '/',                         priority: 1.0, changeFrequency: 'weekly' },
  { url: '/produits',                 priority: 0.9, changeFrequency: 'daily' },
  { url: '/produire-plus',            priority: 0.8, changeFrequency: 'monthly' },
  { url: '/gagner-plus',              priority: 0.8, changeFrequency: 'monthly' },
  { url: '/mieux-vivre',              priority: 0.8, changeFrequency: 'monthly' },
  { url: '/agriculture-urbaine',      priority: 0.8, changeFrequency: 'monthly' },
  { url: '/agriculture-periurbaine',  priority: 0.8, changeFrequency: 'monthly' },
  { url: '/fourniture-intrants',      priority: 0.7, changeFrequency: 'monthly' },
  { url: '/campagne-engrais',         priority: 0.7, changeFrequency: 'monthly' },
  { url: '/evenements',               priority: 0.7, changeFrequency: 'weekly' },
  { url: '/carte',                    priority: 0.6, changeFrequency: 'monthly' },
  { url: '/contact',                  priority: 0.6, changeFrequency: 'yearly' },
  { url: '/a-propos',                 priority: 0.5, changeFrequency: 'yearly' },
  { url: '/points-campost',           priority: 0.5, changeFrequency: 'yearly' },
  { url: '/cgu',                      priority: 0.2, changeFrequency: 'yearly' },
  { url: '/cgv',                      priority: 0.2, changeFrequency: 'yearly' },
  { url: '/confidentialite',          priority: 0.2, changeFrequency: 'yearly' },
  { url: '/mentions-legales',         priority: 0.2, changeFrequency: 'yearly' },
  { url: '/cookies',                  priority: 0.2, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Routes statiques
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // Routes dynamiques produits
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    await dbConnect();
    const products = await Product.find({ isActive: true })
      .select('slug updatedAt')
      .lean<{ slug: string; updatedAt: Date }[]>();

    productEntries = products.map((p) => ({
      url: `${BASE_URL}/produits/${p.slug}`,
      lastModified: p.updatedAt ?? now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable at build time — skip dynamic routes gracefully
  }

  return [...staticEntries, ...productEntries];
}
