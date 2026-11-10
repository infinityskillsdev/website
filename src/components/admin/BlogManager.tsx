import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

interface BlogPost {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  author: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [currentPost, setCurrentPost] = useState<BlogPost>({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop',
    category: 'Technology',
    author: 'Infinity Team',
    status: 'published',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    noindex: false,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/blog/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    }
  };

  const handleCreateNew = () => {
    setCurrentPost({
      slug: '',
      title: '',
      excerpt: '',
      content: '## Write your article in Markdown here...\n\nShare deep insights, code snippets, or architectural thoughts.',
      coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop',
      category: 'Technology',
      author: 'Infinity Team',
      status: 'published',
      metaTitle: '',
      metaDescription: '',
      canonicalUrl: '',
      noindex: false,
    });
    setIsEditing(true);
    setEditorTab('write');
  };

  const handleEdit = (post: BlogPost) => {
    setCurrentPost({ ...post });
    setIsEditing(true);
    setEditorTab('write');
  };

  const handleDelete = async (id: number | undefined, title: string) => {
    if (!id) return;
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Article deleted successfully.');
        fetchPosts();
        if (currentPost.id === id) {
          setIsEditing(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSlugify = () => {
    const s = currentPost.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
    setCurrentPost({ ...currentPost, slug: s });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost.title || !currentPost.content) {
      alert('Title and Content are required.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPost),
      });

      if (res.ok) {
        showToast('Article saved & published successfully!');
        setIsEditing(false);
        fetchPosts();
      } else {
        const err = await res.json();
        alert('Failed: ' + (err.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Live SERP computations
  const previewTitle = currentPost.metaTitle || currentPost.title || 'Article Title';
  const previewDesc = currentPost.metaDescription || currentPost.excerpt || 'Article summary preview...';
  const previewSlug = currentPost.slug || 'article-slug';

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div class="w-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-500 text-slate-950 font-semibold px-4 py-3 rounded-xl shadow-2xl animate-bounce">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {!isEditing ? (
        /* LIST VIEW */
        <div class="space-y-6">
          {/* Top Bar: Search & New Post Button */}
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div class="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search posts by title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <svg class="w-4 h-4 text-slate-500 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button
              onClick={handleCreateNew}
              class="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>+</span>
              <span>Create New Article</span>
            </button>
          </div>

          {/* Posts Table / Cards */}
          <div class="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            {filteredPosts.length === 0 ? (
              <div class="p-12 text-center text-slate-500 text-sm">
                No articles found. Click "Create New Article" to write your first post!
              </div>
            ) : (
              <div class="divide-y divide-slate-800">
                {filteredPosts.map((post) => (
                  <div key={post.id} class="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/60 transition-colors">
                    <div class="flex items-start gap-4">
                      <img
                        src={post.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop'}
                        alt={post.title}
                        class="w-16 h-16 rounded-xl object-cover bg-slate-800 flex-shrink-0 border border-slate-800"
                      />
                      <div>
                        <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span
                            class={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              post.status === 'published'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {post.status}
                          </span>
                          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {post.category}
                          </span>
                          <span class="text-slate-500 text-xs font-mono">/blog/{post.slug}</span>
                        </div>

                        <h3 class="text-base font-bold text-white hover:text-indigo-400 transition-colors">
                          {post.title}
                        </h3>

                        <p class="text-xs text-slate-400 line-clamp-1 mt-1 max-w-2xl">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-3 self-end sm:self-center">
                      {post.status === 'published' && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1"
                        >
                          <span>Live</span>
                          <span>↗</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(post)}
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* EDITOR MODE (Create / Edit) */
        <form onSubmit={handleSave} class="space-y-8">
          {/* Editor Header Navigation */}
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              class="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
            >
              ← Back to All Articles
            </button>

            <div class="flex items-center gap-3">
              <select
                value={currentPost.status}
                onChange={(e) => setCurrentPost({ ...currentPost, status: e.target.value as any })}
                class="bg-slate-900 border border-slate-800 text-xs font-bold rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500"
              >
                <option value="published">🟢 Published (Live)</option>
                <option value="draft">🟡 Draft (Hidden)</option>
              </select>

              <button
                type="submit"
                disabled={isSaving}
                class="px-6 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : '💾 Save & Publish'}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Post Details & Markdown Editor */}
            <div class="lg:col-span-8 space-y-6">
              {/* Title & Slug */}
              <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Article Title <span class="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentPost.title}
                    onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                    placeholder="e.g. Why Islands Architecture Revolutionizes PageSpeed"
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div class="flex items-center gap-2">
                  <div class="flex-1">
                    <label class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      URL Slug: <span class="font-mono text-indigo-400">/blog/{currentPost.slug || 'your-slug'}</span>
                    </label>
                    <input
                      type="text"
                      value={currentPost.slug}
                      onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                      placeholder="custom-url-slug"
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSlugify}
                    class="mt-5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                  >
                    Auto-Generate
                  </button>
                </div>
              </div>

              {/* Category, Author, Cover Image */}
              <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={currentPost.category}
                      onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                      placeholder="e.g. SEO, Performance, Engineering"
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">Author</label>
                    <input
                      type="text"
                      value={currentPost.author}
                      onChange={(e) => setCurrentPost({ ...currentPost, author: e.target.value })}
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">Cover Image URL</label>
                    <input
                      type="text"
                      value={currentPost.coverImage || ''}
                      onChange={(e) => setCurrentPost({ ...currentPost, coverImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Short Excerpt (Cards & Fallback Description)</label>
                  <textarea
                    rows={2}
                    value={currentPost.excerpt}
                    onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                    placeholder="Brief 1-2 sentence teaser for this article..."
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300"
                    required
                  />
                </div>
              </div>

              {/* Markdown Content Editor / Preview Switcher */}
              <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditorTab('write')}
                      class={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        editorTab === 'write' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ✏️ Markdown Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      class={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        editorTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      👁️ Live Rendered Preview
                    </button>
                  </div>
                  <span class="text-[11px] text-slate-500 font-mono">Supports GitHub Flavored Markdown</span>
                </div>

                {editorTab === 'write' ? (
                  <textarea
                    rows={16}
                    value={currentPost.content}
                    onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                    placeholder="Write article using Markdown..."
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                ) : (
                  <div
                    class="prose prose-invert max-w-none p-6 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm leading-relaxed overflow-x-auto min-h-[380px]"
                    dangerouslySetInnerHTML={{ __html: marked.parse(currentPost.content || '*No content yet.*') as string }}
                  />
                )}
              </div>
            </div>

            {/* Right Column: On-Page SEO Engine for this Article */}
            <div class="lg:col-span-4 space-y-6">
              <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 sticky top-24 space-y-5">
                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400">Article SEO Controls</h4>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    Auto-Indexed
                  </span>
                </div>

                {/* Live Google Search Preview for this Article */}
                <div class="bg-white rounded-xl p-3.5 text-left shadow-md font-sans border border-slate-200">
                  <div class="flex items-center gap-1.5 text-[11px] text-slate-700 mb-1">
                    <span class="text-[10px]">🌐</span>
                    <span class="text-slate-800 font-medium">Infinity Blog</span>
                    <span class="text-slate-400">› blog › {previewSlug}</span>
                  </div>
                  <h5 class="text-[#1a0dab] hover:underline text-sm font-normal leading-snug cursor-pointer line-clamp-1 mb-1">
                    {previewTitle}
                  </h5>
                  <p class="text-[#4d5156] text-[11px] leading-relaxed line-clamp-2">
                    {previewDesc}
                  </p>
                </div>

                {/* Custom SEO Meta Title */}
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="text-[11px] font-semibold text-slate-300">SEO Meta Title Override</label>
                    <span class="text-[10px] font-mono text-slate-500">{currentPost.metaTitle?.length || 0} / 60</span>
                  </div>
                  <input
                    type="text"
                    value={currentPost.metaTitle || ''}
                    onChange={(e) => setCurrentPost({ ...currentPost, metaTitle: e.target.value })}
                    placeholder="Leave blank to use article title"
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Custom SEO Meta Description */}
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="text-[11px] font-semibold text-slate-300">SEO Meta Description Override</label>
                    <span class="text-[10px] font-mono text-slate-500">{currentPost.metaDescription?.length || 0} / 160</span>
                  </div>
                  <textarea
                    rows={3}
                    value={currentPost.metaDescription || ''}
                    onChange={(e) => setCurrentPost({ ...currentPost, metaDescription: e.target.value })}
                    placeholder="Leave blank to use excerpt"
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white"
                  />
                </div>

                {/* Canonical URL override */}
                <div>
                  <label class="block text-[11px] font-semibold text-slate-300 mb-1">Canonical URL (optional)</label>
                  <input
                    type="text"
                    value={currentPost.canonicalUrl || ''}
                    onChange={(e) => setCurrentPost({ ...currentPost, canonicalUrl: e.target.value })}
                    placeholder="https://..."
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Robot indexing */}
                <label class="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <input
                    type="checkbox"
                    checked={!currentPost.noindex}
                    onChange={(e) => setCurrentPost({ ...currentPost, noindex: !e.target.checked })}
                    class="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="text-xs font-medium text-slate-200">Include in Google Index & XML Sitemap</span>
                </label>

                <button
                  type="submit"
                  disabled={isSaving}
                  class="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

