import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const quotes = await db.quoteRequests.findMany();
    return NextResponse.json({ success: true, data: quotes });
  } catch (err) {
    return handleError(err);
  }
}
