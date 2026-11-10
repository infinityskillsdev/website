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
  path: text('path').notNull().unique(), // e.g. '/', '/about', '/services'
  pageName: text('page_name').notNull(), // User-friendly label e.g. "Homepage"
  metaTitle: text('meta_title').notNull(),
  metaDescription: text('meta_description').notNull(),
  keywords: text('keywords').default(''),
  canonicalUrl: text('canonical_url').default(''),
  ogTitle: text('og_title').default(''),
  ogDescription: text('og_description').default(''),
  ogImage: text('og_image').default(''),
  twitterCard: text('twitter_card').default('summary_large_image'), // 'summary' or 'summary_large_image'
  noindex: integer('noindex', { mode: 'boolean' }).default(false),
  nofollow: integer('nofollow', { mode: 'boolean' }).default(false),
  structuredDataType: text('structured_data_type').default('WebSite'), // 'WebSite', 'Article', 'Organization', 'FAQPage', 'Product', 'Custom'
  customSchemaJson: text('custom_schema_json').default(''),
  changefreq: text('changefreq').default('weekly'), // 'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'
  priority: text('priority').default('0.8'), // e.g. '1.0', '0.8', '0.5'
  inSitemap: integer('in_sitemap', { mode: 'boolean' }).default(true),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
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
export type Redirect = typeof redirects.$inferSelect;
