import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleError } from '@/lib/api-server';

export async function GET() {
  try {
    const categories = await db.categories.findMany();
    const allItems = await db.menuItems.findMany({ where: { isAvailable: true } });
    const result = categories.map((cat) => ({
      ...cat,
      items: allItems.filter((i) => i.categoryId === cat.id).sort((a, b) => a.sortOrder - b.sortOrder),
    }));
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return handleError(err);
  }
}
