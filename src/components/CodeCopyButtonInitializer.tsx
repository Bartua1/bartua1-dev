'use client';

import { useEffect } from 'react';

export default function CodeCopyButtonInitializer() {
  useEffect(() => {
    const handleCopy = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('.copy-code-btn') as HTMLButtonElement | null;
      if (!button) return;

      const encodedCode = button.getAttribute('data-code');
      const copiedText = button.getAttribute('data-copied-text') || 'Copied!';
      const btnTextSpan = button.querySelector('.btn-text');
      const originalText = btnTextSpan?.textContent || 'Copy';

      if (encodedCode) {
        try {
          const code = decodeURIComponent(encodedCode);
          await navigator.clipboard.writeText(code);

          if (btnTextSpan) {
            btnTextSpan.textContent = copiedText;
          }
          button.classList.add('!bg-emerald-700', '!text-white');
          button.classList.remove('bg-stone-800', 'text-stone-300');

          setTimeout(() => {
            if (btnTextSpan) {
              btnTextSpan.textContent = originalText;
            }
            button.classList.remove('!bg-emerald-700', '!text-white');
            button.classList.add('bg-stone-800', 'text-stone-300');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy code block contents:', err);
        }
      }
    };

    document.addEventListener('click', handleCopy);
    return () => {
      document.removeEventListener('click', handleCopy);
    };
  }, []);

  return null;
}
