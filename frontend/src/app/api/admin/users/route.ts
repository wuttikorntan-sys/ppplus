import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const users = (await db.users.findMany({ orderBy: 'createdAt:desc' })).map((u) => ({
      id: u.id, email: u.email, name: u.name, phone: u.phone, role: u.role, locale: u.locale, createdAt: u.createdAt,
    }));
    return NextResponse.json({ success: true, data: users });
  } catch (err) {
    return handleError(err);
  }
}
