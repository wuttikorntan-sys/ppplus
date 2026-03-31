import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-ppplus-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-ppplus-2026';

export function generateTokens(userId: number, role: string) {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ userId, role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export function verifyToken(token: string): { userId: number; role: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
}

export function verifyRefreshToken(token: string): { userId: number; role: string } {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: number; role: string };
}

export function getAuth(req: NextRequest): { userId: number; role: string } | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    return verifyToken(authHeader.split(' ')[1]);
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): { userId: number; role: string } {
  const auth = getAuth(req);
  if (!auth) throw new ApiError('กรุณาเข้าสู่ระบบ', 401);
  return auth;
}

export function requireAdmin(req: NextRequest): { userId: number; role: string } {
  const auth = requireAuth(req);
  if (auth.role !== 'ADMIN') throw new ApiError('ไม่มีสิทธิ์เข้าถึง', 403);
  return auth;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function handleError(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json({ success: false, error: err.message }, { status: err.status });
  }
  if (err && typeof err === 'object' && 'issues' in err) {
    // Zod error
    const zodErr = err as { issues: { path: (string | number)[]; message: string }[] };
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      details: zodErr.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
    }, { status: 400 });
  }
  console.error('Unhandled error:', err);
  return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
}
