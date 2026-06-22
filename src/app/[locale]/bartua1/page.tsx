import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PortfolioPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations('Portfolio');
  const tNav = await getTranslations('Navigation');

  const otherLocale = locale === 'es' ? 'en' : 'es';

  // Hardcoded data with localization support for simplicity & reliability
  const skillsList = [
    { category: 'Languages', items: ['TypeScript/JavaScript', 'Python', 'Go', 'SQL', 'HTML/CSS'] },
    { category: 'Frameworks/Libraries', items: ['Next.js', 'React', 'Node.js/Express', 'FastAPI', 'Tailwind CSS'] },
    { category: 'DevOps & Cloud', items: ['Docker', 'Nginx Proxy Manager', 'Git/GitHub Actions', 'Linux/Bash', 'Raspberry Pi hosting'] },
    { category: 'Databases', items: ['SQLite', 'Prisma ORM', 'PostgreSQL', 'MongoDB'] }
  ];

  const experiences = locale === 'es' ? [
    {
      role: 'Ingeniero de Software / DevOps',
      company: 'Freelance & Proyectos Personales',
      period: '2024 - Presente',
      description: 'Diseño e implementación de arquitecturas web ligeras y servicios autohospedados. Automatización de pipelines de CI/CD mediante GitHub Actions y despliegues en servidores Linux de bajo consumo.'
    },
    {
      role: 'Desarrollador Backend Junior',
      company: 'Tech Solutions S.L.',
      period: '2022 - 2024',
      description: 'Desarrollo y mantenimiento de APIs RESTful usando Node.js y Python. Integración y modelado de bases de datos utilizando Prisma y PostgreSQL, mejorando el rendimiento de las consultas en un 20%.'
    }
  ] : [
    {
      role: 'Software Engineer / DevOps',
      company: 'Freelance & Personal Projects',
      period: '2024 - Present',
      description: 'Designing and implementing lightweight web architectures and self-hosted services. Automating CI/CD pipelines via GitHub Actions and deploying onto low-power Linux servers.'
    },
    {
      role: 'Junior Backend Developer',
      company: 'Tech Solutions S.L.',
      period: '2022 - 2024',
      description: 'Developing and maintaining RESTful APIs using Node.js and Python. Integrating and modeling databases utilizing Prisma and PostgreSQL, resulting in a 20% query performance improvement.'
    }
  ];

  const educations = locale === 'es' ? [
    {
      degree: 'Grado en Ingeniería Informática',
      institution: 'Universidad Politécnica',
      period: '2018 - 2022'
    }
  ] : [
    {
      degree: 'Bachelor of Science in Computer Engineering',
      institution: 'Polytechnic University',
      period: '2018 - 2022'
    }
  ];

  return (
    <div className="flex flex-col space-y-12">
      {/* Header */}
      <header className="flex justify-between items-baseline border-b border-stone-200 pb-6">
        <div>
          <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            Guillermo Bartual
          </Link>
          <p className="text-xs text-stone-500 font-mono mt-1">/dev/bartua1</p>
        </div>
        <nav className="flex space-x-6 items-center text-sm font-medium">
          <Link href="/" className="text-stone-600 hover:text-accent transition-colors">
            {tNav('home')}
          </Link>
          <Link
            href="/bartua1"
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
        <p className="text-lg font-medium text-stone-700 font-mono">
          {t('subtitle')}
        </p>
        <p className="text-stone-600 leading-relaxed max-w-2xl">
          {t('description')}
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {/* Left column - Content */}
        <main className="md:col-span-2 space-y-10">
          {/* Experience */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              {t('experience')}
            </h2>
            <div className="space-y-8">
              {experiences.map((exp, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-stone-200">
                  <div className="absolute w-3 h-3 bg-accent rounded-full -left-[7px] top-1.5" />
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-baseline">
                    <h3 className="text-base font-bold text-stone-950">
                      {exp.role}
                    </h3>
                    <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-stone-700 mt-0.5">{exp.company}</p>
                  <p className="text-stone-600 text-sm leading-relaxed mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
              {t('education')}
            </h2>
            <div className="space-y-6">
              {educations.map((edu, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-baseline">
                  <div>
                    <h3 className="text-base font-bold text-stone-950">{edu.degree}</h3>
                    <p className="text-sm text-stone-600">{edu.institution}</p>
                  </div>
                  <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded mt-1 sm:mt-0">
                    {edu.period}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Right column - Skills */}
        <aside className="space-y-6">
          <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2">
            {t('skills')}
          </h2>
          <div className="space-y-6">
            {skillsList.map((skillGroup, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider font-mono">
                  {skillGroup.category}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {skillGroup.items.map((item, itemIdx) => (
                    <span
                      key={itemIdx}
                      className="px-2 py-1 rounded bg-stone-100 text-stone-800 text-xs border border-stone-200 hover:border-accent hover:bg-stone-50 transition-colors"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 font-mono space-y-4 sm:space-y-0">
        <Link href="/" className="text-accent hover:text-accent-hover font-semibold transition-colors">
          &larr; {t('backToBlog')}
        </Link>
        <p>© {new Date().getFullYear()} Guillermo Bartual. Hosted on Raspberry Pi.</p>
      </footer>
    </div>
  );
}
