import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleError } from '@/lib/api-server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatPost(post: any) {
  const tags = typeof post.tags === 'string' && post.tags
    ? post.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : [];
  return { ...post, tags };
}

export async function GET() {
  try {
    const posts = await db.blogPosts.findMany({ where: { isPublished: true } });
    return NextResponse.json({ success: true, data: posts.map(formatPost) });
  } catch (err) {
    return handleError(err);
  }
}
