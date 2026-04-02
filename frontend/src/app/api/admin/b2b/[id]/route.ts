import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    await db.b2bApplications.update(Number(id), body);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
