import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';
import { saveUploadedFile } from '@/lib/upload';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const formulas = await db.colorFormulas.findMany();
    const brands = await db.colorFormulas.getBrands();
    return NextResponse.json({ success: true, data: formulas, brands });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const formData = await req.formData();

    const carBrand = formData.get('carBrand') as string;
    const colorCode = formData.get('colorCode') as string;
    if (!carBrand || !colorCode) {
      return NextResponse.json({ success: false, error: 'carBrand and colorCode are required' }, { status: 400 });
    }

    let image: string | null = null;
    const file = formData.get('image') as File | null;
    if (file && file.size > 0) {
      try {
        image = await saveUploadedFile(formData, 'image');
        console.log(`Color formula image saved: ${image}`);
      } catch (uploadErr) {
        console.error('Color formula image upload error:', uploadErr);
        throw new ApiError(`Upload failed: ${(uploadErr as Error).message}`, 400);
      }
    }

    const formula = await db.colorFormulas.create({
      carBrand,
      colorCode,
      colorNameTh: (formData.get('colorNameTh') as string) || null,
      colorNameEn: (formData.get('colorNameEn') as string) || null,
      yearRange: (formData.get('yearRange') as string) || null,
      formulaType: (formData.get('formulaType') as 'solid' | 'metallic' | 'pearl') || 'solid',
      deltaE: formData.get('deltaE') ? parseFloat(formData.get('deltaE') as string) : null,
      image,
      isActive: formData.get('isActive') !== 'false',
    });

    return NextResponse.json({ success: true, data: formula }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
