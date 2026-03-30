import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';
import { saveUploadedFile } from '@/lib/upload';

const menuItemSchema = z.object({
  categoryId: z.number().int(),
  nameTh: z.string().min(1),
  nameEn: z.string().min(1),
  descriptionTh: z.string(),
  descriptionEn: z.string(),
  price: z.number().positive(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  brand: z.string().nullable().default(null),
  colorCode: z.string().nullable().default(null),
  colorName: z.string().nullable().default(null),
  finishType: z.string().nullable().default(null),
  coverageArea: z.number().nullable().default(null),
  size: z.string().nullable().default(null),
  unit: z.string().nullable().default(null),
});

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const items = await db.menuItems.findMany({ includeCategory: true });
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const formData = await req.formData();

    const data = menuItemSchema.parse({
      categoryId: parseInt(formData.get('categoryId') as string),
      nameTh: formData.get('nameTh') as string,
      nameEn: formData.get('nameEn') as string,
      descriptionTh: formData.get('descriptionTh') as string,
      descriptionEn: formData.get('descriptionEn') as string,
      price: parseFloat(formData.get('price') as string),
      sortOrder: formData.get('sortOrder') ? parseInt(formData.get('sortOrder') as string) : 0,
      isAvailable: formData.get('isAvailable') !== 'false',
      brand: formData.get('brand') as string || null,
      colorCode: formData.get('colorCode') as string || null,
      colorName: formData.get('colorName') as string || null,
      finishType: formData.get('finishType') as string || null,
      coverageArea: formData.get('coverageArea') ? parseFloat(formData.get('coverageArea') as string) : null,
      size: formData.get('size') as string || null,
      unit: formData.get('unit') as string || null,
    });

    const imagePath = await saveUploadedFile(formData, 'image');

    const item = await db.menuItems.create({
      ...data,
      isAvailable: data.isAvailable ?? true,
      sortOrder: data.sortOrder ?? 0,
      image: imagePath,
      brand: data.brand ?? null,
      colorCode: data.colorCode ?? null,
      colorName: data.colorName ?? null,
      finishType: data.finishType ?? null,
      coverageArea: data.coverageArea ?? null,
      size: data.size ?? null,
      unit: data.unit ?? null,
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
