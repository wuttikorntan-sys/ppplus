import fs from 'fs';
import path from 'path';

// Persistent uploads directory outside the git-managed area
// On Hostinger: ~/uploads/ persists across deploys
// Locally: ./uploads/ in project root
const UPLOADS_DIR = process.env.UPLOADS_DIR
  || path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function saveUploadedFile(formData: FormData, fieldName: string): Promise<string | null> {
  const file = formData.get(fieldName);
  if (!file || !(file instanceof File) || file.size === 0) return null;

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('อนุญาตเฉพาะไฟล์รูปภาพ (jpeg, jpg, png, webp)');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('ไฟล์ต้องมีขนาดไม่เกิน 5MB');
  }

  const ext = path.extname(file.name) || '.png';
  const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
  const filePath = path.join(UPLOADS_DIR, uniqueName);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

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
    throw new Error('อนุญาตเฉพาะไฟล์ PDF, Word หรือรูปภาพ');
  }
  if (file.size > DOC_MAX_SIZE) {
    throw new Error('ไฟล์ต้องมีขนาดไม่เกิน 20MB');
  }

  const ext = path.extname(file.name) || '.pdf';
  const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
  const filePath = path.join(UPLOADS_DIR, uniqueName);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return `/uploads/${uniqueName}`;
}
