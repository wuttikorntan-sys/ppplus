import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';
import { saveUploadedFile } from '@/lib/upload';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });

    const formData = await req.formData();
    const data: Record<string, unknown> = {};

    if (formData.get('category') !== null) data.category = formData.get('category');
    if (formData.get('labelTh') !== null) data.labelTh = (formData.get('labelTh') as string) || null;
    if (formData.get('labelEn') !== null) data.labelEn = (formData.get('labelEn') as string) || null;
    if (formData.get('isActive') !== null) data.isActive = formData.get('isActive') !== 'false';
    if (formData.get('sortOrder') !== null) data.sortOrder = parseInt(formData.get('sortOrder') as string);

    const imagePath = await saveUploadedFile(formData, 'image');
    if (imagePath) data.image = imagePath;

    const image = await db.galleryImages.update(id, data);
    if (!image) throw new ApiError('ไม่พบรูปภาพ', 404);
    return NextResponse.json({ success: true, data: image });
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

    await db.galleryImages.delete(id);
    return NextResponse.json({ success: true, message: 'ลบรูปภาพเรียบร้อย' });
  } catch (err) {
    return handleError(err);
  }
}
