import crypto from 'crypto';

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

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = 'ppplus';
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadForm = new FormData();
  uploadForm.append('file', new Blob([buffer], { type: file.type }), file.name);
  uploadForm.append('api_key', apiKey);
  uploadForm.append('timestamp', timestamp);
  uploadForm.append('signature', signature);
  uploadForm.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    { method: 'POST', body: uploadForm },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }

  const json = await res.json();
  return json.secure_url as string;
}
