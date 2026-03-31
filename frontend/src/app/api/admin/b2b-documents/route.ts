import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';
import { saveUploadedDocument } from '@/lib/upload';

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const docs = await db.b2bDocuments.findMany();
    return NextResponse.json({ success: true, data: docs });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const formData = await req.formData();
    const nameTh = formData.get('nameTh') as string;
    const nameEn = formData.get('nameEn') as string;
    const sortOrder = parseInt(formData.get('sortOrder') as string || '0', 10);
    const isActive = formData.has('isActive');

    if (!nameTh || !nameEn) {
      return NextResponse.json({ success: false, error: 'ชื่อไทยและอังกฤษจำเป็นต้องกรอก' }, { status: 400 });
    }

    const filePath = await saveUploadedDocument(formData, 'file');
    if (!filePath) {
      return NextResponse.json({ success: false, error: 'กรุณาอัพโหลดไฟล์' }, { status: 400 });
    }

    const file = formData.get('file') as File;
    const fileSize = formatFileSize(file.size);
    const fileType = getFileType(file.name);

    const doc = await db.b2bDocuments.create({ nameTh, nameEn, filePath, fileSize, fileType, sortOrder, isActive });
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    return handleError(err);
  }
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return bytes + ' B';
}

function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'PDF';
  if (ext === 'doc' || ext === 'docx') return 'Word';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'Image';
  return ext.toUpperCase();
}
