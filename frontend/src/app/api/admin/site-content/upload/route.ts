import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, handleError } from '@/lib/api-server';
import { saveUploadedFile } from '@/lib/upload';

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const formData = await req.formData();
    const imagePath = await saveUploadedFile(formData, 'image');
    if (!imagePath) {
      return NextResponse.json({ success: false, error: 'กรุณาอัพโหลดรูปภาพ' }, { status: 400 });
    }
    return NextResponse.json({ success: true, url: imagePath }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
