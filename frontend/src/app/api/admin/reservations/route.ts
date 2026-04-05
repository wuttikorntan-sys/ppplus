import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const status = req.nextUrl.searchParams.get('status') || undefined;
    const reservations = await db.reservations.findMany({ where: { status } });
    return NextResponse.json({ success: true, data: reservations });
  } catch (err) {
    return handleError(err);
  }
}
