import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';
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

    let imagePath: string | null = null;
    try {
      imagePath = await saveUploadedFile(formData, 'image');
    } catch (uploadErr) {
      console.error('Image upload error:', uploadErr);
      throw new ApiError(`Upload failed: ${(uploadErr as Error).message}`, 400);
    }

    let videoPath: string | null = null;
    try {
      videoPath = await saveUploadedFile(formData, 'video');
    } catch (uploadErr) {
      console.error('Video upload error:', uploadErr);
      throw new ApiError(`Video upload failed: ${(uploadErr as Error).message}`, 400);
    }

    const data = {
      type: (formData.get('type') as string) || 'image',
      titleTh: (formData.get('titleTh') as string) || null,
      titleEn: (formData.get('titleEn') as string) || null,
      videoUrl: videoPath || (formData.get('videoUrl') as string) || null,
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
