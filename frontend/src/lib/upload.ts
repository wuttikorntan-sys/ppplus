import fs from 'fs';
import path from 'path';
import { ApiError } from '@/lib/api-server';

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
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function saveUploadedFile(formData: FormData, fieldName: string): Promise<string | null> {
  const file = formData.get(fieldName);
  if (!file || typeof file === 'string' || file.size === 0) return null;

  const ext = path.extname(file.name || '').toLowerCase() || '.png';
  const mimeOk = file.type && ALLOWED_TYPES.includes(file.type);
  const extOk = ALLOWED_EXTS.includes(ext);
  if (!mimeOk && !extOk) {
    console.error(`Upload rejected: type=${file.type}, name=${file.name}, ext=${ext}`);
    throw new ApiError('อนุญาตเฉพาะไฟล์รูปภาพ (jpeg, jpg, png, webp, gif)', 400);
  }
  if (file.size > MAX_SIZE) {
    throw new ApiError('ไฟล์ต้องมีขนาดไม่เกิน 10MB', 400);
  }
  const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
  const filePath = path.join(UPLOADS_DIR, uniqueName);

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, buffer);
    console.log(`File saved: ${filePath} (${buffer.length} bytes)`);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`File write error: ${filePath} - ${errMsg}`);
    throw new ApiError(`ไม่สามารถบันทึกรูปภาพได้: ${errMsg}`, 500);
  }

  return `/uploads/${uniqueName}`;
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

  return `/uploads/${uniqueName}`;
}
