import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const { isApproved } = body;

    const updated = await db.reviews.update(parseInt(id), { isApproved: !!isApproved });
    if (!updated) throw new ApiError('ไม่พบรีวิว', 404);

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const deleted = await db.reviews.delete(parseInt(id));
    if (!deleted) throw new ApiError('ไม่พบรีวิว', 404);
    return NextResponse.json({ success: true, message: 'ลบเรียบร้อย' });
  } catch (err) {
    return handleError(err);
  }
}
