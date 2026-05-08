import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const data = z.object({
      nameTh: z.string().min(1),
      nameEn: z.string().min(1),
      sortOrder: z.number().int(),
      newId: z.number().int().positive(),
    }).partial().parse(body);

    let workingId = id;
    if (typeof data.newId === 'number' && data.newId !== id) {
      try {
        const moved = await db.categories.updateId(id, data.newId);
        if (!moved) throw new ApiError('ไม่พบหมวดหมู่', 404);
        workingId = data.newId;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'ไม่สามารถเปลี่ยน ID ได้';
        throw new ApiError(msg, 409);
      }
    }

    const updates: { nameTh?: string; nameEn?: string; sortOrder?: number } = {};
    if (data.nameTh !== undefined) updates.nameTh = data.nameTh.trim();
    if (data.nameEn !== undefined) updates.nameEn = data.nameEn.trim();
    if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;

    const category = await db.categories.update(workingId, updates);
    if (!category) throw new ApiError('ไม่พบหมวดหมู่', 404);
    return NextResponse.json({ success: true, data: category });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });

    await db.categories.delete(id);
    return NextResponse.json({ success: true, message: 'ลบหมวดหมู่เรียบร้อย' });
  } catch (err) {
    return handleError(err);
  }
}
