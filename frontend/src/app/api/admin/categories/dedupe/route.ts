import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const result = await db.categories.removeDuplicates();
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return handleError(err);
  }
}
