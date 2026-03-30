import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleError } from '@/lib/api-server';

export async function GET() {
  try {
    const contents = await db.siteContents.findMany();
    const map: Record<string, { th: string; en: string }> = {};
    contents.forEach((c) => { map[c.key] = { th: c.valueTh, en: c.valueEn }; });
    return NextResponse.json({ success: true, data: map });
  } catch (err) {
    return handleError(err);
  }
}
