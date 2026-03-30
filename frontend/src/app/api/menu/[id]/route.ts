import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleError } from '@/lib/api-server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });

    const item = await db.menuItems.findById(id, true);
    if (!item) return NextResponse.json({ success: false, error: 'ไม่พบเมนู' }, { status: 404 });

    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    return handleError(err);
  }
}
