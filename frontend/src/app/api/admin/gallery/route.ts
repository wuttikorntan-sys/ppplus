import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';
import { saveUploadedFile } from '@/lib/upload';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const images = await db.galleryImages.findMany();
    return NextResponse.json({ success: true, data: images });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const formData = await req.formData();

    const imagePath = await saveUploadedFile(formData, 'image');
    if (!imagePath) return NextResponse.json({ success: false, error: 'กรุณาอัพโหลดรูปภาพ' }, { status: 400 });

    const image = await db.galleryImages.create({
      image: imagePath,
      category: (formData.get('category') as string) || 'food',
      labelTh: (formData.get('labelTh') as string) || null,
      labelEn: (formData.get('labelEn') as string) || null,
      sortOrder: formData.get('sortOrder') ? parseInt(formData.get('sortOrder') as string) : 0,
      isActive: formData.get('isActive') !== 'false',
    });

    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
