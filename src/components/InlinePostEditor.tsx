'use client';

import { Post } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useState, useTransition, useEffect } from 'react';
import { updateLocalizedPostAction, ActionState } from '@/app/[locale]/actions';
import { getHtmlFromMarkdown, getReadingTime } from '@/lib/markdown';
import { Link } from '@/i18n/routing';
import CodeCopyButtonInitializer from '@/components/CodeCopyButtonInitializer';

interface InlinePostEditorProps {
  post: Post;
  isAdmin: boolean;
  locale: string;
}

export default function InlinePostEditor({ post: initialPost, isAdmin, locale }: InlinePostEditorProps) {
  const t = useTranslations('Blog');
  const tAdmin = useTranslations('Admin');
  const tNav = useTranslations('Navigation');
  const tPort = useTranslations('Portfolio');

  const [post, setPost] = useState<Post>(initialPost);
  const [isEditing, setIsEditing] = useState(false);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 40);

      if (currentScrollY > lastScrollY && currentScrollY > 40) {
        setIsScrollingUp(false);
      } else if (currentScrollY < lastScrollY) {
        setIsScrollingUp(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const otherLocale = locale === 'es' ? 'en' : 'es';
  const formattedDate = new Date(post.createdAt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const copyLabel = t('copy') || 'Copy';
  const copiedLabel = t('copied') || 'Copied!';
  
  const currentTitle = locale === 'es' ? post.titleEs : post.titleEn;
  const currentContent = locale === 'es' ? post.contentEs : post.contentEn;

  // View mode compiled markdown html
  const viewHtml = getHtmlFromMarkdown(currentContent || '', { copyLabel, copiedLabel });

  // Effect to extract headings from the DOM
  useEffect(() => {
    if (isEditing) {
      return;
    }

    // Query headings from DOM inside .markdown-content
    const articleElement = document.querySelector('.markdown-content');
    if (!articleElement) return;

    const headingElements = articleElement.querySelectorAll('h2, h3');
    const extractedHeadings: { id: string; text: string; level: number }[] = [];

    headingElements.forEach((el) => {
      const id = el.id || el.textContent?.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || '';
      if (!el.id && id) {
        el.id = id;
      }
      extractedHeadings.push({
        id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3,
      });
    });
    // Run setHeadings asynchronously to avoid linter warnings regarding cascading renders
    setTimeout(() => {
      setHeadings(extractedHeadings);
    }, 0);
  }, [viewHtml, isEditing]);

  // Scroll-spy effect to highlight current section
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScrollSpy = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
      const scrollPosition = window.scrollY + 200; // Header offset

      let currentActiveId = '';
      for (let i = 0; i < headingElements.length; i++) {
        const el = headingElements[i];
        if (el.offsetTop <= scrollPosition) {
          currentActiveId = el.id;
        } else {
          break;
        }
      }

      if (!currentActiveId && headingElements.length > 0) {
        currentActiveId = headings[0].id;
      }

      setActiveId(currentActiveId);
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();

    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [headings]);

  const scrollToHeading = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const hasSidebar = !isEditing && headings.length > 0;
  const readingTime = getReadingTime(currentContent || '');

  return (
    <div className={`min-h-screen flex flex-col mx-auto px-6 py-12 transition-all duration-300 ${
      isEditing 
        ? 'max-w-7xl w-full' 
        : hasSidebar 
          ? 'max-w-5xl' 
          : 'max-w-3xl'
    }`}>
      <div className="flex flex-col space-y-12">
        {/* Header */}
        <header className={`sticky z-50 flex justify-between items-center transition-all duration-300 ease-in-out ${
          isScrolled
            ? isScrollingUp
              ? 'top-4 py-3 px-6 bg-[#f0efed]/90 backdrop-blur-md border border-stone-200 shadow-md rounded-xl opacity-100 scale-100'
              : 'top-4 py-2 px-4 bg-[#f0efed]/65 backdrop-blur-md border border-stone-200/40 shadow-sm rounded-xl opacity-80 scale-[0.98]'
            : 'top-0 py-0 pb-6 border-b border-stone-200 bg-transparent opacity-100 scale-100'
        }`}>
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
              Gonzalo Bartual
            </Link>
            <p className="text-xs text-stone-500 font-mono mt-1">/dev</p>
          </div>
          <nav className="flex space-x-6 items-center text-sm font-medium">
            <Link href="/" className="text-stone-600 hover:text-accent transition-colors">
              {tNav('home')}
            </Link>
            <Link href="/bartua1" className="text-stone-600 hover:text-accent transition-colors">
              {tNav('portfolio')}
            </Link>
            {!isEditing && (
              <Link
                href={`/posts/${post.slug}`}
                locale={otherLocale}
                className="px-3 py-1 rounded bg-stone-100 hover:bg-stone-200 transition-colors font-mono text-xs text-stone-700"
              >
                {tNav('langToggle')}
              </Link>
            )}
          </nav>
        </header>

        {/* Back button and Quick Edit Action */}
        <div className="flex justify-between items-center">
          <div>
            <Link href="/" className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-accent font-mono transition-colors">
              &larr; {tPort('backToBlog') || 'Volver al Blog'}
            </Link>
          </div>
          {isAdmin && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 rounded-lg bg-stone-900 text-stone-50 font-semibold hover:bg-stone-800 transition-colors text-xs shadow-sm font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {tAdmin('editPost')}
            </button>
          )}
        </div>

        {/* View / Edit Content Layout */}
        {!isEditing ? (
          /* Normal Post Detail View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <article className={`space-y-6 ${hasSidebar ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-mono text-stone-500">
                  <time dateTime={post.createdAt instanceof Date ? post.createdAt.toISOString() : new Date(post.createdAt).toISOString()}>
                    {formattedDate}
                  </time>
                  <span>•</span>
                  <span>{t('readingTime', { minutes: readingTime })}</span>
                  <span>•</span>
                  <span>
                    {t('views', { count: post.views })}
                  </span>
                  <span>•</span>
                  {post.topic.split(',').map((tKey) => {
                    const trimmed = tKey.trim();
                    return (
                      <span key={trimmed} className="px-2 py-0.5 rounded-sm bg-stone-200 text-stone-700 uppercase tracking-wider text-[9px] font-bold font-mono">
                        {t(`topics.${trimmed}`)}
                      </span>
                    );
                  })}
                  {!post.published && (
                    <span className="px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider text-[9px] font-bold font-mono">
                      Draft
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-stone-900 leading-tight">
                  {currentTitle}
                </h1>
              </div>

              {/* Collapsible TOC on mobile/tablet */}
              {hasSidebar && (
                <div className="lg:hidden bg-stone-100/80 border border-stone-200 rounded-xl p-4 my-6">
                  <details className="group">
                    <summary className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-stone-600 font-mono cursor-pointer select-none">
                      <span>{t('tableOfContents')}</span>
                      <span className="transition-transform duration-200 group-open:rotate-180">
                        ▼
                      </span>
                    </summary>
                    <nav className="mt-3 pl-1 space-y-2 border-t border-stone-200/60 pt-3">
                      {headings.map((h) => {
                        const isActive = activeId === h.id;
                        return (
                          <a
                            key={h.id}
                            href={`#${h.id}`}
                            onClick={(e) => scrollToHeading(e, h.id)}
                            className={`block text-xs leading-relaxed transition-all duration-150 hover:text-accent font-medium ${
                              h.level === 3 ? 'pl-4 text-stone-500' : 'text-stone-700'
                            } ${
                              isActive ? 'text-accent! font-semibold' : ''
                            }`}
                          >
                            {h.text}
                          </a>
                        );
                      })}
                    </nav>
                  </details>
                </div>
              )}

              <div className="border-t border-stone-200 pt-6">
                <CodeCopyButtonInitializer />
                <div 
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ __html: viewHtml }}
                />
              </div>
            </article>

            {/* Sidebar TOC on desktop */}
            {hasSidebar && (
              <aside className="hidden lg:block lg:col-span-4 sticky top-32 self-start max-h-[calc(100vh-10rem)] overflow-y-auto pl-4 border-l border-stone-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono mb-4">
                  {t('tableOfContents')}
                </h4>
                <nav className="space-y-2.5">
                  {headings.map((h) => {
                    const isActive = activeId === h.id;
                    return (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        onClick={(e) => scrollToHeading(e, h.id)}
                        className={`block text-xs leading-relaxed transition-all duration-200 hover:text-accent font-medium ${
                          h.level === 3 ? 'pl-4 text-stone-500' : 'text-stone-700'
                        } ${
                          isActive 
                            ? 'text-accent! border-l-2 border-accent pl-2 -ml-[2px] font-semibold' 
                            : 'border-l-2 border-transparent'
                        }`}
                      >
                        {h.text}
                      </a>
                    );
                  })}
                </nav>
              </aside>
            )}
          </div>
        ) : (
          /* Split-screen Editor Form */
          <PostEditorForm
            post={post}
            locale={locale}
            copyLabel={copyLabel}
            copiedLabel={copiedLabel}
            onSave={(updatedPost) => {
              setPost(updatedPost);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            tAdmin={tAdmin}
          />
        )}

        {/* Footer */}
        <footer className="border-t border-stone-200 pt-8 mt-12 text-center text-xs text-stone-500 font-mono">
          <p>© {new Date().getFullYear()} Gonzalo Bartual. Hosted on Raspberry Pi.</p>
        </footer>
      </div>
    </div>
  );
}

