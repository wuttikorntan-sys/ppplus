import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  company: z.string().nullable().optional(),
  productName: z.string().nullable().optional(),
  productId: z.number().int().positive().nullable().optional(),
  quantity: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  status: z.enum(['pending', 'quoted', 'closed']).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);
    const updated = await db.quoteRequests.update(parseInt(id), data);
    if (!updated) throw new ApiError('ไม่พบใบเสนอราคา', 404);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);
    const updated = await db.quoteRequests.update(parseInt(id), data);
    if (!updated) throw new ApiError('ไม่พบใบเสนอราคา', 404);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const ok = await db.quoteRequests.delete(parseInt(id));
    if (!ok) throw new ApiError('ไม่พบใบเสนอราคา', 404);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
