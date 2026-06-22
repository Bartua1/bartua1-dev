import prisma from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const TOPICS = [
  'phone-development',
  'home-labbing',
  'ai-projects',
  '3d-printing',
  'others'
] as const;

const SEED_BASE_DATE = new Date();
const SEED_DATES = {
  now: SEED_BASE_DATE,
  oneDayAgo: new Date(SEED_BASE_DATE.getTime() - 24 * 60 * 60 * 1000),
  twoDaysAgo: new Date(SEED_BASE_DATE.getTime() - 2 * 24 * 60 * 60 * 1000),
  threeDaysAgo: new Date(SEED_BASE_DATE.getTime() - 3 * 24 * 60 * 60 * 1000),
  fourDaysAgo: new Date(SEED_BASE_DATE.getTime() - 4 * 24 * 60 * 60 * 1000),
};

export default async function BlogPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = ['es', 'en'].includes(rawLocale) ? rawLocale : 'es';
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
            createdAt: SEED_DATES.now,
            topic: 'others'
          },
          {
            slug: 'hosting-raspberry-pi',
            titleEs: 'Hospedando en casa con Raspberry Pi y Nginx Proxy Manager',
            titleEn: 'Home hosting with Raspberry Pi and Nginx Proxy Manager',
            contentEs: 'En esta guía explico cómo configurar Nginx Proxy Manager para redirigir tráfico de subdominios y subrutas (como /dev) hacia aplicaciones internas en una red local de forma segura.',
            contentEn: 'In this guide I explain how to configure Nginx Proxy Manager to securely route traffic from subdomains and subpaths (like /dev) to internal applications in a local network.',
            published: true,
            createdAt: SEED_DATES.oneDayAgo,
            topic: 'home-labbing'
          },
          {
            slug: 'mobile-apps-capacitor',
            titleEs: 'Desarrollo de Apps con Capacitor y Android Studio',
            titleEn: 'App Development with Capacitor and Android Studio',
            contentEs: 'Cómo configurar un entorno de desarrollo eficiente para compilar aplicaciones móviles híbridas utilizando Capacitor y desplegarlas en dispositivos físicos.',
            contentEn: 'How to set up an efficient development environment to compile hybrid mobile applications using Capacitor and deploy them to physical devices.',
            published: true,
            createdAt: SEED_DATES.twoDaysAgo,
            topic: 'phone-development'
          },
          {
            slug: 'local-llm-ollama',
            titleEs: 'Integrando Modelos de Lenguaje Localmente con Ollama',
            titleEn: 'Integrating Language Models Locally with Ollama',
            contentEs: 'Una guía paso a paso para ejecutar modelos de inteligencia artificial como Llama 3 en tu propio hardware utilizando Ollama y consumiendo su API en Next.js.',
            contentEn: 'A step-by-step guide to running artificial intelligence models like Llama 3 on your own hardware using Ollama and consuming its API in Next.js.',
            published: true,
            createdAt: SEED_DATES.threeDaysAgo,
            topic: 'ai-projects'
          },
          {
            slug: '3d-print-first-layer',
            titleEs: 'Calibración de la Primera Capa en Impresoras 3D FDM',
            titleEn: 'First Layer Calibration in FDM 3D Printers',
            contentEs: 'Consejos prácticos para lograr una adherencia perfecta en la primera capa de tus impresiones 3D, resolviendo problemas de warping y nivelación de la cama.',
            contentEn: 'Practical tips to achieve perfect first-layer adhesion in your 3D prints, solving warping issues and bed leveling.',
            published: true,
            createdAt: SEED_DATES.fourDaysAgo,
            topic: '3d-printing'
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

  // Group posts by topic
  const postsByTopic = TOPICS.reduce((acc, topic) => {
    acc[topic] = posts.filter(post => post.topic === topic);
    return acc;
  }, {} as Record<typeof TOPICS[number], typeof posts>);

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

      {/* Posts list organized by topic */}
      <main className="space-y-16">
        {TOPICS.map((topic) => {
          const topicPosts = postsByTopic[topic];
          return (
            <section key={topic} className="space-y-6">
              <div className="flex justify-between items-baseline border-b border-stone-200 pb-2">
                <h2 className="text-xs font-bold tracking-wider text-stone-400 uppercase font-mono">
                  {t(`topics.${topic}`)}
                </h2>
                <span className="text-xs text-stone-400 font-mono">({topicPosts.length})</span>
              </div>
              <div className="space-y-10">
                {topicPosts.length === 0 ? (
                  <p className="text-stone-400 text-xs italic font-mono pl-1">
                    {t('topics.noPostsInTopic')}
                  </p>
                ) : (
                  topicPosts.map((post) => {
                    const title = locale === 'es' ? post.titleEs : post.titleEn;
                    const content = locale === 'es' ? post.contentEs : post.contentEn;
                    const formattedDate = new Date(post.createdAt).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });

                    return (
                      <article key={post.id} className="group flex flex-col space-y-3 pl-1">
                        <div className="flex items-center space-x-3 text-xs font-mono text-stone-500">
                          <time dateTime={post.createdAt.toISOString()}>
                            {formattedDate}
                          </time>
                          <span>•</span>
                          <span>
                            {t('views', { count: post.views })}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-stone-950 group-hover:text-accent transition-colors">
                          {title}
                        </h3>
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
              </div>
            </section>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 pt-8 mt-12 text-center text-xs text-stone-500 font-mono">
        <p>© {new Date().getFullYear()} Gonzalo Bartual. Hosted on Raspberry Pi.</p>
      </footer>
    </div>
    </div>
  );
}
