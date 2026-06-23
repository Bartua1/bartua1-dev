'use client';

import { Post } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useState, useTransition, useEffect, useRef } from 'react';
import { updateLocalizedPostAction, ActionState } from '@/app/[locale]/actions';
import { getHtmlFromMarkdown, getReadingTime } from '@/lib/markdown';
import { Link } from '@/i18n/routing';
import CodeCopyButtonInitializer from '@/components/CodeCopyButtonInitializer';
import { copyTextToClipboard } from '@/lib/clipboard';

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
  const [showShareToast, setShowShareToast] = useState(false);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

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
  const copyFailedLabel = t('copyFailed') || 'Failed';
  const codeCopiedLabel = t('codeCopied') || 'Code copied to clipboard!';
  const codeCopyFailedLabel = t('codeCopyFailed') || 'Failed to copy code!';
  
  const currentTitle = locale === 'es' ? post.titleEs : post.titleEn;
  const currentContent = locale === 'es' ? post.contentEs : post.contentEn;

  // View mode compiled markdown html
  const viewHtml = getHtmlFromMarkdown(currentContent || '', {
    copyLabel,
    copiedLabel,
    copyFailedLabel,
    codeCopiedLabel,
    codeCopyFailedLabel,
  });

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

  // Share toast timer effect
  useEffect(() => {
    if (showShareToast) {
      const timer = setTimeout(() => setShowShareToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showShareToast]);

  // Image lightbox click listener effect
  useEffect(() => {
    if (isEditing) return;

    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        setActiveLightboxImg((target as HTMLImageElement).src);
      }
    };

    const articleElement = document.querySelector('.markdown-content');
    if (articleElement) {
      articleElement.addEventListener('click', handleImageClick);
    }

    return () => {
      if (articleElement) {
        articleElement.removeEventListener('click', handleImageClick);
      }
    };
  }, [viewHtml, isEditing]);

  // Lightbox keyboard listener (ESC to close)
  useEffect(() => {
    if (!activeLightboxImg) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightboxImg(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxImg]);

  const handleShare = async () => {
    const shareData = {
      title: currentTitle,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // ignore
      }
    } else {
      try {
        const success = await copyTextToClipboard(window.location.href);
        if (success) {
          setShowShareToast(true);
        }
      } catch (err) {
        console.error('Could not copy link:', err);
      }
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
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1 hover:text-accent transition-colors cursor-pointer"
                    title={t('share')}
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 10.742L15.316 7.38M8.684 13.258l6.632 3.316m-1.057-6.574a3 3 0 11-6 0 3 3 0 016 0zm6 8a3 3 0 11-6 0 3 3 0 016 0zM12 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{t('share')}</span>
                  </button>
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
            copyFailedLabel={copyFailedLabel}
            codeCopiedLabel={codeCopiedLabel}
            codeCopyFailedLabel={codeCopyFailedLabel}
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

      {/* Share copied toast */}
      {showShareToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-stone-100 text-xs font-mono px-4 py-2.5 rounded-lg shadow-lg border border-stone-850 flex items-center gap-2 animate-fade-in-up">
          <svg className="w-4 h-4 text-emerald-400 stroke-current fill-none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>{t('linkCopied')}</span>
        </div>
      )}

      {/* Image Lightbox overlays */}
      {activeLightboxImg && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md cursor-zoom-out animate-fade-in"
          onClick={() => setActiveLightboxImg(null)}
        >
          <button 
            className="absolute top-6 right-6 text-stone-400 hover:text-stone-100 transition-colors p-2 bg-stone-900/50 hover:bg-stone-900 rounded-full cursor-pointer"
            onClick={() => setActiveLightboxImg(null)}
          >
            <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div 
            className="relative max-w-full max-h-full select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={activeLightboxImg} 
              alt="Zoomed view" 
              className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl border border-stone-850 object-contain animate-scale-in"
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface PostEditorFormProps {
  post: Post;
  locale: string;
  copyLabel: string;
  copiedLabel: string;
  copyFailedLabel: string;
  codeCopiedLabel: string;
  codeCopyFailedLabel: string;
  onSave: (post: Post) => void;
  onCancel: () => void;
  tAdmin: (key: string) => string;
}

function PostEditorForm({
  post,
  locale,
  copyLabel,
  copiedLabel,
  copyFailedLabel,
  codeCopiedLabel,
  codeCopyFailedLabel,
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

  // Image library & uploader states
  const [isImageLibOpen, setIsImageLibOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchImages = async () => {
    try {
      const res = await fetch('/dev/api/admin/upload');
      const data = await res.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (err) {
      console.error('Failed to fetch images:', err);
    }
  };

  useEffect(() => {
    if (isImageLibOpen) {
      const timer = setTimeout(() => {
        fetchImages();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isImageLibOpen]);

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    const newVal = currentVal.substring(0, start) + textToInsert + currentVal.substring(end);
    setContent(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatusText('uploading');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/dev/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadStatusText('uploadSuccess');
        fetchImages();
        insertAtCursor(`![${file.name.split('.')[0]}](` + data.url + ')');
        setTimeout(() => {
          setIsImageLibOpen(false);
          setUploadStatusText('');
        }, 1000);
      } else {
        setUploadStatusText('uploadError');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatusText('uploadError');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFileDirectly = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/dev/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        insertAtCursor(`![${file.name.split('.')[0]}](` + data.url + ')');
      }
    } catch (err) {
      console.error('Direct upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextareaPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const item = e.clipboardData.items[0];
    if (item?.type.indexOf('image') === 0) {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) {
        await uploadFileDirectly(file);
      }
    }
  };

  const handleTextareaDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.indexOf('image') === 0) {
      e.preventDefault();
      await uploadFileDirectly(file);
    }
  };

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

  const previewHtml = getHtmlFromMarkdown(content || '', {
    copyLabel,
    copiedLabel,
    copyFailedLabel,
    codeCopiedLabel,
    codeCopyFailedLabel,
  });

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
        <div className="flex flex-col space-y-1.5 relative">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
              ✏️ {tAdmin('markdownSource')}
            </label>
            <button
              type="button"
              onClick={() => setIsImageLibOpen(!isImageLibOpen)}
              className="text-xs font-bold font-mono text-stone-500 hover:text-accent flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              📷 {tAdmin('images')}
            </button>
          </div>
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
              ref={textareaRef}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handleTextareaPaste}
              onDrop={handleTextareaDrop}
              className="w-full min-h-[50vh] lg:h-[65vh] p-4 font-mono text-sm leading-relaxed text-stone-800 bg-stone-50/50 focus:outline-none resize-y"
              placeholder="Write your markdown here..."
            />

            {/* Absolute Image Library Panel inside Editor Area */}
            {isImageLibOpen && (
              <div className="absolute inset-0 bg-white/98 z-35 flex flex-col p-6 animate-scale-in border-l border-stone-200">
                <div className="flex justify-between items-center pb-4 border-b border-stone-200 mb-4">
                  <h3 className="text-sm font-bold font-mono text-stone-900 flex items-center gap-2">
                    📷 {tAdmin('images')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsImageLibOpen(false)}
                    className="text-stone-400 hover:text-stone-700 transition-colors p-1 bg-stone-100 hover:bg-stone-200 rounded-full cursor-pointer"
                  >
                    <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Upload Image Section */}
                <div className="mb-6">
                  <label className="relative border-2 border-dashed border-stone-300 hover:border-accent rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 bg-stone-50/50 hover:bg-stone-50">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    <svg className="w-8 h-8 text-stone-400 stroke-current fill-none mb-2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-stone-600">
                      {isUploading 
                        ? tAdmin(uploadStatusText || 'uploading') 
                        : tAdmin('dragDropOrClick')}
                    </span>
                  </label>
                  {uploadStatusText && !isUploading && (
                    <p className={`text-xs mt-2 font-semibold ${
                      uploadStatusText === 'uploadSuccess' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {tAdmin(uploadStatusText)}
                    </p>
                  )}
                </div>

                {/* Image List Scrollable Grid */}
                <div className="flex-1 overflow-y-auto pr-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono mb-3">
                    {tAdmin('insertImage')} ({images.length})
                  </h4>
                  {images.length === 0 ? (
                    <p className="text-xs text-stone-400 italic font-mono py-8 text-center bg-stone-50 rounded-lg">
                      No images uploaded yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {images.map((imgUrl) => {
                        const filename = imgUrl.split('/').pop() || 'image';
                        const cleanName = filename.replace(/^image_\d+_/, '').split('.')[0];
                        return (
                          <button
                            key={imgUrl}
                            type="button"
                            onClick={() => {
                              insertAtCursor(`![${cleanName}](${imgUrl})`);
                              setIsImageLibOpen(false);
                            }}
                            className="group relative aspect-video rounded-lg overflow-hidden border border-stone-200 hover:border-accent bg-stone-100 hover:shadow-xs transition-all duration-200 cursor-pointer"
                            title={`Click to insert: ${filename}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={cleanName}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                              <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                                Insert
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
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
