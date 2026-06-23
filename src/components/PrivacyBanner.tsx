'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function PrivacyBanner() {
  const t = useTranslations('Privacy');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Read cookie directly on mount to avoid hydration mismatch
    const checkConsent = () => {
      const cookies = document.cookie.split(';');
      const hasCookie = cookies.some((c) => c.trim().startsWith('privacy-consent='));
      if (!hasCookie) {
        // Show banner if no consent choice is saved yet
        setIsVisible(true);
      }
    };
    checkConsent();
  }, []);

  const handleChoice = (accepted: boolean) => {
    // Set cookie for 1 year (31536000 seconds)
    const value = accepted ? 'true' : 'false';
    document.cookie = `privacy-consent=${value}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Hide the banner with animation
    setIsVisible(false);

    // Refresh current route to trigger server tracking with the new consent value
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] animate-fade-in-up">
      <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold tracking-tight font-mono text-stone-900 flex items-center gap-1.5">
            🛡️ {t('title')}
          </h4>
          <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
            {t('text')}
          </p>
        </div>
        <div className="flex gap-4 items-center justify-end font-mono text-xs">
          <button
            onClick={() => handleChoice(false)}
            className="px-3 py-1.5 font-medium text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
          >
            {t('decline')}
          </button>
          <button
            onClick={() => handleChoice(true)}
            className="px-4.5 py-2 font-bold bg-stone-900 hover:bg-stone-850 text-stone-50 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
