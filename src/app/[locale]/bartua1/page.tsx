import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import ScreenshotShowcase from './ScreenshotShowcase';
import { trackVisit } from '@/lib/analytics';

interface PageProps {
  params: Promise<{ locale: string }>;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconLinkedIn() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  );
}

function IconSparkles() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5 5 3Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconMobile() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function IconWorkflow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="9" y="15" width="6" height="6" rx="1" />
      <path d="M6 9v3a2 2 0 0 0 2 2h1" />
      <path d="M18 9v3a2 2 0 0 1-2 2h-1" />
    </svg>
  );
}



// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PortfolioPage({ params }: PageProps) {
  const { locale } = await params;

  // Track page visit
  await trackVisit('/bartua1');

  const t = await getTranslations('Portfolio');
  const tNav = await getTranslations('Navigation');

  const otherLocale = locale === 'es' ? 'en' : 'es';
  const linkedinUrl = process.env.LINKEDIN_PROFILE ?? 'https://linkedin.com';
  const githubUrl = process.env.GITHUB_PROFILE ?? 'https://github.com';

  const companies = [
    { name: 'Grupo Azvi', src: '/dev/assets/Grupo_Azvi_Logo.png' },
    { name: 'Turify', src: '/dev/assets/turify.png' },
    { name: 'Fidetia', src: '/dev/assets/fidetia.png' },
    { name: 'Fius', src: '/dev/assets/fius.png' },
  ];

  const services = [
    { icon: <IconSparkles />, title: t('serviceAI'), desc: t('serviceAIDesc'), tags: ['RAG', 'Copilot', 'PyTorch', '...'] },
    { icon: <IconCode />, title: t('serviceBackend'), desc: t('serviceBackendDesc'), tags: ['Node', 'React', 'Supabase', 'SQL', '...'] },
    { icon: <IconMobile />, title: t('serviceApp'), desc: t('serviceAppDesc'), tags: ['Capacitor', 'Swift', 'React Native', '...'] },
    { icon: <IconWorkflow />, title: t('serviceAuto'), desc: t('serviceAutoDesc'), tags: ['Hermes', 'OpenClaw', 'Power Automate', 'UiPath'] },
  ];

  return (
    <div className="min-h-screen bg-[#ebebea] py-8 px-4 sm:py-12 sm:px-8 font-sans bg-grain overflow-hidden">
      {/* ── Outer card ── */}
      <div className="relative z-10 max-w-3xl lg:max-w-5xl mx-auto bg-white rounded-3xl shadow-sm overflow-hidden transition-all duration-300">

        {/* ── Top bar ── */}
        <header className="flex justify-between items-center px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-stone-500 hover:text-stone-800 transition-colors duration-200 font-mono border border-stone-200 rounded-full px-2.5 py-1 sm:px-3 hover:border-stone-400"
            >
              <span className="sm:hidden">←</span>
              <span className="hidden sm:inline">← {tNav('home')}</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-stone-500 hover:text-stone-900 transition-colors duration-200 flex items-center gap-1.5"
              title="LinkedIn">
              <IconLinkedIn />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
            <span className="text-stone-200">|</span>
            <a href={githubUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-stone-500 hover:text-stone-900 transition-colors duration-200 flex items-center gap-1.5"
              title="GitHub">
              <IconGitHub />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <span className="text-stone-200">|</span>
            <Link
              href="/bartua1"
              locale={otherLocale}
              className="text-xs font-mono bg-stone-100 hover:bg-stone-200 text-stone-600 px-3 py-1 rounded-full transition-colors duration-200"
            >
              {tNav('langToggle')}
            </Link>
          </nav>
        </header>

        {/* ── Hero ── */}
        <section className="px-8 pt-12 pb-10 flex flex-col items-center text-center border-b border-stone-100">
          {/* Avatar & Name/Profession */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 text-center sm:text-left">
            <div className="w-40 h-40 rounded-full overflow-hidden ring-2 ring-stone-200 shadow-md flex-shrink-0">
              <Image
                src="/dev/assets/professionalphoto.jpg"
                alt={t('title')}
                width={160}
                height={160}
                className="object-cover w-full h-full"
                priority
                unoptimized
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {t('title')}
              </h2>
              <p className="text-sm font-semibold uppercase tracking-wider text-stone-500 mt-1 font-mono">
                {t('profession')}
              </p>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight max-w-sm sm:max-w-md lg:max-w-xl">
            {t('heroLine1')} <span className="text-stone-900">{t('heroLine2')}</span>
          </h1>

          <p className="mt-4 text-sm text-stone-500 leading-relaxed max-w-xs sm:max-w-sm lg:max-w-md">
            {t('heroSub')}
          </p>

          {/* CTA */}
          <a
            href={`mailto:gonzalo.bartual.fernandez2@gmail.com`}
            className="mt-6 inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            {t('contactCta')} <IconArrow />
          </a>
        </section>

        {/* ── Company logos ── */}
        <section className="px-8 py-8 border-b border-stone-100">
          <p className="text-[0.65rem] font-mono uppercase tracking-widest text-stone-400 text-center mb-6">
            {t('companiesLabel')}
          </p>
          <div className="flex items-center justify-around gap-6 flex-wrap">
            {companies.map((c) => (
              <div key={c.name} className="relative h-8 w-24 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
                <Image
                  src={c.src}
                  alt={c.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Collaborate / Services ── */}
        <section className="px-8 py-8 border-b border-stone-100">
          <h2 className="text-[0.65rem] font-mono uppercase tracking-widest text-stone-400 mb-5">
            {t('servicesLabel')}
          </h2>

          {/* 4-column service list */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {services.map((s) => (
              <div key={s.title} className="flex flex-col gap-3 group">
                <div className="text-stone-400 group-hover:text-stone-600 transition-colors duration-200">
                  {s.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900 leading-tight">{s.title}</p>
                  <p className="text-xs text-stone-500 leading-relaxed mt-1">{s.desc}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.6rem] font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-100/70 border border-stone-200/50 text-stone-600 hover:bg-stone-200/60 hover:text-stone-800 transition-colors duration-200 cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Education ── */}
        <section className="px-8 py-8 border-b border-stone-100">
          <h2 className="text-[0.65rem] font-mono uppercase tracking-widest text-stone-400 mb-5">
            {t('education')}
          </h2>

          {/* 2-column university list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* UAX */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-300 group">
              <div className="relative h-10 w-32 grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300 flex-shrink-0">
                <Image
                  src="/dev/assets/universidad_UAX.png"
                  alt="Universidad Alfonso X el Sabio"
                  fill
                  className="object-contain object-left"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900 leading-tight">{t('degreeAI')}</p>
                <p className="text-xs text-stone-500 mt-1">{t('universityUAX')}</p>
              </div>
            </div>
            {/* US */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-300 group">
              <div className="relative h-10 w-32 grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300 flex-shrink-0">
                <Image
                  src="/dev/assets/universidad_US.png"
                  alt="Universidad de Sevilla"
                  fill
                  className="object-contain object-left"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900 leading-tight">{t('degreeCS')}</p>
                <p className="text-xs text-stone-500 mt-1">{t('universityUS')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Projects ── */}
        <section className="px-8 py-8 border-b border-stone-100">
          <h2 className="text-[0.65rem] font-mono uppercase tracking-widest text-stone-400 mb-6">
            {t('projects')}
          </h2>

          <div className="rounded-3xl bg-stone-50/50 border border-stone-100 p-6 sm:p-8 hover:bg-stone-50 transition-colors duration-300">
            <ScreenshotShowcase
              tTitle={t('foodiedotTitle')}
              tDesc={t('foodiedotDesc')}
              tTech={t('foodiedotTech')}
              tFeature1={t('foodiedotFeature1')}
              tFeature2={t('foodiedotFeature2')}
              tFeature3={t('foodiedotFeature3')}
              tWebVersion={t('webVersion')}
              tAppStore={t('appStore')}
              tPlayStore={t('playStore')}
            />
          </div>
        </section>

        {/* ── Contact CTA ── */}
        <section className="px-8 py-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mb-5 text-stone-600">
            <IconMail />
          </div>
          <h2 className="text-xl font-bold text-stone-900 max-w-xs leading-tight">
            {t('ctaTitle')}
          </h2>
          <div className="flex gap-3 mt-6 flex-wrap justify-center">
            <a
              href="mailto:gonzalo.bartual.fernandez2@gmail.com"
              className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <IconMail /> {t('emailMe')}
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-700 text-sm font-semibold px-5 py-2.5 rounded-full border border-stone-200 hover:border-stone-400 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <IconLinkedIn /> LinkedIn
            </a>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="px-8 py-4 border-t border-stone-100 text-center text-[0.65rem] font-mono text-stone-400">
          © {new Date().getFullYear()} Gonzalo Bartual · Hosted on Raspberry Pi
        </footer>

      </div>
    </div>
  );
}
