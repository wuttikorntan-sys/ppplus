import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const active = req.nextUrl.searchParams.get('active') === 'true';
  const where = active ? { isActive: true as const } : {};
  const popups = await db.popups.findMany({ where });
  return NextResponse.json({ success: true, data: popups });
}
