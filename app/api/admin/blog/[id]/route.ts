import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import BlogPost from '@/models/BlogPost';

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

// GET /api/admin/blog/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { id } = await context.params;
    const post = await BlogPost.findById(id).lean();
    if (!post) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/admin/blog/[id]
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { id } = await context.params;
    const body = await request.json();

    const update: Record<string, unknown> = {};
    const allowed = ['title', 'excerpt', 'content', 'category', 'author', 'coverImage', 'tags', 'readTime', 'isPublished', 'publishedAt', 'slug'];
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }

    // Auto-set publishedAt when publishing for the first time
    if (body.isPublished === true) {
      const existing = await BlogPost.findById(id).select('publishedAt isPublished');
      if (existing && !existing.publishedAt && !existing.isPublished) {
        update.publishedAt = new Date();
      }
    }

    const post = await BlogPost.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!post) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });
    return NextResponse.json({ success: true, post });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/admin/blog/[id]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { id } = await context.params;
    await BlogPost.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
