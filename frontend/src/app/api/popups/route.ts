import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const active = req.nextUrl.searchParams.get('active') === 'true';
  const page = (req.nextUrl.searchParams.get('page') || '').trim();

  const where = active ? { isActive: true as const } : {};
  let popups = await db.popups.findMany({ where });

  // Filter by target page when the caller tells us where they are.
  // targetPages is a comma-separated list of page keys, or "*" for everywhere.
  // Legacy rows without the column show up as null/empty → treat as "*".
  if (page) {
    popups = popups.filter((p) => {
      const raw = (p.targetPages || '*').trim();
      if (!raw || raw === '*') return true;
      return raw.split(',').map((s) => s.trim()).filter(Boolean).includes(page);
    });
  }

  return NextResponse.json({ success: true, data: popups });
}
