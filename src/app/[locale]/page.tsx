import prisma from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations('Blog');
  const tNav = await getTranslations('Navigation');

  // Fetch posts from database
  let posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Seed default posts if database is empty to guarantee a rich initial experience
  if (posts.length === 0) {
    try {
      await prisma.post.createMany({
        data: [
          {
            slug: 'first-post',
            titleEs: 'Iniciando mi Blog con Next.js y SQLite',
            titleEn: 'Starting my Blog with Next.js and SQLite',
            contentEs: '¡Bienvenidos! Este es mi primer artículo en este nuevo blog autohospedado en mi Raspberry Pi. He configurado Next.js con soporte multiidioma, Tailwind CSS v4, y SQLite administrado mediante Prisma.',
            contentEn: 'Welcome! This is my first article on this new self-hosted blog running on my Raspberry Pi. I configured Next.js with multi-language support, Tailwind CSS v4, and SQLite managed via Prisma.',
            published: true,
            createdAt: new Date(),
          },
          {
            slug: 'hosting-raspberry-pi',
            titleEs: 'Hospedando en casa con Raspberry Pi y Nginx Proxy Manager',
            titleEn: 'Home hosting with Raspberry Pi and Nginx Proxy Manager',
            contentEs: 'En esta guía explico cómo configurar Nginx Proxy Manager para redirigir tráfico de subdominios y subrutas (como /dev) hacia aplicaciones internas en una red local de forma segura.',
            contentEn: 'In this guide I explain how to configure Nginx Proxy Manager to securely route traffic from subdomains and subpaths (like /dev) to internal applications in a local network.',
            published: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          }
        ]
      });
      // Refetch after seeding
      posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.error('Failed to seed initial posts:', e);
    }
  }

  // Determine other locale for language toggle link
  const otherLocale = locale === 'es' ? 'en' : 'es';

  return (
    <div className="flex flex-col space-y-12">
      {/* Header */}
      <header className="flex justify-between items-baseline border-b border-stone-200 pb-6">
        <div>
          <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            Guillermo Bartual
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

      {/* Posts list */}
      <main className="space-y-10">
        {posts.length === 0 ? (
          <p className="text-stone-500 italic">{t('noPosts')}</p>
        ) : (
          posts.map((post) => {
            const title = locale === 'es' ? post.titleEs : post.titleEn;
            const content = locale === 'es' ? post.contentEs : post.contentEn;
            const formattedDate = new Date(post.createdAt).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <article key={post.id} className="group flex flex-col space-y-3">
                <div className="flex items-center space-x-3 text-xs font-mono text-stone-500">
                  <time dateTime={post.createdAt.toISOString()}>
                    {formattedDate}
                  </time>
                  <span>•</span>
                  <span>
                    {t('views', { count: post.views })}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-stone-950 group-hover:text-accent transition-colors">
                  {title}
                </h2>
                <p className="text-stone-600 leading-relaxed text-sm line-clamp-3">
                  {content}
                </p>
                <div>
                  <span className="text-xs font-semibold text-accent group-hover:text-accent-hover transition-colors inline-flex items-center">
                    {t('readMore')} &rarr;
                  </span>
                </div>
              </article>
            );
          })
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 pt-8 mt-12 text-center text-xs text-stone-500 font-mono">
        <p>© {new Date().getFullYear()} Guillermo Bartual. Hosted on Raspberry Pi.</p>
      </footer>
    </div>
  );
}
