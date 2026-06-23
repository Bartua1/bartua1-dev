import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { checkIsAdmin } from '@/lib/auth';
import InlinePostEditor from '@/components/InlinePostEditor';
import { trackVisit } from '@/lib/analytics';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = ['es', 'en'].includes(rawLocale) ? rawLocale : 'es';
  
  let post = null;
  try {
    post = await prisma.post.findUnique({
      where: { slug }
    });
  } catch (err) {
    console.error(`[Blog] Failed to fetch post metadata for slug ${slug}:`, err);
  }

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: `${locale === 'es' ? post.titleEs : post.titleEn} | Gonzalo Bartual`,
    description: locale === 'es' ? post.contentEs.substring(0, 160) : post.contentEn.substring(0, 160),
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = ['es', 'en'].includes(rawLocale) ? rawLocale : 'es';

  let post = null;
  try {
    post = await prisma.post.findUnique({
      where: { slug }
    });
  } catch (err) {
    console.error(`[Blog] Failed to fetch post detail for slug ${slug}:`, err);
  }

  if (!post) {
    notFound();
  }

  // Extract client IP and verify admin permissions to view draft posts
  const { isAdmin } = await checkIsAdmin();

  // If the post is not published and the user is not an admin, return 404
  if (!post.published && !isAdmin) {
    notFound();
  }

  // Track page visit
  await trackVisit(`/posts/${slug}`);

  // Increment views count in database
  try {
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    });
  } catch (err) {
    console.error('Failed to increment views:', err);
  }

  return (
    <InlinePostEditor
      post={post}
      isAdmin={isAdmin}
      locale={locale}
    />
  );
}
