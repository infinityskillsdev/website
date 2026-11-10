import React, { useState, useEffect } from 'react';

interface PageSeo {
  id?: number;
  path: string;
  pageName: string;
  metaTitle: string;
  metaDescription: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredDataType?: string;
  customSchemaJson?: string;
  changefreq?: string;
  priority?: string;
  inSitemap?: boolean;
}

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  titleTemplate: string;
  defaultOgImage: string;
  twitterHandle: string;
  googleVerification: string;
  bingVerification: string;
  robotsTxtCustom: string;
  headScripts: string;
  bodyScripts: string;
}

interface RedirectItem {
  id?: number;
  sourcePath: string;
  targetPath: string;
  statusCode: number;
  enabled: boolean;
}

export default function SeoPanel() {
  const [tab, setTab] = useState<'pages' | 'global' | 'robots' | 'redirects'>('pages');
  const [pages, setPages] = useState<PageSeo[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('/');
  const [currentPage, setCurrentPage] = useState<PageSeo>({
    path: '/',
    pageName: 'Home',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image',
    noindex: false,
    nofollow: false,
    structuredDataType: 'WebSite',
    customSchemaJson: '',
    changefreq: 'weekly',
    priority: '0.8',
    inSitemap: true,
  });

  const [settings, setSettings] = useState<SiteSettings>({
    siteName: '',
    siteDescription: '',
    titleTemplate: '%title% | %site_name%',
    defaultOgImage: '',
    twitterHandle: '',
    googleVerification: '',
    bingVerification: '',
    robotsTxtCustom: 'User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml',
    headScripts: '',
    bodyScripts: '',
  });

  const [redirects, setRedirects] = useState<RedirectItem[]>([]);
  const [newRedirect, setNewRedirect] = useState<RedirectItem>({
    sourcePath: '',
    targetPath: '',
    statusCode: 301,
    enabled: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddingNewPage, setIsAddingNewPage] = useState(false);
  const [newRoutePath, setNewRoutePath] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchPages();
    fetchSettings();
    fetchRedirects();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/seo/pages');
      if (res.ok) {
        const data = await res.json();
        setPages(data);
        if (data.length > 0) {
          const match = data.find((p: PageSeo) => p.path === selectedPath) || data[0];
          setCurrentPage(match);
          setSelectedPath(match.path);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/seo/global');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRedirects = async () => {
    try {
      const res = await fetch('/api/seo/redirects');
      if (res.ok) {
        const data = await res.json();
        setRedirects(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectPage = (path: string) => {
    setSelectedPath(path);
    setIsAddingNewPage(false);
    const found = pages.find((p) => p.path === path);
    if (found) {
      setCurrentPage({ ...found });
    }
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/seo/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPage),
      });
      if (res.ok) {
        showToast('Page SEO settings saved successfully!');
        setIsAddingNewPage(false);
        fetchPages();
      } else {
        const err = await res.json();
        alert('Failed: ' + (err.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/seo/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast('Site-wide settings updated successfully!');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRedirect.sourcePath || !newRedirect.targetPath) return;
    try {
      const res = await fetch('/api/seo/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRedirect),
      });
      if (res.ok) {
        showToast('Redirect rule added!');
        setNewRedirect({ sourcePath: '', targetPath: '', statusCode: 301, enabled: true });
        fetchRedirects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRedirect = async (sourcePath: string) => {
    if (!confirm(`Delete redirect for ${sourcePath}?`)) return;
    try {
      const res = await fetch('/api/seo/redirects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcePath }),
      });
      if (res.ok) {
        showToast('Redirect deleted');
        fetchRedirects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNewRoute = () => {
    if (!newRoutePath.trim()) return;
    const cleanPath = newRoutePath.startsWith('/') ? newRoutePath.trim() : `/${newRoutePath.trim()}`;
    const newPageObj: PageSeo = {
      path: cleanPath,
      pageName: cleanPath.replace('/', '').toUpperCase() || 'Page',
      metaTitle: `${cleanPath.replace('/', '')} - New Page`,
      metaDescription: 'Description for ' + cleanPath,
      keywords: '',
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      twitterCard: 'summary_large_image',
      noindex: false,
      nofollow: false,
      structuredDataType: 'WebSite',
      customSchemaJson: '',
      changefreq: 'weekly',
      priority: '0.8',
      inSitemap: true,
    };
    setCurrentPage(newPageObj);
    setSelectedPath(cleanPath);
    setIsAddingNewPage(false);
    setNewRoutePath('');
  };

  // Preview computations
  const previewTitle = settings.titleTemplate
    ? settings.titleTemplate.replace('%title%', currentPage.metaTitle || 'Page Title').replace('%site_name%', settings.siteName || 'Infinity Site')
    : currentPage.metaTitle || 'Page Title';

  const previewDescription = currentPage.metaDescription || settings.siteDescription || 'No description entered yet.';
  const previewOgTitle = currentPage.ogTitle || currentPage.metaTitle || 'Social Card Title';
  const previewOgDesc = currentPage.ogDescription || currentPage.metaDescription || 'Social Card Description';
  const previewOgImage = currentPage.ogImage || settings.defaultOgImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop';

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

      {/* Navigation Tabs */}
      <div class="flex items-center gap-2 border-b border-slate-800 pb-3 mb-8 overflow-x-auto text-sm">
        <button
          onClick={() => setTab('pages')}
          class={`px-4 py-2 rounded-lg font-medium transition-colors ${
            tab === 'pages' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          📄 Page SEO & SERP Preview
        </button>
        <button
          onClick={() => setTab('global')}
          class={`px-4 py-2 rounded-lg font-medium transition-colors ${
            tab === 'global' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          🌐 Site-Wide SEO & Verification
        </button>
        <button
          onClick={() => setTab('robots')}
          class={`px-4 py-2 rounded-lg font-medium transition-colors ${
            tab === 'robots' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          🤖 Robots.txt & Sitemap
        </button>
        <button
          onClick={() => setTab('redirects')}
          class={`px-4 py-2 rounded-lg font-medium transition-colors ${
            tab === 'redirects' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          🔀 301/302 Redirects
        </button>
      </div>

      {/* TAB 1: PAGE SEO */}
      {tab === 'pages' && (
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Route selector & Form */}
          <div class="lg:col-span-7 space-y-6">
            {/* Route selector bar */}
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Select Page Route</label>
                <div class="flex items-center gap-2">
                  <select
                    value={selectedPath}
                    onChange={(e) => handleSelectPage(e.target.value)}
                    class="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {pages.map((p) => (
                      <option key={p.path} value={p.path}>
                        {p.pageName} ({p.path})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewPage(true)}
                    class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20"
                  >
                    + Add Route
                  </button>
                </div>
              </div>

              {isAddingNewPage && (
                <div class="flex items-center gap-2 w-full pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="/custom-path"
                    value={newRoutePath}
                    onChange={(e) => setNewRoutePath(e.target.value)}
                    class="flex-1 bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewRoute}
                    class="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewPage(false)}
                    class="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSavePage} class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Friendly Label</label>
                  <input
                    type="text"
                    value={currentPage.pageName}
                    onChange={(e) => setCurrentPage({ ...currentPage, pageName: e.target.value })}
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Route Path</label>
                  <input
                    type="text"
                    value={currentPage.path}
                    readOnly={currentPage.path === '/'}
                    onChange={(e) => setCurrentPage({ ...currentPage, path: e.target.value })}
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Meta Title with Character counter */}
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="text-xs font-semibold text-slate-300">
                    SEO Meta Title <span class="text-rose-400">*</span>
                  </label>
                  <span
                    class={`text-xs font-mono px-2 py-0.5 rounded ${
                      (currentPage.metaTitle?.length || 0) > 60
                        ? 'bg-rose-500/20 text-rose-400'
                        : (currentPage.metaTitle?.length || 0) >= 40
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {currentPage.metaTitle?.length || 0} / 60 chars (Optimal: 50-60)
                  </span>
                </div>
                <input
                  type="text"
                  value={currentPage.metaTitle}
                  onChange={(e) => setCurrentPage({ ...currentPage, metaTitle: e.target.value })}
                  placeholder="e.g. Modern Web Engineering & SEO Services"
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Meta Description with Character counter */}
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="text-xs font-semibold text-slate-300">
                    SEO Meta Description <span class="text-rose-400">*</span>
                  </label>
                  <span
                    class={`text-xs font-mono px-2 py-0.5 rounded ${
                      (currentPage.metaDescription?.length || 0) > 160
                        ? 'bg-rose-500/20 text-rose-400'
                        : (currentPage.metaDescription?.length || 0) >= 120
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {currentPage.metaDescription?.length || 0} / 160 chars (Optimal: 120-160)
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={currentPage.metaDescription}
                  onChange={(e) => setCurrentPage({ ...currentPage, metaDescription: e.target.value })}
                  placeholder="Enter a compelling summary for search result snippets..."
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Focus Keywords & Canonical URL */}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Focus Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={currentPage.keywords || ''}
                    onChange={(e) => setCurrentPage({ ...currentPage, keywords: e.target.value })}
                    placeholder="fast website, web design, seo"
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Canonical URL (optional override)</label>
                  <input
                    type="text"
                    value={currentPage.canonicalUrl || ''}
                    onChange={(e) => setCurrentPage({ ...currentPage, canonicalUrl: e.target.value })}
                    placeholder="https://example.com/canonical-page"
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* OpenGraph & Social Details */}
              <div class="border-t border-slate-800 pt-5 space-y-4">
                <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400">Social Media & OpenGraph</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">OG Image URL</label>
                    <input
                      type="text"
                      value={currentPage.ogImage || ''}
                      onChange={(e) => setCurrentPage({ ...currentPage, ogImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">Twitter Card Style</label>
                    <select
                      value={currentPage.twitterCard || 'summary_large_image'}
                      onChange={(e) => setCurrentPage({ ...currentPage, twitterCard: e.target.value })}
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="summary_large_image">summary_large_image (Large Banner)</option>
                      <option value="summary">summary (Small Thumbnail)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Indexing & Sitemap Controls */}
              <div class="border-t border-slate-800 pt-5 space-y-4">
                <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400">Search Engine Directives</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label class="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      checked={!currentPage.noindex}
                      onChange={(e) => setCurrentPage({ ...currentPage, noindex: !e.target.checked })}
                      class="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="text-xs font-medium text-slate-200">Allow Indexing</span>
                  </label>

                  <label class="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      checked={!currentPage.nofollow}
                      onChange={(e) => setCurrentPage({ ...currentPage, nofollow: !e.target.checked })}
                      class="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="text-xs font-medium text-slate-200">Follow Links</span>
                  </label>

                  <label class="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      checked={currentPage.inSitemap ?? true}
                      onChange={(e) => setCurrentPage({ ...currentPage, inSitemap: e.target.checked })}
                      class="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span class="text-xs font-medium text-slate-200">Include in Sitemap</span>
                  </label>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">Sitemap Priority</label>
                    <select
                      value={currentPage.priority || '0.8'}
                      onChange={(e) => setCurrentPage({ ...currentPage, priority: e.target.value })}
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                    >
                      <option value="1.0">1.0 (Highest - Homepage)</option>
                      <option value="0.8">0.8 (High - Main pages)</option>
                      <option value="0.5">0.5 (Normal - Articles/Subpages)</option>
                      <option value="0.3">0.3 (Low)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">Change Frequency</label>
                    <select
                      value={currentPage.changefreq || 'weekly'}
                      onChange={(e) => setCurrentPage({ ...currentPage, changefreq: e.target.value })}
                      class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                    >
                      <option value="always">Always</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Schema.org Structured Data */}
              <div class="border-t border-slate-800 pt-5 space-y-3">
                <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400">Schema.org Structured Data</h4>
                <div>
                  <label class="block text-xs font-semibold text-slate-300 mb-1">Schema Type</label>
                  <select
                    value={currentPage.structuredDataType || 'WebSite'}
                    onChange={(e) => setCurrentPage({ ...currentPage, structuredDataType: e.target.value })}
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="WebSite">WebSite</option>
                    <option value="Organization">Organization</option>
                    <option value="Article">Article</option>
                    <option value="Product">Product</option>
                    <option value="Custom">Custom JSON-LD</option>
                  </select>
                </div>

                {currentPage.structuredDataType === 'Custom' && (
                  <div>
                    <label class="block text-xs font-semibold text-slate-300 mb-1">Custom JSON-LD</label>
                    <textarea
                      rows={4}
                      value={currentPage.customSchemaJson || ''}
                      onChange={(e) => setCurrentPage({ ...currentPage, customSchemaJson: e.target.value })}
                      placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "FAQPage"\n}`}
                      class="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 text-emerald-400"
                    />
                  </div>
                )}
              </div>

              <div class="pt-4 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isSaving}
                  class="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : '💾 Save Page SEO'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live SERP and Social Previews */}
          <div class="lg:col-span-5 space-y-6">
            {/* Live Google Search Preview Card */}
            <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 sticky top-24">
              <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-300">Live Google SERP Simulator</span>
                </div>
                <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Desktop Preview
                </span>
              </div>

              {/* Google Result Box */}
              <div class="bg-white rounded-xl p-4 text-left shadow-lg font-sans border border-slate-200">
                <div class="flex items-center gap-2 text-xs text-slate-700 mb-1">
                  <div class="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600">🌐</div>
                  <div class="flex flex-col">
                    <span class="text-[12px] text-slate-800 font-medium leading-none">{settings.siteName || 'Infinity'}</span>
                    <span class="text-[11px] text-slate-500 leading-none mt-0.5">
                      https://yourdomain.com{currentPage.path === '/' ? '' : currentPage.path}
                    </span>
                  </div>
                </div>
                <h3 class="text-[#1a0dab] hover:underline text-lg font-normal leading-snug cursor-pointer line-clamp-1 mb-1">
                  {previewTitle}
                </h3>
                <p class="text-[#4d5156] text-xs leading-relaxed line-clamp-2">
                  {previewDescription}
                </p>
              </div>

              {/* SERP Diagnostics Checklist */}
              <div class="mt-6 space-y-2 text-xs">
                <h5 class="text-slate-400 font-semibold mb-2">Google Best Practices Checklist:</h5>
                <div class="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span class="text-slate-400">Title Length (50-60 chars):</span>
                  <span
                    class={
                      (currentPage.metaTitle?.length || 0) >= 40 && (currentPage.metaTitle?.length || 0) <= 60
                        ? 'text-emerald-400 font-bold'
                        : 'text-amber-400 font-bold'
                    }
                  >
                    {currentPage.metaTitle?.length || 0} chars
                  </span>
                </div>
                <div class="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span class="text-slate-400">Description Length (120-160 chars):</span>
                  <span
                    class={
                      (currentPage.metaDescription?.length || 0) >= 120 && (currentPage.metaDescription?.length || 0) <= 160
                        ? 'text-emerald-400 font-bold'
                        : 'text-amber-400 font-bold'
                    }
                  >
                    {currentPage.metaDescription?.length || 0} chars
                  </span>
                </div>
                <div class="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span class="text-slate-400">Robots Indexable:</span>
                  <span class={!currentPage.noindex ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {!currentPage.noindex ? 'Yes (Index)' : 'No (noindex)'}
                  </span>
                </div>
              </div>

              {/* Social Card Preview */}
              <div class="mt-8 pt-6 border-t border-slate-800">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-300">Social Share Card Preview</span>
                  <span class="text-[10px] text-slate-500 font-mono">OG / Twitter</span>
                </div>

                <div class="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <div class="h-36 bg-slate-800 relative overflow-hidden">
                    <img
                      src={previewOgImage}
                      alt="OpenGraph preview"
                      class="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop';
                      }}
                    />
                  </div>
                  <div class="p-3">
                    <span class="text-[10px] uppercase font-bold text-slate-500">yourdomain.com</span>
                    <h4 class="text-xs font-bold text-white line-clamp-1 mt-0.5">{previewOgTitle}</h4>
                    <p class="text-[11px] text-slate-400 line-clamp-2 mt-1">{previewOgDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL SETTINGS */}
      {tab === 'global' && (
        <form onSubmit={handleSaveSettings} class="max-w-3xl p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          <h3 class="text-lg font-bold text-white">Global Meta Defaults & Webmaster Verification</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Site Brand Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Global Title Template</label>
              <input
                type="text"
                value={settings.titleTemplate}
                onChange={(e) => setSettings({ ...settings, titleTemplate: e.target.value })}
                placeholder="%title% | %site_name%"
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Fallback Site Description</label>
            <textarea
              rows={2}
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Default OG Image URL</label>
              <input
                type="text"
                value={settings.defaultOgImage}
                onChange={(e) => setSettings({ ...settings, defaultOgImage: e.target.value })}
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Twitter / X Handle</label>
              <input
                type="text"
                value={settings.twitterHandle}
                onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
                placeholder="@yourbrand"
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div class="border-t border-slate-800 pt-5 space-y-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400">Search Engine Verification Codes</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Google Site Verification Code</label>
                <input
                  type="text"
                  value={settings.googleVerification}
                  onChange={(e) => setSettings({ ...settings, googleVerification: e.target.value })}
                  placeholder="google-site-verification token"
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Bing Webmaster Token</label>
                <input
                  type="text"
                  value={settings.bingVerification}
                  onChange={(e) => setSettings({ ...settings, bingVerification: e.target.value })}
                  placeholder="msvalidate.01 token"
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div class="border-t border-slate-800 pt-5 space-y-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-400">Custom Code Injections</h4>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Custom &lt;head&gt; Scripts (e.g. Analytics / Tag Manager)</label>
              <textarea
                rows={3}
                value={settings.headScripts || ''}
                onChange={(e) => setSettings({ ...settings, headScripts: e.target.value })}
                placeholder="<!-- Google tag (gtag.js) -->"
                class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            class="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white shadow-lg disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : '💾 Save Global Settings'}
          </button>
        </form>
      )}

      {/* TAB 3: ROBOTS & SITEMAP */}
      {tab === 'robots' && (
        <div class="max-w-3xl space-y-6">
          <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-white">Live Feeds Status</h3>
              <div class="flex items-center gap-3">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                >
                  View /sitemap.xml ↗
                </a>
                <a
                  href="/robots.txt"
                  target="_blank"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20"
                >
                  View /robots.txt ↗
                </a>
              </div>
            </div>

            <p class="text-xs text-slate-400 mb-6">
              Your sitemap automatically aggregates all database pages that have <code class="text-indigo-300">in_sitemap = true</code> and are not set to <code class="text-indigo-300">noindex</code>.
            </p>

            <form onSubmit={handleSaveSettings} class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Custom robots.txt Rules</label>
                <textarea
                  rows={6}
                  value={settings.robotsTxtCustom}
                  onChange={(e) => setSettings({ ...settings, robotsTxtCustom: e.target.value })}
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-indigo-300 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                class="px-5 py-2 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {isSaving ? 'Updating...' : 'Save Robots.txt'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: REDIRECTS */}
      {tab === 'redirects' && (
        <div class="max-w-3xl space-y-6">
          {/* Add Redirect Form */}
          <form onSubmit={handleAddRedirect} class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 class="text-base font-bold text-white">Create 301 / 302 URL Redirect</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Old Path</label>
                <input
                  type="text"
                  placeholder="/old-url"
                  value={newRedirect.sourcePath}
                  onChange={(e) => setNewRedirect({ ...newRedirect, sourcePath: e.target.value })}
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">New Target Path</label>
                <input
                  type="text"
                  placeholder="/new-url"
                  value={newRedirect.targetPath}
                  onChange={(e) => setNewRedirect({ ...newRedirect, targetPath: e.target.value })}
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Status Code</label>
                <select
                  value={newRedirect.statusCode}
                  onChange={(e) => setNewRedirect({ ...newRedirect, statusCode: Number(e.target.value) })}
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value={301}>301 (Permanent)</option>
                  <option value={302}>302 (Temporary)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              class="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              + Add Redirect Rule
            </button>
          </form>

          {/* List of active redirects */}
          <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h4 class="text-sm font-bold text-white mb-4">Active Redirect Rules ({redirects.length})</h4>
            {redirects.length === 0 ? (
              <p class="text-xs text-slate-500">No custom redirects configured yet.</p>
            ) : (
              <div class="space-y-2">
                {redirects.map((r) => (
                  <div key={r.sourcePath} class="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <div class="flex items-center gap-3">
                      <span class="px-2 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {r.statusCode}
                      </span>
                      <span class="font-mono text-slate-300">{r.sourcePath}</span>
                      <span class="text-slate-600">→</span>
                      <span class="font-mono text-indigo-400">{r.targetPath}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRedirect(r.sourcePath)}
                      class="text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

