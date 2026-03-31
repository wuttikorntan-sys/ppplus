import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!['pending', 'quoted', 'closed'].includes(status)) {
      throw new ApiError('สถานะไม่ถูกต้อง', 400);
    }

    const updated = await db.quoteRequests.update(parseInt(id), { status });
    if (!updated) throw new ApiError('ไม่พบใบเสนอราคา', 404);

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return handleError(err);
  }
}
