import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BlogPost from '@/models/BlogPost';

// GET /api/blog — Paginated public posts
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const sp       = request.nextUrl.searchParams;
    const category = sp.get('category');
    const page     = Math.max(1, parseInt(sp.get('page') || '1'));
    const limit    = 9;
    const skip     = (page - 1) * limit;

    const filter: Record<string, unknown> = { isPublished: true };
    if (category && category !== 'all') filter.category = category;

    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title slug excerpt category author coverImage tags readTime publishedAt views')
        .lean(),
      BlogPost.countDocuments(filter),
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    });
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
