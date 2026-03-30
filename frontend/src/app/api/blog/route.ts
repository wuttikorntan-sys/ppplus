import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleError } from '@/lib/api-server';

export async function GET() {
  try {
    const posts = await db.blogPosts.findMany({ where: { isPublished: true } });
    return NextResponse.json({ success: true, data: posts });
  } catch (err) {
    return handleError(err);
  }
}
