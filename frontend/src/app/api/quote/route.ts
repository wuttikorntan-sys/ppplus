import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handleError } from '@/lib/api-server';

const quoteSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().nullable().default(null),
  company: z.string().nullable().default(null),
  productId: z.number().nullable().default(null),
  productName: z.string().nullable().default(null),
  quantity: z.string().nullable().default(null),
  message: z.string().nullable().default(null),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = quoteSchema.parse(body);
    const quote = await db.quoteRequests.create(data);
    return NextResponse.json({ success: true, data: quote }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
