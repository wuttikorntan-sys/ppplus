import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';

const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().nullable().optional(),
  company: z.string().nullable().optional(),
  productName: z.string().nullable().optional(),
  productId: z.number().int().positive().nullable().optional(),
  quantity: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const quotes = await db.quoteRequests.findMany();
    return NextResponse.json({ success: true, data: quotes });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const body = await req.json();
    const data = createSchema.parse(body);
    const created = await db.quoteRequests.create({
      name: data.name,
      phone: data.phone,
      email: data.email ?? null,
      company: data.company ?? null,
      productId: data.productId ?? null,
      productName: data.productName ?? null,
      quantity: data.quantity ?? null,
      message: data.message ?? null,
      cartItems: null,
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
