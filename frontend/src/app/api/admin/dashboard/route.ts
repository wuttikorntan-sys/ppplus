import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const totalMenuItems = await db.menuItems.count();
    const totalCategories = await db.categories.count();
    const totalUsers = await db.users.count();
    const totalBlogPosts = await db.blogPosts.count();
    return NextResponse.json({ success: true, data: { totalMenuItems, totalCategories, totalUsers, totalBlogPosts } });
  } catch (err) {
    return handleError(err);
  }
}
