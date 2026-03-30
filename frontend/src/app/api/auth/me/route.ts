import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, handleError, ApiError } from '@/lib/api-server';

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const user = await db.users.findById(auth.userId);
    if (!user) throw new ApiError('ไม่พบผู้ใช้', 404);

    return NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role, locale: user.locale, createdAt: user.createdAt },
    });
  } catch (err) {
    return handleError(err);
  }
}
