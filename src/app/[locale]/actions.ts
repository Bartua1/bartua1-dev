'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export interface ActionState {
  success?: boolean;
  error?: string;
  message?: string;
}

export async function createPostAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const titleEs = formData.get('titleEs') as string;
  const titleEn = formData.get('titleEn') as string;
  const slug = formData.get('slug') as string;
  const contentEs = formData.get('contentEs') as string;
  const contentEn = formData.get('contentEn') as string;
  const topic = formData.get('topic') as string;
  const published = formData.get('published') === 'true';
  const password = formData.get('password') as string;

  if (!titleEs || !slug || !contentEs || !password) {
    return { success: false, error: 'errorEmptyFields' };
  }

  const expectedPassword = process.env.ADMIN_PASSWORD || 'devpass123';
  if (password !== expectedPassword) {
    return { success: false, error: 'errorPassword' };
  }

  try {
    const existing = await prisma.post.findUnique({
      where: { slug }
    });
    if (existing) {
      return { success: false, error: 'errorSlugUnique' };
    }

    await prisma.post.create({
      data: {
        slug,
        titleEs,
        titleEn: titleEn || titleEs,
        contentEs,
        contentEn: contentEn || contentEs,
        topic: topic || 'others',
        published,
      }
    });

    revalidatePath('/', 'layout');
    return { success: true, message: 'successCreated' };
  } catch (err) {
    console.error('Failed to create post:', err);
    return { success: false, error: 'Something went wrong on the server.' };
  }
}

export async function updatePostAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const id = formData.get('id') as string;
  const titleEs = formData.get('titleEs') as string;
  const titleEn = formData.get('titleEn') as string;
  const slug = formData.get('slug') as string;
  const contentEs = formData.get('contentEs') as string;
  const contentEn = formData.get('contentEn') as string;
  const topic = formData.get('topic') as string;
  const published = formData.get('published') === 'true';
  const password = formData.get('password') as string;

  if (!id || !titleEs || !slug || !contentEs || !password) {
    return { success: false, error: 'errorEmptyFields' };
  }

  const expectedPassword = process.env.ADMIN_PASSWORD || 'devpass123';
  if (password !== expectedPassword) {
    return { success: false, error: 'errorPassword' };
  }

  try {
    const existing = await prisma.post.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    });
    if (existing) {
      return { success: false, error: 'errorSlugUnique' };
    }

    await prisma.post.update({
      where: { id },
      data: {
        slug,
        titleEs,
        titleEn: titleEn || titleEs,
        contentEs,
        contentEn: contentEn || contentEs,
        topic: topic || 'others',
        published,
      }
    });

    revalidatePath('/', 'layout');
    return { success: true, message: 'successUpdated' };
  } catch (err) {
    console.error('Failed to update post:', err);
    return { success: false, error: 'Something went wrong on the server.' };
  }
}

export async function deletePostAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const id = formData.get('id') as string;
  const password = formData.get('password') as string;

  if (!id || !password) {
    return { success: false, error: 'errorEmptyFields' };
  }

  const expectedPassword = process.env.ADMIN_PASSWORD || 'devpass123';
  if (password !== expectedPassword) {
    return { success: false, error: 'errorPassword' };
  }

  try {
    await prisma.post.delete({
      where: { id }
    });

    revalidatePath('/', 'layout');
    return { success: true, message: 'successDeleted' };
  } catch (err) {
    console.error('Failed to delete post:', err);
    return { success: false, error: 'Something went wrong on the server.' };
  }
}

export async function whitelistIpAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const password = formData.get('password') as string;

  if (!password) {
    return { success: false, error: 'errorEmptyFields' };
  }

  const expectedPassword = process.env.ADMIN_PASSWORD || 'devpass123';
  if (password !== expectedPassword) {
    return { success: false, error: 'errorPassword' };
  }

  let clientIp = '127.0.0.1';
  try {
    const headersList = await headers();
    const xForwardedFor = headersList.get('x-forwarded-for');
    if (xForwardedFor) {
      clientIp = xForwardedFor.split(',')[0].trim();
    } else {
      const realIp = headersList.get('x-real-ip');
      if (realIp) {
        clientIp = realIp;
      }
    }
  } catch (err) {
    console.error('[Action] Failed to retrieve headers for whitelisting:', err);
    return { success: false, error: 'Failed to detect client IP' };
  }

  try {
    const existing = await prisma.adminIp.findUnique({
      where: { ip: clientIp }
    });

    if (!existing) {
      await prisma.adminIp.create({
        data: { ip: clientIp }
      });
    }

    revalidatePath('/', 'layout');
    return { success: true, message: 'whitelistSuccess' };
  } catch (err) {
    console.error('Failed to whitelist IP:', err);
    return { success: false, error: 'Failed to whitelist IP in database. Make sure db push has been run.' };
  }
}

export async function updateLocalizedPostAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const id = formData.get('id') as string;
  const locale = formData.get('locale') as string;
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const password = formData.get('password') as string;

  if (!id || !locale || !title || !content || !password) {
    return { success: false, error: 'errorEmptyFields' };
  }

  const expectedPassword = process.env.ADMIN_PASSWORD || 'devpass123';
  if (password !== expectedPassword) {
    return { success: false, error: 'errorPassword' };
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id }
    });
    if (!post) {
      return { success: false, error: 'Post not found.' };
    }

    const updateData: {
      titleEs?: string;
      contentEs?: string;
      titleEn?: string;
      contentEn?: string;
    } = {};
    if (locale === 'es') {
      updateData.titleEs = title;
      updateData.contentEs = content;
    } else {
      updateData.titleEn = title;
      updateData.contentEn = content;
    }

    await prisma.post.update({
      where: { id },
      data: updateData
    });

    revalidatePath('/', 'layout');
    return { success: true, message: 'successUpdated' };
  } catch (err) {
    console.error('Failed to update localized post:', err);
    return { success: false, error: 'Something went wrong on the server.' };
  }
}
