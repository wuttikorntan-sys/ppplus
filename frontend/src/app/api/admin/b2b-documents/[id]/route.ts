import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';
import { saveUploadedDocument } from '@/lib/upload';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const docId = parseInt(id, 10);
    const formData = await req.formData();
    const nameTh = formData.get('nameTh') as string;
    const nameEn = formData.get('nameEn') as string;
    const sortOrder = parseInt(formData.get('sortOrder') as string || '0', 10);
    const isActive = formData.has('isActive');

    const updateData: Record<string, unknown> = { nameTh, nameEn, sortOrder, isActive };

    const filePath = await saveUploadedDocument(formData, 'file');
    if (filePath) {
      updateData.filePath = filePath;
      const file = formData.get('file') as File;
      updateData.fileSize = formatFileSize(file.size);
      updateData.fileType = getFileType(file.name);
    }

    const doc = await db.b2bDocuments.update(docId, updateData as any);
    if (!doc) return NextResponse.json({ success: false, error: 'ไม่พบเอกสาร' }, { status: 404 });
    return NextResponse.json({ success: true, data: doc });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const deleted = await db.b2bDocuments.delete(parseInt(id, 10));
    if (!deleted) return NextResponse.json({ success: false, error: 'ไม่พบเอกสาร' }, { status: 404 });
    return NextResponse.json({ success: true });
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
