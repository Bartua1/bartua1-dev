import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import '../globals.css';

export function generateMetadata() {
  return {
    title: "Guillermo Bartual | bartua1-dev",
    description: "Personal blog and developer portfolio.",
  };
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  // Ensure that the incoming locale is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Provide messages to the client components
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen flex flex-col max-w-3xl mx-auto px-6 py-12">
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
