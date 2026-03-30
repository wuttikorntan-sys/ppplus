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

    if (formData.get('type') !== null) data.type = formData.get('type');
    if (formData.get('titleTh') !== null) data.titleTh = (formData.get('titleTh') as string) || null;
    if (formData.get('titleEn') !== null) data.titleEn = (formData.get('titleEn') as string) || null;
    if (formData.get('videoUrl') !== null) data.videoUrl = (formData.get('videoUrl') as string) || null;
    if (formData.get('isActive') !== null) data.isActive = formData.get('isActive') !== 'false';
    if (formData.get('sortOrder') !== null) data.sortOrder = parseInt(formData.get('sortOrder') as string);

    const imagePath = await saveUploadedFile(formData, 'image');
    if (imagePath) data.image = imagePath;

    const slide = await db.heroSlides.update(id, data);
    if (!slide) throw new ApiError('ไม่พบสไลด์', 404);
    return NextResponse.json({ success: true, data: slide });
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

    await db.heroSlides.delete(id);
    return NextResponse.json({ success: true, message: 'ลบสไลด์เรียบร้อย' });
  } catch (err) {
    return handleError(err);
  }
}
