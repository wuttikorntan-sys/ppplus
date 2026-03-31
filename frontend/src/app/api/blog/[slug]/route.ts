import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleError, ApiError } from '@/lib/api-server';

function formatPost(post: Record<string, unknown>) {
  const tags = typeof post.tags === 'string' && post.tags
    ? post.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : [];
  return { ...post, tags };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await db.blogPosts.findBySlug(slug);
    if (!post || !post.isPublished) throw new ApiError('ไม่พบบทความ', 404);
    return NextResponse.json({ success: true, data: formatPost(post) });
  } catch (err) {
    return handleError(err);
  }
}
