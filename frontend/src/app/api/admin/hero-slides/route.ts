import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';
import { saveUploadedFile } from '@/lib/upload';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const slides = await db.heroSlides.findMany();
    return NextResponse.json({ success: true, data: slides });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const formData = await req.formData();

    const imagePath = await saveUploadedFile(formData, 'image');

    const data = {
      type: (formData.get('type') as string) || 'image',
      titleTh: (formData.get('titleTh') as string) || null,
      titleEn: (formData.get('titleEn') as string) || null,
      videoUrl: (formData.get('videoUrl') as string) || null,
      isActive: formData.get('isActive') !== 'false',
      sortOrder: formData.get('sortOrder') ? parseInt(formData.get('sortOrder') as string) : 0,
      image: imagePath,
    };

    const slide = await db.heroSlides.create(data);
    return NextResponse.json({ success: true, data: slide }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
