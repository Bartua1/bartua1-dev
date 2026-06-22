import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

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

function IconBrain() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.544-4.668 2.5 2.5 0 0 1-.046-4.886A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.544-4.668 2.5 2.5 0 0 0 .046-4.886A2.5 2.5 0 0 0 14.5 2Z" />
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

function IconGear() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconApple() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function IconAndroid() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.523 15.341A7.954 7.954 0 0 0 20 9.8C20 5.472 16.418 2 12 2S4 5.472 4 9.8a7.954 7.954 0 0 0 2.477 5.541L5 17.648C4.38 18.602 5.09 19.8 6.21 19.8H17.79c1.12 0 1.83-1.198 1.21-2.152l-1.477-2.307zM8.5 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PortfolioPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations('Portfolio');
  const tNav = await getTranslations('Navigation');

  const otherLocale = locale === 'es' ? 'en' : 'es';
  const linkedinUrl = process.env.LINKEDIN_PROFILE ?? 'https://linkedin.com';
  const githubUrl = process.env.GITHUB_PROFILE ?? 'https://github.com';

  const companies = [
    { name: 'Grupo Azvi', src: '/dev/assets/Grupo_Azvi_Logo.png' },
    { name: 'Turify', src: '/dev/assets/turify.png' },
    { name: 'Fidetia', src: '/dev/assets/fidetia.jpg' },
    { name: 'Fius', src: '/dev/assets/fius.jpg' },
  ];

  const services = [
    { icon: <IconBrain />, title: t('serviceAI'), desc: t('serviceAIDesc') },
    { icon: <IconCode />, title: t('serviceBackend'), desc: t('serviceBackendDesc') },
    { icon: <IconMobile />, title: t('serviceApp'), desc: t('serviceAppDesc') },
    { icon: <IconGear />, title: t('serviceAuto'), desc: t('serviceAutoDesc') },
  ];

  return (
    <div className="min-h-screen bg-[#ebebea] py-8 px-4 sm:py-12 sm:px-8 font-sans">
      {/* ── Outer card ── */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm overflow-hidden">

        {/* ── Top bar ── */}
        <header className="flex justify-between items-center px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-stone-500 hover:text-stone-800 transition-colors duration-200 font-mono border border-stone-200 rounded-full px-3 py-1 hover:border-stone-400"
            >
              ← {tNav('home')}
            </Link>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-stone-500 hover:text-stone-900 transition-colors duration-200 flex items-center gap-1.5">
              <IconLinkedIn /> LinkedIn
            </a>
            <span className="text-stone-200">|</span>
            <a href={githubUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-stone-500 hover:text-stone-900 transition-colors duration-200 flex items-center gap-1.5">
              <IconGitHub /> GitHub
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
          {/* Avatar */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-stone-200 shadow-md">
              <Image
                src="/dev/assets/professionalphoto.jpg"
                alt="Gonzalo Bartual"
                width={80}
                height={80}
                className="object-cover w-full h-full"
                priority
                unoptimized
              />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-emerald-400 w-4 h-4 rounded-full border-2 border-white" aria-label="Available" />
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight max-w-sm">
            {t('heroLine1')} <span className="text-stone-900">{t('heroLine2')}</span>
          </h1>

          <p className="mt-4 text-sm text-stone-500 leading-relaxed max-w-xs">
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
        <section className="border-b border-stone-100">
          {/* Heading area */}
          <div className="px-10 pt-12 pb-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 leading-snug max-w-md mx-auto">
              {t('collaborateTitle')}
            </h2>
          </div>

          {/* Floating pill divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-stone-200" />
            <span className="relative z-10 bg-white border border-stone-200 shadow-sm text-xs font-semibold text-stone-600 px-5 py-2 rounded-full">
              {t('servicesLabel')}
            </span>
          </div>

          {/* 4-column service list */}
          <div className="grid grid-cols-2 sm:grid-cols-4 px-8 py-8 gap-6">
            {services.map((s) => (
              <div key={s.title} className="flex flex-col gap-2">
                <div className="text-stone-400">{s.icon}</div>
                <p className="text-sm font-bold text-stone-900 leading-tight">{s.title}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Education ── */}
        <section className="border-b border-stone-100">
          {/* Heading area */}
          <div className="px-10 pt-10 pb-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 leading-snug max-w-md mx-auto">
              {t('educationTitle')}
            </h2>
          </div>

          {/* Floating pill divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-stone-200" />
            <span className="relative z-10 bg-white border border-stone-200 shadow-sm text-xs font-semibold text-stone-600 px-5 py-2 rounded-full">
              {t('education')}
            </span>
          </div>

          {/* 2-column university list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 px-8 py-8 gap-6">
            {/* UAX */}
            <div className="flex flex-col gap-3">
              <div className="relative h-10 w-32 grayscale opacity-60">
                <Image
                  src="/dev/assets/universidad_UAX.png"
                  alt="Universidad Alfonso X el Sabio"
                  fill
                  className="object-contain object-left"
                  unoptimized
                />
              </div>
              <p className="text-sm font-bold text-stone-900 leading-tight">{t('degreeAI')}</p>
              <p className="text-xs text-stone-500">{t('universityUAX')}</p>
            </div>
            {/* US */}
            <div className="flex flex-col gap-3">
              <div className="relative h-10 w-32 grayscale opacity-60">
                <Image
                  src="/dev/assets/universidad_US.png"
                  alt="Universidad de Sevilla"
                  fill
                  className="object-contain object-left"
                  unoptimized
                />
              </div>
              <p className="text-sm font-bold text-stone-900 leading-tight">{t('degreeCS')}</p>
              <p className="text-xs text-stone-500">{t('universityUS')}</p>
            </div>
          </div>
        </section>

        {/* ── Projects ── */}
        <section className="px-8 py-8 border-b border-stone-100">
          <h2 className="text-[0.65rem] font-mono uppercase tracking-widest text-stone-400 mb-5">
            {t('projects')}
          </h2>
          <div className="rounded-2xl bg-stone-50 border border-stone-100 hover:bg-stone-100 transition-colors duration-200 group overflow-hidden">
            {/* Card header with logo */}
            <div className="flex items-start gap-4 p-5 pb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shadow-sm">
                <Image
                  src="/dev/assets/Foodie.png"
                  alt="FoodieDot"
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-600 transition-colors duration-200">FoodieDot</h3>
                  <span className="text-[0.6rem] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Live</span>
                </div>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">{t('foodiedotDesc')}</p>
              </div>
            </div>
            {/* Footer row */}
            <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-3 border-t border-stone-200/70 bg-white/50">
              <span className="text-[0.65rem] font-mono text-stone-400">{t('foodiedotTech')}</span>
              <div className="flex gap-2 flex-wrap">
                <a href="https://foodiedot.com"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 hover:border-stone-400 text-[0.65rem] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200">
                  <IconArrow /> {t('webVersion')}
                </a>
                <a href="https://apps.apple.com/es/app/foodie-dot-diario-culinario/id6761205862"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-700 text-white text-[0.65rem] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200">
                  <IconApple /> {t('appStore')}
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.foodiedot.app"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-700 text-white text-[0.65rem] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200">
                  <IconAndroid /> {t('playStore')}
                </a>
              </div>
            </div>
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
