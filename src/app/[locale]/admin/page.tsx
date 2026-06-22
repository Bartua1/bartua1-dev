import { checkIsAdmin } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import AdminWhitelistForm from './AdminWhitelistForm';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = ['es', 'en'].includes(rawLocale) ? rawLocale : 'es';
  const t = await getTranslations('Admin');
  const tNav = await getTranslations('Navigation');

  const { isAdmin, clientIp } = await checkIsAdmin();

  // Translations object to pass to the client component
  const translations = {
    adminRouteTitle: t('adminRouteTitle'),
    currentIp: t('currentIp'),
    enterPasswordToWhitelist: t('enterPasswordToWhitelist'),
    whitelistSuccess: t('whitelistSuccess'),
    whitelistButton: t('whitelistButton'),
    ipAlreadyWhitelisted: t('ipAlreadyWhitelisted'),
    password: t('password'),
    errorPassword: t('errorPassword'),
    errorEmptyFields: t('errorEmptyFields'),
  };

  const otherLocale = locale === 'es' ? 'en' : 'es';

  return (
    <div className="min-h-screen flex flex-col max-w-xl mx-auto px-6 py-12 justify-center">
      <div className="flex flex-col space-y-8 bg-white border border-stone-200 p-8 rounded-xl shadow-sm">
        {/* Header */}
        <header className="flex justify-between items-baseline border-b border-stone-100 pb-4">
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity text-stone-900">
              Gonzalo Bartual
            </Link>
            <p className="text-xs text-stone-500 font-mono mt-0.5">/dev/admin</p>
          </div>
          <nav className="flex space-x-4 items-center text-xs font-medium">
            <Link href="/" className="text-stone-600 hover:text-accent transition-colors">
              {tNav('home')}
            </Link>
            <Link
              href="/admin"
              locale={otherLocale}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 transition-colors font-mono text-[10px] text-stone-700"
            >
              {tNav('langToggle')}
            </Link>
          </nav>
        </header>

        {/* Content */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              {translations.adminRouteTitle}
            </h1>
            <p className="text-sm text-stone-500">
              {translations.currentIp} <span className="font-mono bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded font-semibold text-xs">{clientIp}</span>
            </p>
          </div>

          <AdminWhitelistForm
            isAdmin={isAdmin}
            translations={translations}
          />
        </div>
      </div>
    </div>
  );
}
