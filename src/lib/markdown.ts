import { Marked } from 'marked';
import Prism from 'prismjs';

// Load Prism components. Note that order can sometimes matter, e.g. markup before others.
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function highlight(code: string, lang?: string): string {
  if (!lang) {
    return escapeHtml(code);
  }

  let prismLang = lang.toLowerCase();
  if (prismLang === 'html' || prismLang === 'xml') {
    prismLang = 'markup';
  } else if (prismLang === 'js') {
    prismLang = 'javascript';
  } else if (prismLang === 'ts') {
    prismLang = 'typescript';
  } else if (prismLang === 'py') {
    prismLang = 'python';
  } else if (prismLang === 'sh') {
    prismLang = 'bash';
  }

  const grammar = Prism.languages[prismLang];
  if (grammar) {
    try {
      return Prism.highlight(code, grammar, prismLang);
    } catch (e) {
      console.error(`Failed to highlight with language ${prismLang}:`, e);
    }
  }

  return escapeHtml(code);
}

interface MarkdownOptions {
  copyLabel: string;
  copiedLabel: string;
  copyFailedLabel: string;
  codeCopiedLabel: string;
  codeCopyFailedLabel: string;
}

export function getReadingTime(content: string): number {
  if (!content) return 0;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function getHtmlFromMarkdown(content: string, options: MarkdownOptions): string {
  const customMarked = new Marked({
    renderer: {
      heading({ text, depth }: { text: string; depth: number }) {
        const cleanText = text.replace(/<[^>]*>/g, '');
        const slug = cleanText
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        return `<h${depth} id="${slug}">${text}</h${depth}>`;
      },
      code({ text, lang }: { text: string; lang?: string }) {
        const cleanLang = lang || 'text';
        const highlighted = highlight(text, cleanLang);
        const encodedCode = encodeURIComponent(text);

        return `
<div class="relative group my-6 border border-stone-200 rounded-lg overflow-hidden bg-stone-900 text-stone-100 shadow-sm transition-all duration-200 hover:shadow-md">
  <div class="flex items-center justify-between px-4 py-2 bg-stone-800 border-b border-stone-800 text-xs font-mono text-stone-400 select-none">
    <span class="flex items-center gap-1.5 uppercase font-semibold text-[10px] tracking-wider text-stone-400">
      <span class="w-1.5 h-1.5 rounded-full bg-stone-500"></span>
      ${cleanLang}
    </span>
    <button
      type="button"
      class="copy-code-btn flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 active:bg-stone-600 transition-all duration-150 text-stone-300 font-sans text-xs hover:text-white cursor-pointer"
      data-code="${encodedCode}"
      data-copied-text="${options.copiedLabel}"
      data-failed-text="${options.copyFailedLabel}"
      data-toast-success="${options.codeCopiedLabel}"
      data-toast-failure="${options.codeCopyFailedLabel}"
    >
      <svg class="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <span class="btn-text">${options.copyLabel}</span>
    </button>
  </div>
  <pre class="p-4 overflow-x-auto text-sm font-mono leading-relaxed !my-0"><code class="language-${cleanLang}">${highlighted}</code></pre>
</div>
`;
      }
    }
  });

  return customMarked.parse(content) as string;
}
