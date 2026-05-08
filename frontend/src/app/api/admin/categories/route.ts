import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const categories = await db.categories.findMany();
    return NextResponse.json({ success: true, data: categories });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const body = await req.json();
    const data = z.object({
      nameTh: z.string().min(1),
      nameEn: z.string().min(1),
      sortOrder: z.number().int().optional(),
    }).parse(body);

    const dup = await db.categories.findByNames(data.nameTh.trim(), data.nameEn.trim());
    if (dup) {
      throw new ApiError(`มีหมวดหมู่ "${data.nameTh}" อยู่แล้ว (ID ${dup.id})`, 409);
    }

    const category = await db.categories.create({
      nameTh: data.nameTh.trim(),
      nameEn: data.nameEn.trim(),
      sortOrder: data.sortOrder ?? 0,
    });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
