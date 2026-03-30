import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateTokens, handleError, ApiError } from '@/lib/api-server';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await db.users.findByEmail(data.email);
    if (!user) throw new ApiError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) throw new ApiError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);

    const tokens = generateTokens(user.id, user.role);

    return NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role, locale: user.locale },
        ...tokens,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
