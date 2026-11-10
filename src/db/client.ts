import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

const databaseUrl = process.env.DATABASE_URL || 'file:local.db';
const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

export const rawClient = createClient({
  url: databaseUrl,
  authToken: authToken,
});

export const db = drizzle(rawClient, { schema });

// Auto-initialize SQLite tables if they do not exist
let isInitialized = false;

export async function ensureDbInitialized() {
  if (isInitialized) return;

  try {
    // 1. Create site_settings table
    await rawClient.execute(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        site_name TEXT NOT NULL DEFAULT 'Infinity Modern Site',
        site_description TEXT NOT NULL DEFAULT 'High-performance modern website built with Astro and SQLite.',
        title_template TEXT NOT NULL DEFAULT '%title% | %site_name%',
        default_og_image TEXT DEFAULT 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop',
        twitter_handle TEXT DEFAULT '@yourbrand',
        google_verification TEXT DEFAULT '',
        bing_verification TEXT DEFAULT '',
        robots_txt_custom TEXT DEFAULT 'User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml',
        head_scripts TEXT DEFAULT '',
        body_scripts TEXT DEFAULT '',
        updated_at INTEGER
      );
    `);

    // 2. Create pages_seo table
    await rawClient.execute(`
      CREATE TABLE IF NOT EXISTS pages_seo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL UNIQUE,
        page_name TEXT NOT NULL,
        meta_title TEXT NOT NULL,
        meta_description TEXT NOT NULL,
        keywords TEXT DEFAULT '',
        canonical_url TEXT DEFAULT '',
        og_title TEXT DEFAULT '',
        og_description TEXT DEFAULT '',
        og_image TEXT DEFAULT '',
        twitter_card TEXT DEFAULT 'summary_large_image',
        noindex INTEGER DEFAULT 0,
        nofollow INTEGER DEFAULT 0,
        structured_data_type TEXT DEFAULT 'WebSite',
        custom_schema_json TEXT DEFAULT '',
        changefreq TEXT DEFAULT 'weekly',
        priority TEXT DEFAULT '0.8',
        in_sitemap INTEGER DEFAULT 1,
        updated_at INTEGER
      );
    `);

    // 3. Create redirects table
    await rawClient.execute(`
      CREATE TABLE IF NOT EXISTS redirects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_path TEXT NOT NULL UNIQUE,
        target_path TEXT NOT NULL,
        status_code INTEGER NOT NULL DEFAULT 301,
        enabled INTEGER NOT NULL DEFAULT 1,
        updated_at INTEGER
      );
    `);

    // 4. Seed default global settings if empty
    const existingSettings = await db.select().from(schema.siteSettings).limit(1);
    if (existingSettings.length === 0) {
      await db.insert(schema.siteSettings).values({
        siteName: 'Infinity Studio',
        siteDescription: 'Modern, ultra-fast website with an integrated real-time SEO panel.',
        titleTemplate: '%title% | %site_name%',
        defaultOgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop',
        twitterHandle: '@infinitysite',
        robotsTxtCustom: 'User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml',
      });
    }

    // 5. Seed initial standard pages if empty
    const existingPages = await db.select().from(schema.pagesSeo).limit(1);
    if (existingPages.length === 0) {
      await db.insert(schema.pagesSeo).values([
        {
          path: '/',
          pageName: 'Home',
          metaTitle: 'Fastest Modern Web Platform with Built-in SEO',
          metaDescription: 'Experience lightning-fast loading speeds, zero JavaScript by default, and complete on-page SEO control from your custom dashboard.',
          keywords: 'fast website, astro seo, modern web, superfast website, sqlite cms',
          priority: '1.0',
          changefreq: 'daily',
          structuredDataType: 'WebSite',
        },
        {
          path: '/about',
          pageName: 'About Us',
          metaTitle: 'About Us - Our Mission & Ultra-Fast Architecture',
          metaDescription: 'Learn why we chose Astro and SQLite to build a standalone, ultra-portable website deployable on Vercel, cPanel, or VPS.',
          keywords: 'about infinity, web architecture, high speed web',
          priority: '0.8',
          changefreq: 'monthly',
          structuredDataType: 'Organization',
        },
        {
          path: '/services',
          pageName: 'Services',
          metaTitle: 'Modern Web Engineering & High-Performance SEO Services',
          metaDescription: 'Explore our cutting-edge web development, technical SEO audits, and custom web application deployment services.',
          keywords: 'web services, technical seo, speed optimization',
          priority: '0.8',
          changefreq: 'weekly',
          structuredDataType: 'Product',
        },
      ]);
    }

    isInitialized = true;
  } catch (err) {
    console.error('Failed to initialize SQLite tables:', err);
  }
}
