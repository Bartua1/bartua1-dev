import prisma from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { headers } from 'next/headers';
import BlogClientLayout from '@/components/BlogClientLayout';
import { Post } from '@prisma/client';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function BlogPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = ['es', 'en'].includes(rawLocale) ? rawLocale : 'es';
  const t = await getTranslations('Blog');
  const tNav = await getTranslations('Navigation');

  // Fetch posts from database
  let posts: Post[] = [];
  try {
    posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('[Blog] Failed to fetch posts from database:', err);
  }

  // Extract client IP and verify admin permissions
  const headersList = await headers();
  const xForwardedFor = headersList.get('x-forwarded-for');
  let clientIp = '127.0.0.1';
  if (xForwardedFor) {
    clientIp = xForwardedFor.split(',')[0].trim();
  } else {
    const realIp = headersList.get('x-real-ip');
    if (realIp) {
      clientIp = realIp;
    }
  }

  const adminIp = process.env.ADMIN_IP || '146.158.240.144';
  const isLocal = clientIp === '127.0.0.1' ||
    clientIp === '::1' ||
    clientIp === 'localhost' ||
    clientIp === '::' ||
    clientIp.endsWith('127.0.0.1') ||
    clientIp.startsWith('::ffff:127.0.0.1');
  const isAdmin = clientIp === adminIp || isLocal;

  console.log(`[Blog] Client IP: ${clientIp} | Admin access: ${isAdmin}`);

  // Determine other locale for language toggle link
  const otherLocale = locale === 'es' ? 'en' : 'es';

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
            <Link href="/bartua1" className="text-stone-600 hover:text-accent transition-colors">
              {tNav('portfolio')}
            </Link>
            <Link
              href="/"
              locale={otherLocale}
              className="px-3 py-1 rounded bg-stone-100 hover:bg-stone-200 transition-colors font-mono text-xs text-stone-700"
            >
              {tNav('langToggle')}
            </Link>
          </nav>
        </header>

        {/* Hero section */}
        <section className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-stone-900">
            {t('title')}
          </h1>
          <p className="text-lg text-stone-600 leading-relaxed max-w-2xl">
            {t('description')}
          </p>
        </section>

        {/* Posts list organized by topic (client managed) */}
        <BlogClientLayout posts={posts} isAdmin={isAdmin} locale={locale} />

        {/* Footer */}
        <footer className="border-t border-stone-200 pt-8 mt-12 text-center text-xs text-stone-500 font-mono space-y-2">
          <p>© {new Date().getFullYear()} Gonzalo Bartual. Hosted on Raspberry Pi.</p>
          {process.env.NODE_ENV !== 'production' && (
            <p className="text-[10px] text-stone-400">
              [Debug] IP: <span className="font-semibold">{clientIp}</span> | Admin: <span className="font-semibold">{isAdmin ? 'Yes' : 'No'}</span>
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
