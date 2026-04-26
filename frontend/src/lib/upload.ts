import fs from 'fs';
import path from 'path';
import { ApiError } from '@/lib/api-server';

// Tuning for uploaded images
const MAX_IMAGE_WIDTH = 1920; // Resize anything wider; preserves smaller images
const WEBP_QUALITY = 82;

// sharp depends on platform-specific native binaries. On hosts where those
// aren't installed correctly the whole module throws on import, which
// previously took down every admin route that calls saveUploadedFile
// (menu, hero-slides, gallery, etc) with 500s. Load it defensively and
// fall back to writing the original bytes when it isn't available.
type SharpFactory = typeof import('sharp');
let sharpModule: SharpFactory | null | undefined;
function loadSharp(): SharpFactory | null {
  if (sharpModule !== undefined) return sharpModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sharpModule = require('sharp') as SharpFactory;
  } catch (err) {
    console.warn('[upload] sharp unavailable, image optimization disabled:', err instanceof Error ? err.message : err);
    sharpModule = null;
  }
  return sharpModule;
}

// Persistent uploads directory OUTSIDE the git-managed project
// On Hostinger: /home/u626866170/uploads  (set via UPLOADS_DIR env var)
// Locally: ../uploads  (one level up from frontend, outside git)
const PARENT_UPLOADS_DIR = path.resolve(process.cwd(), '..', 'uploads');
const LOCAL_UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const UPLOADS_DIR = process.env.UPLOADS_DIR
  || (fs.existsSync(LOCAL_UPLOADS_DIR) ? LOCAL_UPLOADS_DIR : PARENT_UPLOADS_DIR);

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const VIDEO_EXTS = ['.mp4', '.webm', '.ogg', '.mov'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export async function saveUploadedFile(formData: FormData, fieldName: string): Promise<string | null> {
  const file = formData.get(fieldName);
  if (!file || typeof file === 'string' || file.size === 0) return null;

  const ext = path.extname(file.name || '').toLowerCase() || '.png';
  const isVideo = VIDEO_TYPES.includes(file.type) || VIDEO_EXTS.includes(ext);
  const mimeOk = file.type && (ALLOWED_TYPES.includes(file.type) || VIDEO_TYPES.includes(file.type));
  const extOk = ALLOWED_EXTS.includes(ext) || VIDEO_EXTS.includes(ext);
  if (!mimeOk && !extOk) {
    console.error(`Upload rejected: type=${file.type}, name=${file.name}, ext=${ext}`);
    throw new ApiError('อนุญาตเฉพาะไฟล์รูปภาพ (jpeg, png, webp, gif) หรือวิดีโอ (mp4, webm)', 400);
  }
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_SIZE;
  if (file.size > maxSize) {
    throw new ApiError(isVideo ? 'วิดีโอต้องมีขนาดไม่เกิน 100MB' : 'ไฟล์ต้องมีขนาดไม่เกิน 10MB', 400);
  }
  const buffer = Buffer.from(await file.arrayBuffer());

  // Optimize images: downscale wide images and re-encode as WebP.
  // Skip GIFs (animation) and videos — written through as-is.
  let outputBuffer: Buffer = buffer;
  let outputExt = ext;
  const sharp = loadSharp();
  if (sharp && !isVideo && ext !== '.gif') {
    try {
      const img = sharp(buffer, { failOn: 'none' });
      const meta = await img.metadata();
      const pipeline = (meta.width && meta.width > MAX_IMAGE_WIDTH)
        ? img.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
        : img;
      outputBuffer = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
      outputExt = '.webp';
    } catch (err) {
      // Bad/unsupported image → fall back to original bytes so the upload
      // still succeeds (admin can re-upload a fixed file later)
      console.warn('Image optimization skipped:', err instanceof Error ? err.message : err);
    }
  }

  const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + outputExt;
  const filePath = path.join(UPLOADS_DIR, uniqueName);

  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, outputBuffer);
    console.log(`File saved: ${filePath} (${outputBuffer.length} bytes, original ${buffer.length} bytes)`);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`File write error: ${filePath} - ${errMsg}`);
    throw new ApiError(`ไม่สามารถบันทึกรูปภาพได้: ${errMsg}`, 500);
  }

  return `/api/uploads/${uniqueName}`;
}

export function getUploadsDir(): string {
  return UPLOADS_DIR;
}

const DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const DOCUMENT_EXTS = ['.pdf', '.doc', '.docx'];
const DOC_MAX_SIZE = 20 * 1024 * 1024; // 20MB

export async function saveUploadedDocument(formData: FormData, fieldName: string): Promise<string | null> {
  const file = formData.get(fieldName);
  if (!file || typeof file === 'string' || file.size === 0) return null;

  const ext = path.extname(file.name || '').toLowerCase() || '.pdf';
  const allAllowedTypes = [...ALLOWED_TYPES, ...DOCUMENT_TYPES];
  const allAllowedExts = [...ALLOWED_EXTS, ...DOCUMENT_EXTS];
  const mimeOk = file.type && allAllowedTypes.includes(file.type);
  const extOk = allAllowedExts.includes(ext);
  if (!mimeOk && !extOk) {
    throw new ApiError('อนุญาตเฉพาะไฟล์ PDF, Word หรือรูปภาพ', 400);
  }
  if (file.size > DOC_MAX_SIZE) {
    throw new ApiError('ไฟล์ต้องมีขนาดไม่เกิน 20MB', 400);
  }

  const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
  const filePath = path.join(UPLOADS_DIR, uniqueName);

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, buffer);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`Document write error: ${filePath} - ${errMsg}`);
    throw new ApiError(`ไม่สามารถบันทึกเอกสารได้: ${errMsg}`, 500);
  }

  return `/api/uploads/${uniqueName}`;
}
