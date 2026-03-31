import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, handleError, ApiError } from '@/lib/api-server';
import { saveUploadedFile } from '@/lib/upload';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatPost(post: any) {
  const tags = typeof post.tags === 'string' && post.tags
    ? post.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : [];
  return { ...post, tags };
}

const blogPostSchema = z.object({
  titleTh: z.string().min(1),
  titleEn: z.string().min(1),
  contentTh: z.string().min(1),
  contentEn: z.string().min(1),
  excerptTh: z.string(),
  excerptEn: z.string(),
  slug: z.string().min(1),
  tags: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const postId = parseInt(id);
    const existing = await db.blogPosts.findById(postId);
    if (!existing) throw new ApiError('ไม่พบบทความ', 404);

    const formData = await req.formData();
    const data = blogPostSchema.partial().parse({
      titleTh: formData.get('titleTh') as string || undefined,
      titleEn: formData.get('titleEn') as string || undefined,
      contentTh: formData.get('contentTh') as string || undefined,
      contentEn: formData.get('contentEn') as string || undefined,
      excerptTh: formData.get('excerptTh') as string || undefined,
      excerptEn: formData.get('excerptEn') as string || undefined,
      slug: formData.get('slug') as string || undefined,
      tags: formData.get('tags') as string || undefined,
      isPublished: formData.has('isPublished') ? formData.get('isPublished') !== 'false' : undefined,
    });

    let image: string | null | undefined = undefined;
    const file = formData.get('image') as File | null;
    if (file && file.size > 0) {
      image = await saveUploadedFile(formData, 'image');
    }

    const updateData: Record<string, unknown> = { ...data };
    if (image !== undefined) updateData.image = image;
    if (data.isPublished && !existing.publishedAt) {
      updateData.publishedAt = new Date().toISOString();
    }

    const post = await db.blogPosts.update(postId, updateData);
    return NextResponse.json({ success: true, data: formatPost(post!) });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    const { id } = await params;
    const postId = parseInt(id);
    const deleted = await db.blogPosts.delete(postId);
    if (!deleted) throw new ApiError('ไม่พบบทความ', 404);
    return NextResponse.json({ success: true, message: 'ลบบทความเรียบร้อย' });
  } catch (err) {
    return handleError(err);
  }
}
