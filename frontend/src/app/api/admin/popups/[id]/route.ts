import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';
import { saveUploadedFile } from '@/lib/upload';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const formData = await req.formData();

    const data: Record<string, unknown> = {
      title: formData.get('title') as string,
      titleTh: formData.get('titleTh') as string,
      description: (formData.get('description') as string) || '',
      descriptionTh: (formData.get('descriptionTh') as string) || '',
      badge: (formData.get('badge') as string) || 'NEW',
      tags: (formData.get('tags') as string) || '',
      tagsTh: (formData.get('tagsTh') as string) || '',
      features: (formData.get('features') as string) || '',
      featuresTh: (formData.get('featuresTh') as string) || '',
      buttonText: (formData.get('buttonText') as string) || 'Explore Menu',
      buttonTextTh: (formData.get('buttonTextTh') as string) || 'สำรวจเมนู',
      isActive: formData.get('isActive') === 'true',
    };

    const imagePath = await saveUploadedFile(formData, 'image');
    if (imagePath) data.imageUrl = imagePath;

    const popup = await db.popups.update(id, data);
    if (!popup) throw new ApiError('Not found', 404);
    return NextResponse.json({ success: true, data: popup });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id: idStr } = await params;
    await db.popups.delete(parseInt(idStr));
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
