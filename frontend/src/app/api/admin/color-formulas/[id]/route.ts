import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';
import { saveUploadedFile } from '@/lib/upload';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const formulaId = parseInt(id);
    const existing = await db.colorFormulas.findById(formulaId);
    if (!existing) throw new ApiError('ไม่พบสูตรสี', 404);

    const formData = await req.formData();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    const fields = ['carBrand', 'colorCode', 'colorNameTh', 'colorNameEn', 'yearRange', 'formulaType'] as const;
    for (const key of fields) {
      const val = formData.get(key) as string | null;
      if (val !== null) updateData[key] = val || null;
    }
    if (formData.has('deltaE')) {
      const de = formData.get('deltaE') as string;
      updateData.deltaE = de ? parseFloat(de) : null;
    }
    if (formData.has('isActive')) {
      updateData.isActive = formData.get('isActive') !== 'false';
    }

    const file = formData.get('image') as File | null;
    if (file && file.size > 0) {
      updateData.image = await saveUploadedFile(formData, 'image');
    } else if (formData.get('removeImage') === '1') {
      updateData.image = null;
    }

    const formula = await db.colorFormulas.update(formulaId, updateData);
    return NextResponse.json({ success: true, data: formula });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const deleted = await db.colorFormulas.delete(parseInt(id));
    if (!deleted) throw new ApiError('ไม่พบสูตรสี', 404);
    return NextResponse.json({ success: true, message: 'ลบเรียบร้อย' });
  } catch (err) {
    return handleError(err);
  }
}
