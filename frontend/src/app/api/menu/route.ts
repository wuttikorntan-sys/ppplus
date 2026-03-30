import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleError } from '@/lib/api-server';

export async function GET() {
  try {
    const items = await db.menuItems.findMany({ where: { isAvailable: true }, includeCategory: true });
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    return handleError(err);
  }
}
