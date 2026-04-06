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
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function saveUploadedFile(formData: FormData, fieldName: string): Promise<string | null> {
  const file = formData.get(fieldName);
  if (!file || !(file instanceof File) || file.size === 0) return null;

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ApiError('อนุญาตเฉพาะไฟล์รูปภาพ (jpeg, jpg, png, webp, gif)', 400);
  }
  if (file.size > MAX_SIZE) {
    throw new ApiError('ไฟล์ต้องมีขนาดไม่เกิน 5MB', 400);
  }

  const ext = path.extname(file.name) || '.png';
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
const DOC_MAX_SIZE = 20 * 1024 * 1024; // 20MB

export async function saveUploadedDocument(formData: FormData, fieldName: string): Promise<string | null> {
  const file = formData.get(fieldName);
  if (!file || !(file instanceof File) || file.size === 0) return null;

  const allAllowed = [...ALLOWED_TYPES, ...DOCUMENT_TYPES];
  if (!allAllowed.includes(file.type)) {
    throw new ApiError('อนุญาตเฉพาะไฟล์ PDF, Word หรือรูปภาพ', 400);
  }
  if (file.size > DOC_MAX_SIZE) {
    throw new ApiError('ไฟล์ต้องมีขนาดไม่เกิน 20MB', 400);
  }

  const ext = path.extname(file.name) || '.pdf';
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
