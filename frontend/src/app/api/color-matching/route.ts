import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleError } from '@/lib/api-server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get('brand') || undefined;
    const search = searchParams.get('search') || undefined;

    const where: Record<string, unknown> = { isActive: 1 };
    if (brand) where.carBrand = brand;
    if (search) where.search = search;

    const formulas = await db.colorFormulas.findMany({ where });
    const brands = await db.colorFormulas.getBrands();

    return NextResponse.json({ success: true, data: formulas, brands });
  } catch (err) {
    return handleError(err);
  }
}
