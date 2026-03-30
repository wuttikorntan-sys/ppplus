import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleError } from '@/lib/api-server';

export async function GET() {
  try {
    const slides = await db.heroSlides.findMany({ where: { isActive: true } });
    return NextResponse.json({ success: true, data: slides });
  } catch (err) {
    return handleError(err);
  }
}
