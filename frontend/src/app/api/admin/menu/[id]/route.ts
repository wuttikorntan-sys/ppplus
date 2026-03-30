import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';
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
  brand: z.string().nullable().optional(),
  colorCode: z.string().nullable().optional(),
  colorName: z.string().nullable().optional(),
  finishType: z.string().nullable().optional(),
  coverageArea: z.number().nullable().optional(),
  size: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });

    const formData = await req.formData();

    const data = menuItemSchema.partial().parse({
      categoryId: formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : undefined,
      nameTh: formData.get('nameTh') as string || undefined,
      nameEn: formData.get('nameEn') as string || undefined,
      descriptionTh: formData.get('descriptionTh') as string || undefined,
      descriptionEn: formData.get('descriptionEn') as string || undefined,
      price: formData.get('price') ? parseFloat(formData.get('price') as string) : undefined,
      sortOrder: formData.get('sortOrder') ? parseInt(formData.get('sortOrder') as string) : undefined,
      isAvailable: formData.get('isAvailable') !== undefined ? formData.get('isAvailable') !== 'false' : undefined,
      brand: formData.get('brand') as string || undefined,
      colorCode: formData.get('colorCode') as string || undefined,
      colorName: formData.get('colorName') as string || undefined,
      finishType: formData.get('finishType') as string || undefined,
      coverageArea: formData.get('coverageArea') ? parseFloat(formData.get('coverageArea') as string) : undefined,
      size: formData.get('size') as string || undefined,
      unit: formData.get('unit') as string || undefined,
    });

    const updateData: Record<string, unknown> = { ...data };
    const imagePath = await saveUploadedFile(formData, 'image');
    if (imagePath) updateData.image = imagePath;

    const item = await db.menuItems.update(id, updateData);
    if (!item) throw new ApiError('ไม่พบสินค้า', 404);
    return NextResponse.json({ success: true, data: item });
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

    await db.menuItems.delete(id);
    return NextResponse.json({ success: true, message: 'ลบสินค้าเรียบร้อย' });
  } catch (err) {
    return handleError(err);
  }
}
