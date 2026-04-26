import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getUploadsDir } from '@/lib/upload';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
// Allow only a small whitelist of widths to keep the cache key bounded and
// to discourage abuse (anyone hammering ?w=1, ?w=2, ?w=3 to thrash sharp).
const ALLOWED_WIDTHS = new Set([320, 480, 640, 800, 960, 1280, 1600, 1920]);

// Lazy load sharp the same way lib/upload.ts does — if it isn't installed
// on the host, just serve the original bytes instead of 500-ing.
type SharpFactory = typeof import('sharp');
let sharpModule: SharpFactory | null | undefined;
function loadSharp(): SharpFactory | null {
  if (sharpModule !== undefined) return sharpModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sharpModule = require('sharp') as SharpFactory;
  } catch {
    sharpModule = null;
  }
  return sharpModule;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const fileName = segments.join('/');

  // Prevent directory traversal
  if (fileName.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const filePath = path.join(getUploadsDir(), fileName);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };

  const buffer = fs.readFileSync(filePath);

  // On-the-fly resize for images when ?w=N is supplied. This lets the front
  // end hand each viewport the smallest version it actually needs even
  // though images: { unoptimized: true } means <Image> can't generate srcset.
  // GIFs are skipped (would lose animation) and so is everything that isn't
  // a still image.
  const widthParam = req.nextUrl.searchParams.get('w');
  const wantsResize = widthParam && IMAGE_EXTS.has(ext) && ext !== '.gif';
  if (wantsResize) {
    const w = parseInt(widthParam, 10);
    if (!Number.isFinite(w) || !ALLOWED_WIDTHS.has(w)) {
      return NextResponse.json({ error: `width must be one of ${[...ALLOWED_WIDTHS].join(', ')}` }, { status: 400 });
    }
    const sharp = loadSharp();
    if (sharp) {
      try {
        const img = sharp(buffer, { failOn: 'none' });
        const meta = await img.metadata();
        // Don't bother piping through sharp if the source is already narrower
        // than the requested width — just serve the original.
        if (!meta.width || meta.width <= w) {
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': mimeMap[ext] || 'application/octet-stream',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
        // Always re-encode to WebP for the resized variant — the original
        // file on disk is left untouched.
        const out = await img
          .resize({ width: w, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        return new NextResponse(new Uint8Array(out), {
          headers: {
            'Content-Type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000, immutable',
            // Useful when debugging a "why is this so big?" report
            'X-Image-Source-Width': String(meta.width),
            'X-Image-Resized-Width': String(w),
          },
        });
      } catch {
        // Fall through to original-bytes response below
      }
    }
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': mimeMap[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
