'use client';

import { useEffect } from 'react';
import { copyTextToClipboard } from '@/lib/clipboard';

function showToast(message: string, isError: boolean = false) {
  if (typeof document === 'undefined') return;

  // Remove existing toast if any, to avoid stacking overlaps
  const existingToast = document.getElementById('code-copy-toast');
  if (existingToast && document.body.contains(existingToast)) {
    document.body.removeChild(existingToast);
  }

  // Create toast container
  const toast = document.createElement('div');
  toast.id = 'code-copy-toast';
  toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-stone-100 text-xs font-mono px-4 py-2.5 rounded-lg shadow-lg border border-stone-800 flex items-center gap-2 animate-fade-in-up';
  
  // Create SVG icon
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', `w-4 h-4 ${isError ? 'text-rose-400' : 'text-emerald-400'} stroke-current fill-none`);
  svg.setAttribute('viewBox', '0 0 24 24');
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', '2.5');
  if (isError) {
    path.setAttribute('d', 'M6 18L18 6M6 6l12 12');
  } else {
    path.setAttribute('d', 'M5 13l4 4L19 7');
  }
  svg.appendChild(path);
  
  // Create span for text
  const span = document.createElement('span');
  span.textContent = message;
  
  toast.appendChild(svg);
  toast.appendChild(span);
  
  document.body.appendChild(toast);
  
  // Remove after 2 seconds
  setTimeout(() => {
    toast.classList.remove('animate-fade-in-up');
    toast.classList.add('transition-opacity', 'duration-300', 'opacity-0');
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 2000);
}

export default function CodeCopyButtonInitializer() {
  useEffect(() => {
    const handleCopy = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('.copy-code-btn') as HTMLButtonElement | null;
      if (!button) return;

      const encodedCode = button.getAttribute('data-code');
      const copiedText = button.getAttribute('data-copied-text') || 'Copied!';
      const failedText = button.getAttribute('data-failed-text') || 'Failed';
      const toastSuccessText = button.getAttribute('data-toast-success') || 'Code copied to clipboard!';
      const toastFailureText = button.getAttribute('data-toast-failure') || 'Failed to copy code';
      const btnTextSpan = button.querySelector('.btn-text');
      const originalText = btnTextSpan?.textContent || 'Copy';

      if (!encodedCode) return;

      try {
        const code = decodeURIComponent(encodedCode);
        const success = await copyTextToClipboard(code);

        if (btnTextSpan) {
          btnTextSpan.textContent = success ? copiedText : failedText;
        }

        button.classList.remove('bg-stone-800', 'text-stone-300');
        if (success) {
          button.classList.add('!bg-emerald-700', '!text-white');
          showToast(toastSuccessText, false);
        } else {
          button.classList.add('!bg-rose-700', '!text-white');
          showToast(toastFailureText, true);
        }

        setTimeout(() => {
          if (btnTextSpan) {
            btnTextSpan.textContent = originalText;
          }
          button.classList.remove('!bg-emerald-700', '!text-white', '!bg-rose-700');
          button.classList.add('bg-stone-800', 'text-stone-300');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code block contents:', err);
        showToast(toastFailureText, true);
      }
    };

    document.addEventListener('click', handleCopy);
    return () => {
      document.removeEventListener('click', handleCopy);
    };
  }, []);

  return null;
}

