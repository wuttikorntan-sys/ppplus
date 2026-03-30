import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleError } from '@/lib/api-server';

export async function GET() {
  try {
    const images = await db.galleryImages.findMany({ where: { isActive: true } });
    return NextResponse.json({ success: true, data: images });
  } catch (err) {
    return handleError(err);
  }
}
