import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';

const updateSchema = z.object({
  companyName: z.string().min(1).optional(),
  contactPerson: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  businessType: z.string().min(1).optional(),
  province: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);
    const updated = await db.b2bApplications.update(Number(id), data);
    if (!updated) throw new ApiError('Not found', 404);
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
    const updated = await db.b2bApplications.update(Number(id), data);
    if (!updated) throw new ApiError('Not found', 404);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const ok = await db.b2bApplications.delete(Number(id));
    if (!ok) throw new ApiError('Not found', 404);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
