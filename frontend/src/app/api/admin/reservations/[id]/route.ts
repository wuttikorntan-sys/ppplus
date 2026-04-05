import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const body = await req.json();

    if (!body.status) {
      throw new ApiError('status is required', 400);
    }

    const valid = ['PENDING', 'CONFIRMED', 'CANCELLED'];
    if (!valid.includes(body.status)) {
      throw new ApiError('Invalid status', 400);
    }

    const updated = await db.reservations.updateStatus(Number(id), body.status);
    if (!updated) throw new ApiError('Reservation not found', 404);

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return handleError(err);
  }
}
