import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const contents = await db.siteContents.findMany();
    return NextResponse.json({ success: true, data: contents });
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    requireAdmin(req);
    const body = await req.json();
    const items = z.array(z.object({
      key: z.string().min(1),
      valueTh: z.string(),
      valueEn: z.string(),
      type: z.string().optional(),
    })).parse(body);

    const results = await Promise.all(items.map((item) =>
      db.siteContents.upsert({ key: item.key, valueTh: item.valueTh, valueEn: item.valueEn, type: item.type })
    ));

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    return handleError(err);
  }
}
