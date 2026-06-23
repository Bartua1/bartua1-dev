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
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-50 animate-fade-in-up">
      <div className="bg-stone-900/95 backdrop-blur-md border border-stone-800 text-stone-100 p-5 rounded-2xl shadow-xl flex flex-col space-y-4">
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold tracking-tight font-mono text-amber-500 flex items-center gap-1.5">
            🛡️ {t('title')}
          </h4>
          <p className="text-xs text-stone-300 leading-relaxed">
            {t('text')}
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => handleChoice(false)}
            className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 hover:text-stone-100 hover:bg-stone-850 rounded-lg transition-colors font-mono cursor-pointer"
          >
            {t('decline')}
          </button>
          <button
            onClick={() => handleChoice(true)}
            className="px-4 py-1.5 text-[11px] font-bold bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors shadow-sm font-mono cursor-pointer"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
