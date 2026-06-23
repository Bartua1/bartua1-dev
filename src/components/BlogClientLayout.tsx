'use client';

import { Post } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useState, useTransition } from 'react';
import { createPostAction, updatePostAction, deletePostAction, ActionState } from '@/app/[locale]/actions';
import { getReadingTime } from '@/lib/markdown';

interface BlogClientLayoutProps {
  posts: Post[];
  isAdmin: boolean;
  locale: string;
}

const TOPICS = [
  'phone-development',
  'home-labbing',
  'ai-projects',
  '3d-printing',
  'others'
] as const;

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/[*_`~]/g, '') // Remove formatting markers (bold, italic, code)
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert markdown links to plain text
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '') // Remove markdown images
    .replace(/^\s*[-*+]\s+/gm, '') // Remove bullet prefixes
    .replace(/^\s*\d+\.\s+/gm, '') // Remove list numbers
    .replace(/>\s+/g, '') // Remove blockquote markers
    .replace(/\n+/g, ' ') // Flatten newlines to spaces
    .trim();
}

export default function BlogClientLayout({ posts: initialPosts, isAdmin, locale }: BlogClientLayoutProps) {
  const t = useTranslations('Blog');
  const tAdmin = useTranslations('Admin');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicsFilter, setSelectedTopicsFilter] = useState<typeof TOPICS[number][]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Admin panel state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  // Form fields state
  const [titleEs, setTitleEs] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<typeof TOPICS[number][]>(['others']);
  const [contentEs, setContentEs] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [published, setPublished] = useState(true);
  const [password, setPassword] = useState('');

  // Delete modal state
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  // Action status state
  const [actionState, setActionState] = useState<ActionState | null>(null);
  const [isPending, startTransition] = useTransition();

  // Reset form helper
  const handleResetForm = () => {
    setTitleEs('');
    setTitleEn('');
    setSlug('');
    setIsSlugManual(false);
    setSelectedTopics(['others']);
    setContentEs('');
    setContentEn('');
    setPublished(true);
    setPassword('');
    setEditingPost(null);
    setActionState(null);
  };

  // Trigger form on edit clicked
  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setTitleEs(post.titleEs);
    setTitleEn(post.titleEn);
    setSlug(post.slug);
    setIsSlugManual(true);
    setSelectedTopics(post.topic.split(',').map(t => t.trim() as typeof TOPICS[number]));
    setContentEs(post.contentEs);
    setContentEn(post.contentEn);
    setPublished(post.published);
    setPassword('');
    setActionState(null);
    setIsFormOpen(true);
    
    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto-generate slug when Spanish Title changes, if slug is not manually set
  const handleTitleEsChange = (val: string) => {
    setTitleEs(val);
    if (!isSlugManual) {
      setSlug(slugify(val));
    }
  };

  // Submit action handler
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActionState(null);

    const formData = new FormData();
    if (editingPost) {
      formData.append('id', editingPost.id);
    }
    formData.append('titleEs', titleEs);
    formData.append('titleEn', titleEn);
    formData.append('slug', slug);
    formData.append('contentEs', contentEs);
    formData.append('contentEn', contentEn);
    formData.append('topic', selectedTopics.join(','));
    formData.append('published', published ? 'true' : 'false');
    formData.append('password', password);

    startTransition(async () => {
      let res: ActionState;
      if (editingPost) {
        res = await updatePostAction(null, formData);
      } else {
        res = await createPostAction(null, formData);
      }

      setActionState(res);
      if (res.success) {
        setTimeout(() => {
          handleResetForm();
          setIsFormOpen(false);
        }, 1500);
      }
    });
  };

  // Delete action handler
  const handleDeleteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!deletingPost) return;

    const formData = new FormData();
    formData.append('id', deletingPost.id);
    formData.append('password', deletePassword);

    startTransition(async () => {
      const res = await deletePostAction(null, formData);
      setActionState(res);
      if (res.success) {
        setTimeout(() => {
          setDeletingPost(null);
          setDeletePassword('');
          setActionState(null);
        }, 1500);
      }
    });
  };

  // Filter posts based on search query and active topic filters
  const filteredPosts = initialPosts.filter(post => {
    // 1. Admin/published check
    if (!post.published && !isAdmin) return false;

    // 2. Topic check (multi-tag filter)
    const postTopics = post.topic.split(',').map(t => t.trim());
    if (selectedTopicsFilter.length > 0) {
      const hasMatchingTopic = postTopics.some(t => selectedTopicsFilter.includes(t as typeof TOPICS[number]));
      if (!hasMatchingTopic) return false;
    }

    // 3. Search query check
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const title = (locale === 'es' ? post.titleEs : post.titleEn).toLowerCase();
      const content = (locale === 'es' ? post.contentEs : post.contentEn).toLowerCase();
      const matchesTitle = title.includes(query);
      const matchesContent = content.includes(query);
      const matchesTopic = postTopics.some(t => t.toLowerCase().includes(query) || t.replace('-', ' ').toLowerCase().includes(query));
      if (!matchesTitle && !matchesContent && !matchesTopic) return false;
    }

    return true;
  });

  // Organize posts by topic
  const postsByTopic = TOPICS.reduce((acc, topic) => {
    acc[topic] = filteredPosts.filter(post => {
      const postTopics = post.topic.split(',').map(t => t.trim());
      return postTopics.includes(topic);
    });
    return acc;
  }, {} as Record<typeof TOPICS[number], typeof initialPosts>);

  const isFiltering = searchQuery.trim() !== '' || selectedTopicsFilter.length > 0;
  const hasAnyMatches = Object.values(postsByTopic).some(list => list.length > 0);

  return (
    <main className="flex-1 space-y-12">
      {/* Admin Quick Options */}
      {isAdmin && (
        <div className="flex justify-between items-center bg-stone-100 rounded-lg p-4 border border-stone-200">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
            ⚡ {tAdmin('adminPanel')}
          </span>
          <button
            onClick={() => {
              if (isFormOpen) {
                handleResetForm();
              }
              setIsFormOpen(!isFormOpen);
            }}
            className="px-4 py-1.5 rounded-lg bg-stone-900 text-stone-50 font-semibold hover:bg-stone-800 transition-colors text-sm shadow-sm"
          >
            {isFormOpen ? tAdmin('cancel') : editingPost ? tAdmin('editPost') : tAdmin('newPost')}
          </button>
        </div>
      )}

      {/* Admin Edit/Create Form Container */}
      {isAdmin && isFormOpen && (
        <div className="bg-stone-50 rounded-xl p-6 border border-stone-200 shadow-sm animate-scale-in space-y-6">
          <h2 className="text-lg font-bold text-stone-950 font-mono">
            {editingPost ? tAdmin('editPost') : tAdmin('newPost')}
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Title (Spanish) & English Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                  {tAdmin('titleEs')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={titleEs}
                  onChange={(e) => handleTitleEsChange(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-accent text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                  {tAdmin('titleEn')}
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-accent text-sm"
                />
              </div>
            </div>

            {/* Slug & Topic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                  {tAdmin('slug')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    const rawVal = e.target.value;
                    const converted = rawVal
                      .replace(/\s+/g, '-')
                      .replace(/[^a-zA-Z0-9\-]/g, '')
                      .replace(/\-\-+/g, '-');
                    setSlug(converted.toLowerCase());
                    setIsSlugManual(true);
                  }}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-accent text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                  {tAdmin('topic')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 border border-stone-200 rounded-lg p-3 bg-white">
                  {TOPICS.map((tKey) => {
                    const isChecked = selectedTopics.includes(tKey);
                    return (
                      <label key={tKey} className="flex items-center space-x-2.5 text-sm text-stone-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              const filtered = selectedTopics.filter(x => x !== tKey);
                              setSelectedTopics(filtered.length === 0 ? ['others'] : filtered);
                            } else {
                              setSelectedTopics([...selectedTopics, tKey]);
                            }
                          }}
                          className="h-4.5 w-4.5 rounded border-stone-300 text-accent focus:ring-accent accent-accent cursor-pointer"
                        />
                        <span className="font-medium text-stone-600 hover:text-stone-900 transition-colors">
                          {t(`topics.${tKey}`)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content (Spanish) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                {tAdmin('contentEs')} <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={8}
                value={contentEs}
                onChange={(e) => setContentEs(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-accent text-sm font-mono"
              />
            </div>

            {/* Content (English) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                {tAdmin('contentEn')}
              </label>
              <textarea
                rows={8}
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-accent text-sm font-mono"
              />
            </div>

            {/* Published checkbox & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="flex items-center space-x-3 py-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-stone-300 text-accent focus:ring-accent accent-accent"
                />
                <label htmlFor="published" className="text-sm font-medium text-stone-700">
                  {tAdmin('published')}
                </label>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                  {tAdmin('password')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tAdmin('password')}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-accent text-sm"
                />
              </div>
            </div>

            {/* Action State Feedback */}
            {actionState && (
              <div className={`p-4 rounded-lg text-sm border font-medium ${
                actionState.success
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  : 'bg-rose-50 border-rose-100 text-rose-800'
              }`}>
                {actionState.error ? tAdmin(actionState.error) || actionState.error : tAdmin(actionState.message || '')}
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg text-sm shadow-sm transition-colors disabled:opacity-50"
              >
                {isPending ? tAdmin('saving') : tAdmin('save')}
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="px-5 py-2 border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold rounded-lg text-sm transition-colors"
              >
                {tAdmin('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isAdmin && deletingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 max-w-md w-full shadow-lg space-y-4 animate-scale-in">
            <h3 className="text-lg font-bold text-stone-950 font-mono">
              ⚠️ {tAdmin('deletePost')}
            </h3>
            <p className="text-sm text-stone-600">
              {tAdmin('confirmDelete')}
            </p>
            <p className="text-sm font-semibold text-stone-900 font-mono italic">
              &ldquo;{locale === 'es' ? deletingPost.titleEs : deletingPost.titleEn}&rdquo;
            </p>

            <form onSubmit={handleDeleteSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                  {tAdmin('password')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder={tAdmin('password')}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-accent text-sm"
                />
              </div>

              {actionState && (
                <div className={`p-3 rounded-lg text-xs border font-medium ${
                  actionState.success
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                    : 'bg-rose-50 border-rose-100 text-rose-800'
                }`}>
                  {actionState.error ? tAdmin(actionState.error) || actionState.error : tAdmin(actionState.message || '')}
                </div>
              )}

              <div className="flex space-x-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setDeletingPost(null);
                    setDeletePassword('');
                    setActionState(null);
                  }}
                  className="px-4 py-2 border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold rounded-lg text-sm transition-colors"
                >
                  {tAdmin('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {isPending ? tAdmin('deleting') : tAdmin('deletePost')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Tag Filters */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3 mt-4">
        {/* Category Links */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono">
          {TOPICS.map((topic) => {
            const isSelected = selectedTopicsFilter.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopicsFilter((prev) =>
                    isSelected ? prev.filter((x) => x !== topic) : [...prev, topic]
                  );
                }}
                className={`transition-all duration-200 cursor-pointer pb-1 border-b-2 font-bold tracking-wide uppercase ${
                  isSelected
                    ? 'text-accent border-accent'
                    : 'text-stone-400 hover:text-stone-800 border-transparent'
                }`}
              >
                {t(`topics.${topic}`)}
              </button>
            );
          })}
          {selectedTopicsFilter.length > 0 && (
            <button
              onClick={() => setSelectedTopicsFilter([])}
              className="text-stone-400 hover:text-stone-700 transition-colors font-mono cursor-pointer uppercase pb-1 border-b-2 border-transparent font-bold"
            >
              ({t('resetFilters')})
            </button>
          )}
        </div>

        {/* Search Toggle */}
        <div className="flex items-center space-x-2">
          <div className={`relative flex items-center transition-all duration-300 ease-in-out ${
            isSearchOpen ? 'w-48 opacity-100' : 'w-0 opacity-0 pointer-events-none'
          }`}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-transparent border-b border-stone-300 focus:border-accent pb-1 text-sm focus:outline-none pr-6 font-mono text-stone-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (isSearchOpen) {
                setSearchQuery('');
              }
            }}
            className={`p-1 text-stone-400 hover:text-accent transition-colors cursor-pointer ${
              isSearchOpen ? 'text-accent' : ''
            }`}
            aria-label="Search"
          >
            <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Posts Lists organized by Topic */}
      <div className="space-y-16">
        {hasAnyMatches ? (
          TOPICS.map((topic) => {
            const topicPosts = postsByTopic[topic] || [];
            if (isFiltering && topicPosts.length === 0) return null;
            return (
              <section key={topic} className="space-y-6">
                {/* Section Header */}
                <div className="flex justify-between items-baseline border-b border-stone-200 pb-2">
                  <h2 className="text-xs font-bold tracking-wider text-stone-400 uppercase font-mono">
                    {t(`topics.${topic}`)}
                  </h2>
                  <span className="text-xs text-stone-400 font-mono">({topicPosts.length})</span>
                </div>

                {/* Post List */}
                <div className="space-y-10">
                  {topicPosts.length === 0 ? (
                    <p className="text-stone-400 text-xs italic font-mono pl-1">
                      {t('topics.noPostsInTopic')}
                    </p>
                  ) : (
                    topicPosts.map((post) => {
                      const title = locale === 'es' ? post.titleEs : post.titleEn;
                      const content = locale === 'es' ? post.contentEs : post.contentEn;
                      const formattedDate = new Date(post.createdAt).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                      const readingTime = getReadingTime(content);

                      return (
                        <article key={post.id} className="group flex flex-col space-y-3 pl-1 border-l-2 border-transparent hover:border-accent/40 transition-all duration-200">
                          <div className="flex items-center justify-between flex-wrap gap-2">
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
                                const isSelected = selectedTopicsFilter.includes(trimmed as typeof TOPICS[number]);
                                return (
                                  <button
                                    key={trimmed}
                                    onClick={() => {
                                      setSelectedTopicsFilter((prev) =>
                                        isSelected ? prev.filter((x) => x !== trimmed) : [...prev, trimmed as typeof TOPICS[number]]
                                      );
                                    }}
                                    className={`px-2 py-0.5 rounded-sm uppercase tracking-wider text-[9px] font-bold font-mono transition-all duration-200 hover:scale-105 cursor-pointer ${
                                      isSelected ? 'bg-accent text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                                    }`}
                                  >
                                    {t(`topics.${trimmed}`)}
                                  </button>
                                );
                              })}
                              {!post.published && (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 border border-amber-200 uppercase font-semibold">
                                  Draft
                                </span>
                              )}
                            </div>

                            {/* Admin Controls next to the post */}
                            {isAdmin && (
                              <div className="flex space-x-2 text-xs font-mono">
                                <button
                                  onClick={() => handleEditClick(post)}
                                  className="text-stone-500 hover:text-accent font-semibold transition-colors"
                                >
                                  {tAdmin('save') ? 'Edit' : 'Editar'}
                                </button>
                                <span className="text-stone-300">|</span>
                                <button
                                  onClick={() => setDeletingPost(post)}
                                  className="text-stone-500 hover:text-rose-600 font-semibold transition-colors"
                                >
                                  {tAdmin('deletePost') ? 'Delete' : 'Eliminar'}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Post Link */}
                          <Link href={`/posts/${post.slug}`} className="block group/title">
                            <h3 className="text-xl font-bold text-stone-950 group-hover/title:text-accent transition-colors">
                              {title}
                            </h3>
                          </Link>

                          <p className="text-stone-600 leading-relaxed text-sm line-clamp-3">
                            {stripMarkdown(content)}
                          </p>

                          <div>
                            <Link
                              href={`/posts/${post.slug}`}
                              className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors inline-flex items-center"
                            >
                              {t('readMore')} &rarr;
                            </Link>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })
        ) : (
          <div className="text-center py-12 bg-stone-50 border border-stone-200 rounded-xl space-y-4 font-mono">
            <p className="text-sm text-stone-500">{t('noMatchingPosts')}</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTopicsFilter([]);
              }}
              className="px-4 py-2 text-xs bg-stone-900 text-stone-50 font-semibold rounded-lg hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
            >
              {t('resetFilters')}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
