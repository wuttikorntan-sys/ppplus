import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin, handleError } from '@/lib/api-server';
import { saveUploadedFile } from '@/lib/upload';

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

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
    const posts = await db.blogPosts.findMany();
    return NextResponse.json({ success: true, data: posts });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);
    const formData = await req.formData();

    const data = blogPostSchema.parse({
      titleTh: formData.get('titleTh') as string,
      titleEn: formData.get('titleEn') as string,
      contentTh: formData.get('contentTh') as string,
      contentEn: formData.get('contentEn') as string,
      excerptTh: formData.get('excerptTh') as string,
      excerptEn: formData.get('excerptEn') as string,
      slug: formData.get('slug') as string,
      tags: formData.get('tags') as string || '',
      isPublished: formData.get('isPublished') !== 'false',
    });

    let image: string | null = null;
    const file = formData.get('image') as File | null;
    if (file && file.size > 0) {
      image = await saveUploadedFile(file, 'blog');
    }

    const post = await db.blogPosts.create({
      ...data,
      tags: data.tags || '',
      isPublished: data.isPublished ?? false,
      image,
      publishedAt: data.isPublished ? new Date().toISOString() : null,
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
