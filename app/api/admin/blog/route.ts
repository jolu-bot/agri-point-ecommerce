import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import BlogPost from '@/models/BlogPost';

function slugify(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function getAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.substring(7);
  if (!token) return null;
  const decoded = verifyAccessToken(token);
  if (!decoded) return null;
  await dbConnect();
  const user = await User.findById(decoded.userId).select('role');
  if (!user || !['admin', 'manager', 'redacteur'].includes(user.role)) return null;
  return user;
}

// GET /api/admin/blog — All posts (any status)
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const sp   = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(sp.get('page') || '1'));

    const [posts, total] = await Promise.all([
      BlogPost.find().sort({ createdAt: -1 }).skip((page - 1) * 20).limit(20).lean(),
      BlogPost.countDocuments(),
    ]);

    return NextResponse.json({ posts, total, page, pages: Math.ceil(total / 20) });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/admin/blog — Create post
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();
    const { title, excerpt, content, category, author, coverImage, tags, readTime, isPublished } = body;

    if (!title || !excerpt || !content || !category || !author) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const slug = slugify(title);
    const existing = await BlogPost.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

    const post = await BlogPost.create({
      title: escapeHtml(title),
      slug: finalSlug,
      excerpt: escapeHtml(excerpt),
      content,          // HTML — trust admin input
      category,
      author: escapeHtml(author),
      coverImage,
      tags: (tags || []).map((t: string) => escapeHtml(t)),
      readTime: readTime || 5,
      isPublished: !!isPublished,
      publishedAt: isPublished ? new Date() : undefined,
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
