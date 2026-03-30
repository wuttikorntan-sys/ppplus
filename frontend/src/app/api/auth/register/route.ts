import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateTokens, handleError, ApiError } from '@/lib/api-server';

const registerSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  phone: z.string().optional(),
  locale: z.enum(['th', 'en']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await db.users.findByEmail(data.email);
    if (existing) throw new ApiError('อีเมลนี้ถูกใช้งานแล้ว', 409);

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await db.users.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone || null,
      role: 'CUSTOMER',
      locale: data.locale || 'th',
    });

    const tokens = generateTokens(user.id, user.role);

    return NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role, locale: user.locale },
        ...tokens,
      },
    }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
