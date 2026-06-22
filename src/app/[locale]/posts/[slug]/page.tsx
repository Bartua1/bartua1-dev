import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { marked } from 'marked';
import { checkIsAdmin } from '@/lib/auth';

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
  
  const t = await getTranslations('Blog');
  const tNav = await getTranslations('Navigation');
  const tPort = await getTranslations('Portfolio');

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

  // Increment views count in database
  try {
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    });
  } catch (err) {
    console.error('Failed to increment views:', err);
  }

  const title = locale === 'es' ? post.titleEs : post.titleEn;
  const content = locale === 'es' ? post.contentEs : post.contentEn;
  const formattedDate = new Date(post.createdAt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Compile Markdown to HTML
  const parsedHtml = await marked.parse(content || '');

  const otherLocale = locale === 'es' ? 'en' : 'es';

  // Hook for custom UIs: if the user specifies a custom UI for this slug, we can render it.
  // Example: if (post.slug === 'foodiedot-interactive') { return <FoodieDotCustomPost /> }

  return (
    <div className="min-h-screen flex flex-col max-w-3xl mx-auto px-6 py-12">
    <div className="flex flex-col space-y-12">
      {/* Header */}
      <header className="flex justify-between items-baseline border-b border-stone-200 pb-6">
        <div>
          <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            Gonzalo Bartual
          </Link>
          <p className="text-xs text-stone-500 font-mono mt-1">/dev</p>
        </div>
        <nav className="flex space-x-6 items-center text-sm font-medium">
          <Link href="/" className="text-stone-600 hover:text-accent transition-colors">
            {tNav('home')}
          </Link>
          <Link href="/bartua1" className="text-stone-600 hover:text-accent transition-colors">
            {tNav('portfolio')}
          </Link>
          <Link
            href={`/posts/${post.slug}`}
            locale={otherLocale}
            className="px-3 py-1 rounded bg-stone-100 hover:bg-stone-200 transition-colors font-mono text-xs text-stone-700"
          >
            {tNav('langToggle')}
          </Link>
        </nav>
      </header>

      {/* Back button */}
      <div>
        <Link href="/" className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-accent font-mono transition-colors">
          &larr; {tPort('backToBlog') || 'Volver al Blog'}
        </Link>
      </div>

      {/* Main post view */}
      <article className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-xs font-mono text-stone-500">
            <time dateTime={post.createdAt instanceof Date ? post.createdAt.toISOString() : new Date(post.createdAt).toISOString()}>
              {formattedDate}
            </time>
            <span>•</span>
            <span>
              {t('views', { count: post.views + 1 })}
            </span>
            {post.topic.split(',').map((tKey) => {
              const trimmed = tKey.trim();
              return (
                <span key={trimmed} className="px-2 py-0.5 rounded-sm bg-stone-200 text-stone-700 uppercase tracking-wider text-[9px] font-bold font-mono">
                  {t(`topics.${trimmed}`)}
                </span>
              );
            })}
            {!post.published && (
              <span className="px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider text-[9px] font-bold font-mono">
                Draft
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-stone-900 leading-tight">
            {title}
          </h1>
        </div>

        <div className="border-t border-stone-200 pt-6">
          <div 
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: parsedHtml }}
          />
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-stone-200 pt-8 mt-12 text-center text-xs text-stone-500 font-mono">
        <p>© {new Date().getFullYear()} Gonzalo Bartual. Hosted on Raspberry Pi.</p>
      </footer>
    </div>
    </div>
  );
}
