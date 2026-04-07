import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, handleError } from '@/lib/api-server';
import { sendLineMessage } from '@/lib/line';

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    await sendLineMessage('🔔 ทดสอบการแจ้งเตือน LINE จาก PP Plus Admin\n\n✅ ระบบทำงานปกติ!');
    return NextResponse.json({ success: true, message: 'Test message sent' });
  } catch (err) {
    return handleError(err);
  }
}
