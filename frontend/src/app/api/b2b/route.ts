import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handleError } from '@/lib/api-server';

const b2bSchema = z.object({
  companyName: z.string().min(1),
  contactPerson: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  businessType: z.string().min(1),
  province: z.string().nullable().default(null),
  message: z.string().nullable().default(null),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = b2bSchema.parse(body);
    const application = await db.b2bApplications.create(data);
    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
