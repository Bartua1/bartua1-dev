'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { whitelistIpAction, ActionState } from '@/app/[locale]/actions';

interface AdminWhitelistFormProps {
  isAdmin: boolean;
  translations: {
    adminRouteTitle: string;
    currentIp: string;
    enterPasswordToWhitelist: string;
    whitelistSuccess: string;
    whitelistButton: string;
    ipAlreadyWhitelisted: string;
    password: string;
    errorPassword: string;
    errorEmptyFields: string;
  };
}

export default function AdminWhitelistForm({ isAdmin, translations }: AdminWhitelistFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [actionState, setActionState] = useState<ActionState | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionState(null);

    const formData = new FormData();
    formData.append('password', password);

    startTransition(async () => {
      const res = await whitelistIpAction(null, formData);
      setActionState(res);
      if (res.success) {
        // Clear password
        setPassword('');
        // Redirect to homepage after a short delay
        setTimeout(() => {
          router.replace('/');
          router.refresh();
        }, 1500);
      }
    });
  };

  if (isAdmin) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 text-center space-y-4 animate-scale-in">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-emerald-800">
          {translations.ipAlreadyWhitelisted}
        </p>
        <button
          onClick={() => router.replace('/')}
          className="mt-2 text-xs font-semibold text-stone-600 hover:text-stone-900 underline transition-colors"
        >
          Ir al Inicio →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
          {translations.password}
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-accent text-sm"
          disabled={isPending}
        />
      </div>

      {actionState && (
        <div className={`p-3 rounded-lg text-sm border font-medium ${
          actionState.success
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {actionState.success
            ? translations.whitelistSuccess
            : (translations[actionState.error as keyof typeof translations] || actionState.error)}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 px-4 rounded-lg bg-stone-900 text-stone-50 font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          translations.whitelistButton
        )}
      </button>
    </form>
  );
}
