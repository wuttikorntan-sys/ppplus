import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const docs = await db.b2bDocuments.findMany(true);
    return NextResponse.json({ success: true, data: docs });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to load documents' }, { status: 500 });
  }
}