interface PostEditorFormProps {
  post: Post;
  locale: string;
  copyLabel: string;
  copiedLabel: string;
  onSave: (post: Post) => void;
  onCancel: () => void;
  tAdmin: (key: string) => string;
}

function PostEditorForm({
  post,
  locale,
  copyLabel,
  copiedLabel,
  onSave,
  onCancel,
  tAdmin,
}: PostEditorFormProps) {
  const initialTitle = locale === 'es' ? post.titleEs : post.titleEn;
  const initialContent = locale === 'es' ? post.contentEs : post.contentEn;

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [password, setPassword] = useState('');
  
  const [actionState, setActionState] = useState<ActionState | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionState(null);

    const formData = new FormData();
    formData.append('id', post.id);
    formData.append('locale', locale);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('password', password);

    startTransition(async () => {
      const res = await updateLocalizedPostAction(null, formData);
      setActionState(res);

      if (res.success) {
        const updatedPost = {
          ...post,
          titleEs: locale === 'es' ? title : post.titleEs,
          contentEs: locale === 'es' ? content : post.contentEs,
          titleEn: locale === 'en' ? title : post.titleEn,
          contentEn: locale === 'en' ? content : post.contentEn,
        };

        setTimeout(() => {
          onSave(updatedPost);
        }, 1500);
      }
    });
  };

  const previewHtml = getHtmlFromMarkdown(content || '', { copyLabel, copiedLabel });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 animate-scale-in">
      {/* Top Toolbar */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between bg-stone-100 p-4 border border-stone-200 rounded-xl gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-600 font-mono bg-stone-200 px-2.5 py-1 rounded">
            {locale.toUpperCase()}
          </span>
          <h2 className="text-sm font-bold text-stone-950 font-mono">
            {tAdmin('editPostCurrentLang')}
          </h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Confirmation Password */}
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tAdmin('password')}
              className="px-3 py-1.5 border border-stone-200 rounded-lg focus:outline-none focus:border-accent text-xs bg-white w-48 font-mono text-stone-900"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-xs shadow-sm transition-colors disabled:opacity-50 font-mono cursor-pointer"
          >
            {isPending ? tAdmin('saving') : tAdmin('save')}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 border border-stone-200 hover:bg-stone-200 bg-white text-stone-700 font-semibold rounded-lg text-xs transition-colors font-mono cursor-pointer"
          >
            {tAdmin('cancel')}
          </button>
        </div>
      </div>

      {/* Error/Success Feedbacks */}
      {actionState && (
        <div className={`p-4 rounded-lg text-sm border font-medium ${
          actionState.success
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800 animate-fade-in'
            : 'bg-rose-50 border-rose-100 text-rose-800 animate-fade-in'
        }`}>
          {actionState.error ? tAdmin(actionState.error) || actionState.error : tAdmin(actionState.message || '')}
        </div>
      )}

      {/* Title Input */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
          {locale === 'es' ? tAdmin('titleEs') : tAdmin('titleEn')} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-accent text-sm font-semibold text-stone-900 bg-white shadow-sm"
          placeholder="Title..."
        />
      </div>

      {/* Split Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Column: Markdown Editor */}
        <div className="flex flex-col space-y-1.5">
          <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
            ✏️ {tAdmin('markdownSource')}
          </label>
          <div className="flex-1 flex flex-col relative border border-stone-200 rounded-lg overflow-hidden bg-stone-50 shadow-inner animate-fade-in">
            {/* Editor Toolbar (Helper buttons) */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-stone-200/60 border-b border-stone-200/80 text-[10px] font-mono text-stone-500 select-none">
              <span className="font-bold text-stone-600 mr-2">Markdown:</span>
              <span className="bg-stone-300/60 px-1 py-0.5 rounded cursor-help" title="Bold text">**bold**</span>
              <span className="bg-stone-300/60 px-1 py-0.5 rounded cursor-help" title="Italic text">*italic*</span>
              <span className="bg-stone-300/60 px-1 py-0.5 rounded cursor-help" title="Heading Level 2">## H2</span>
              <span className="bg-stone-300/60 px-1 py-0.5 rounded cursor-help" title="Links">[text](url)</span>
              <span className="bg-stone-300/60 px-1 py-0.5 rounded cursor-help" title="Code Block">```lang ... ```</span>
            </div>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[50vh] lg:h-[65vh] p-4 font-mono text-sm leading-relaxed text-stone-800 bg-stone-50/50 focus:outline-none resize-y"
              placeholder="Write your markdown here..."
            />
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="flex flex-col space-y-1.5">
          <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
            👁️ {tAdmin('preview')}
          </label>
          <div className="w-full min-h-[50vh] lg:h-[65vh] overflow-y-auto border border-stone-200 rounded-lg p-6 bg-white shadow-sm animate-fade-in">
            {/* Preview Title */}
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-stone-900 leading-tight mb-6 border-b border-stone-100 pb-4">
              {title || <span className="text-stone-300 italic">Untitled</span>}
            </h1>

            {/* Rendered HTML */}
            <CodeCopyButtonInitializer />
            <div 
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
