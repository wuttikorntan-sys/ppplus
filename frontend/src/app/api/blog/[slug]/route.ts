import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleError, ApiError } from '@/lib/api-server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await db.blogPosts.findBySlug(slug);
    if (!post || !post.isPublished) throw new ApiError('ไม่พบบทความ', 404);
    return NextResponse.json({ success: true, data: post });
  } catch (err) {
    return handleError(err);
  }
}
