import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Global Site & SEO Settings
export const siteSettings = sqliteTable('site_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  siteName: text('site_name').notNull().default('Infinity Modern Site'),
  siteDescription: text('site_description').notNull().default('High-performance modern website built with Astro and SQLite.'),
  titleTemplate: text('title_template').notNull().default('%title% | %site_name%'),
  defaultOgImage: text('default_og_image').default('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop'),
  twitterHandle: text('twitter_handle').default('@yourbrand'),
  googleVerification: text('google_verification').default(''),
  bingVerification: text('bing_verification').default(''),
  robotsTxtCustom: text('robots_txt_custom').default('User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml'),
  headScripts: text('head_scripts').default(''),
  bodyScripts: text('body_scripts').default(''),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Page-specific SEO & Metadata
export const pagesSeo = sqliteTable('pages_seo', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull().unique(), // e.g. '/', '/about', '/services', '/blog'
  pageName: text('page_name').notNull(),
  metaTitle: text('meta_title').notNull(),
  metaDescription: text('meta_description').notNull(),
  keywords: text('keywords').default(''),
  canonicalUrl: text('canonical_url').default(''),
  ogTitle: text('og_title').default(''),
  ogDescription: text('og_description').default(''),
  ogImage: text('og_image').default(''),
  twitterCard: text('twitter_card').default('summary_large_image'),
  noindex: integer('noindex', { mode: 'boolean' }).default(false),
  nofollow: integer('nofollow', { mode: 'boolean' }).default(false),
  structuredDataType: text('structured_data_type').default('WebSite'),
  customSchemaJson: text('custom_schema_json').default(''),
  changefreq: text('changefreq').default('weekly'),
  priority: text('priority').default('0.8'),
  inSitemap: integer('in_sitemap', { mode: 'boolean' }).default(true),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Blog Posts with Built-in SEO
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  coverImage: text('cover_image').default('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop'),
  category: text('category').notNull().default('Technology'),
  author: text('author').notNull().default('Infinity Team'),
  status: text('status').notNull().default('published'), // 'draft' | 'published'
  publishedAt: integer('published_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  // Post-specific SEO overrides
  metaTitle: text('meta_title').default(''),
  metaDescription: text('meta_description').default(''),
  canonicalUrl: text('canonical_url').default(''),
  noindex: integer('noindex', { mode: 'boolean' }).default(false),
});

// URL Redirects (301 / 302)
export const redirects = sqliteTable('redirects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourcePath: text('source_path').notNull().unique(),
  targetPath: text('target_path').notNull(),
  statusCode: integer('status_code').notNull().default(301),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
export type PageSeo = typeof pagesSeo.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Redirect = typeof redirects.$inferSelect;
