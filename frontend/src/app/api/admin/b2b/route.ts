import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const applications = await db.b2bApplications.findMany();
    return NextResponse.json({ success: true, data: applications });
  } catch (err) {
    return handleError(err);
  }
}
