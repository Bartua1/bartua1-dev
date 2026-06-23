# 🌓 Dark Mode Implementation Plan

This document outlines the design and integration plan for implementing a system-preferred and manually toggled **Dark Mode** on the blog.

---

## 🎨 Design System Override

Since this project uses **Tailwind CSS v4** and defines its theme tokens as CSS variables in `src/app/globals.css`, adding dark mode support is extremely clean. We simply override the CSS custom properties inside a `.dark` class block.

### 1. Stylesheet Changes (`src/app/globals.css`)
Modify the variables at the top of the file to include the dark theme definitions:

```css
:root {
  --background: #faf9f6;   /* Off-white warm tone */
  --foreground: #1c1917;   /* Soft black/stone-900 */
  --muted: #78716c;        /* stone-500 */
  --border: #e7e5e4;       /* stone-200 */
  --accent: #d97706;       /* amber-600 */
  --accent-hover: #b45309; /* amber-700 */
}

/* Add the dark class selector */
.dark {
  --background: #0c0a09;   /* stone-950 */
  --foreground: #f5f5f4;   /* stone-100 */
  --muted: #a8a29e;        /* stone-400 */
  --border: #292524;       /* stone-800 */
  --accent: #f59e0b;       /* amber-500 */
  --accent-hover: #fbbf24; /* amber-400 */
}
```

We will also want to make sure markdown paragraph/header styling behaves correctly in dark mode:
```css
/* Update markdown-content colors to use variables or adjust classes */
.markdown-content p {
  color: var(--muted); /* Instead of hardcoded #374151 */
}
.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  color: var(--foreground); /* Instead of hardcoded #0c0a09 */
}
.markdown-content code {
  background-color: color-mix(in srgb, var(--foreground) 6%, transparent);
  color: var(--accent);
}
```

---

## ⚙️ Theme Selection Logic

To avoid the infamous "flash of light theme" (FOUC) when a dark-mode user reloads the page, we should:
1. Read the theme from `localStorage` or check system preference (`prefers-color-scheme: dark`) immediately during page render.
2. Inject a blocking script tag at the top of our `layout.tsx` file inside `<head>` to add the `.dark` class to `<html>` if needed.

### 1. Blocking HTML Script (to place in `layout.tsx`)
```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      })()
    `,
  }}
/>
```

---

## 🕹️ Theme Switcher Component

Here is a proposed implementation for the client-side `ThemeToggle.tsx` component:

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Determine active theme on mount
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        // Sun Icon
        <svg className="w-5 h-5 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        // Moon Icon
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
```

---

## 📋 Integration Checklist
- [ ] Add the CSS variables override block to `globals.css` and update hardcoded typography colors.
- [ ] Inject the blocking initialization script into `src/app/[locale]/layout.tsx`.
- [ ] Create the `ThemeToggle.tsx` component in `src/components`.
- [ ] Add the `ThemeToggle` to the main navigation header (e.g. next to the language switcher).
- [ ] Verify that dark mode variables look cohesive on both the blog and portfolio pages.
