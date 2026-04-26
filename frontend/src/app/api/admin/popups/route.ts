import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';
import { saveUploadedFile } from '@/lib/upload';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const popups = await db.popups.findMany();
    return NextResponse.json({ success: true, data: popups });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const formData = await req.formData();

    const imagePath = await saveUploadedFile(formData, 'image');

    const popup = await db.popups.create({
      title: (formData.get('title') as string) || '',
      titleTh: (formData.get('titleTh') as string) || '',
      description: (formData.get('description') as string) || '',
      descriptionTh: (formData.get('descriptionTh') as string) || '',
      imageUrl: imagePath,
      badge: (formData.get('badge') as string) || 'NEW',
      tags: (formData.get('tags') as string) || '',
      tagsTh: (formData.get('tagsTh') as string) || '',
      features: (formData.get('features') as string) || '',
      featuresTh: (formData.get('featuresTh') as string) || '',
      buttonText: (formData.get('buttonText') as string) || 'Explore Menu',
      buttonTextTh: (formData.get('buttonTextTh') as string) || 'สำรวจเมนู',
      buttonUrl: (formData.get('buttonUrl') as string) || null,
      targetPages: (formData.get('targetPages') as string) || '*',
      isActive: formData.get('isActive') === 'true',
    });

    return NextResponse.json({ success: true, data: popup }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
