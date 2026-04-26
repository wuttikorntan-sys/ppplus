import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleError } from '@/lib/api-server';

export async function GET() {
  try {
    const contents = await db.siteContents.findMany();
    const map: Record<string, { th: string; en: string }> = {};
    // Strip anything stored under a "secret." prefix — those are admin-only
    // (e.g. third-party API keys) and must never be served to public callers.
    contents.forEach((c) => {
      if (c.key.startsWith('secret.')) return;
      map[c.key] = { th: c.valueTh, en: c.valueEn };
    });
    return NextResponse.json({ success: true, data: map });
  } catch (err) {
    return handleError(err);
  }
}
