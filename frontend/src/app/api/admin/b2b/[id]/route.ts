import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const appId = parseInt(id);
    const body = await req.json();
    const { status } = body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new ApiError('สถานะไม่ถูกต้อง', 400);
    }

    const updated = await db.b2bApplications.update(appId, { status });
    if (!updated) throw new ApiError('ไม่พบใบสมัคร', 404);

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return handleError(err);
  }
}
