import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { requireAdmin, handleError } from '@/lib/api-server';
import { getUploadsDir } from '@/lib/upload';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'];

/* ───── GET: export all uploaded images as ZIP ───── */
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);

    const uploadsDir = getUploadsDir();

    if (!fs.existsSync(uploadsDir)) {
      return NextResponse.json(
        { success: false, error: 'No uploads directory found' },
        { status: 404 }
      );
    }

    const files = fs.readdirSync(uploadsDir).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return ALLOWED_EXTENSIONS.includes(ext);
    });

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No uploaded files to backup' },
        { status: 404 }
      );
    }

    const zip = new AdmZip();
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      zip.addLocalFile(filePath);
    }

    const zipBuffer = zip.toBuffer();
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `ppplus-images-${timestamp}.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(zipBuffer.length),
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

/* ───── POST: restore images from ZIP ───── */
export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { success: false, error: 'Only .zip files are supported' },
        { status: 400 }
      );
    }

    // Max 100MB for image backup
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large (max 100MB)' },
        { status: 400 }
      );
    }

    const uploadsDir = getUploadsDir();
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    let restoredCount = 0;
    let skippedCount = 0;

    for (const entry of entries) {
      if (entry.isDirectory) continue;

      const fileName = path.basename(entry.entryName);
      // Prevent directory traversal
      if (fileName.includes('..') || fileName.startsWith('.')) {
        skippedCount++;
        continue;
      }

      const ext = path.extname(fileName).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        skippedCount++;
        continue;
      }

      const destPath = path.join(uploadsDir, fileName);
      fs.writeFileSync(destPath, entry.getData());
      restoredCount++;
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Restored ${restoredCount} files${skippedCount > 0 ? `, skipped ${skippedCount}` : ''}`,
        restored: restoredCount,
        skipped: skippedCount,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
