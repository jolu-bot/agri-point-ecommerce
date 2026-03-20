import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import BlogArticleClient from '@/components/blog/BlogArticleClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const post = await BlogPost.findOne({ slug, isPublished: true }).lean() as any;
  if (!post) return { title: 'Article introuvable — AGRIPOINT' };

  return {
    title: `${post.title} — AGRIPOINT Blog`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  await dbConnect();

  const post = await BlogPost.findOne({ slug, isPublished: true }).lean() as any;
  if (!post) notFound();

  const related = await BlogPost.find({
    isPublished: true,
    category: post.category,
    _id: { $ne: post._id },
  })
    .select('title slug excerpt coverImage category readTime')
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean();

  // JSON-LD Article
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.publishedAt,
    image: post.coverImage,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogArticleClient post={JSON.parse(JSON.stringify(post))} related={JSON.parse(JSON.stringify(related))} />
    </>
  );
}
