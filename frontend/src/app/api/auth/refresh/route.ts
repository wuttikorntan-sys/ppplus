import { NextRequest, NextResponse } from 'next/server';
import { generateTokens, verifyRefreshToken, handleError, ApiError } from '@/lib/api-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;
    if (!refreshToken) throw new ApiError('กรุณาระบุ refresh token', 400);

    const decoded = verifyRefreshToken(refreshToken);
    const tokens = generateTokens(decoded.userId, decoded.role);
    return NextResponse.json({ success: true, data: tokens });
  } catch {
    return NextResponse.json({ success: false, error: 'Refresh token ไม่ถูกต้องหรือหมดอายุ' }, { status: 401 });
  }
}
