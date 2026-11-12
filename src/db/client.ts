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

    // 3. Create posts table
    await rawClient.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        cover_image TEXT DEFAULT 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=630&fit=crop',
        category TEXT NOT NULL DEFAULT 'Technology',
        author TEXT NOT NULL DEFAULT 'Infinity Team',
        status TEXT NOT NULL DEFAULT 'published',
        published_at INTEGER,
        updated_at INTEGER,
        meta_title TEXT DEFAULT '',
        meta_description TEXT DEFAULT '',
        canonical_url TEXT DEFAULT '',
        noindex INTEGER DEFAULT 0
      );
    `);

    // 4. Create redirects table
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

    // 5. Seed default global settings if empty
    const existingSettings = await db.select().from(schema.siteSettings).limit(1);
    if (existingSettings.length === 0) {
      await db.insert(schema.siteSettings).values({
        siteName: 'Infinity International Skills Development Ltd',
        siteDescription: 'Empowering Learners. Inspiring Futures. Professional qualifications and educational guidance in London, UK.',
        titleTemplate: '%title% | %site_name%',
        defaultOgImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=630&fit=crop',
        twitterHandle: '@infinityskillsdev',
        robotsTxtCustom: 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /blog\n\nSitemap: /sitemap.xml',
      });
    }

    // 6. Seed initial standard pages if empty
    const existingPages = await db.select().from(schema.pagesSeo).limit(1);
    if (existingPages.length === 0) {
      await db.insert(schema.pagesSeo).values([
        {
          path: '/',
          pageName: 'Home',
          metaTitle: 'Empowering Learners. Inspiring Futures.',
          metaDescription: 'At Infinity International Skills Development Ltd, we support learners through personalised educational guidance, skills development and access to accredited Gatehouse Awards qualifications.',
          keywords: 'educational services london, gatehouse awards, business qualifications uk, tutoring london, university admissions guidance',
          priority: '1.0',
          changefreq: 'daily',
          structuredDataType: 'Organization',
        },
        {
          path: '/about',
          pageName: 'About Us',
          metaTitle: 'About Us - Our Mission & Vision',
          metaDescription: 'Learn about Infinity International Skills Development Ltd, our commitment to accessible quality education, and our London educational support services.',
          keywords: 'about infinity skills, education consultancy london, academic development uk',
          priority: '0.9',
          changefreq: 'monthly',
          structuredDataType: 'Organization',
        },
        {
          path: '/courses',
          pageName: 'Courses',
          metaTitle: 'Explore Our Courses - Gatehouse Awards Qualifications',
          metaDescription: 'Explore 11 Ofqual-regulated Gatehouse Awards qualifications in Business, Management, Innovation, Entrepreneurship, and International Foundation Studies.',
          keywords: 'gatehouse awards qualifications, level 3 diploma business, level 4 business management, level 5 diploma, international foundation diploma',
          priority: '0.9',
          changefreq: 'weekly',
          structuredDataType: 'Product',
        },
        {
          path: '/partner',
          pageName: 'Our Partner',
          metaTitle: 'Our Partner - Gatehouse Awards',
          metaDescription: 'Discover our educational partnership with Gatehouse Awards, an Ofqual-recognised UK awarding organisation delivering regulated qualifications.',
          keywords: 'gatehouse awards partner, ofqual regulated diplomas, uk awarding organisation',
          priority: '0.8',
          changefreq: 'monthly',
          structuredDataType: 'Organization',
        },
        {
          path: '/contact',
          pageName: 'Contact Us',
          metaTitle: 'Get in Touch - Admissions & Course Enquiries',
          metaDescription: 'Contact Infinity International Skills Development Ltd in London for course information, enrolment, tutoring, and admissions guidance.',
          keywords: 'contact infinity skills, education advisor london, woodgrange road london education',
          priority: '0.8',
          changefreq: 'monthly',
          structuredDataType: 'Organization',
        },
        {
          path: '/blog',
          pageName: 'Blog',
          metaTitle: 'Educational Insights & Career Guidance',
          metaDescription: 'Read the latest guides on UK qualifications, business skills, university admissions, and career development.',
          keywords: 'education blog, study in uk, business qualifications guide',
          priority: '0.5',
          changefreq: 'weekly',
          structuredDataType: 'WebSite',
          inSitemap: 0,
          noindex: 1,
        },
      ]);
    }

    // 7. Seed initial blog posts if empty
    const existingPosts = await db.select().from(schema.posts).limit(1);
    if (existingPosts.length === 0) {
      await db.insert(schema.posts).values([
        {
          slug: 'mastering-core-web-vitals-in-2025',
          title: 'Mastering Core Web Vitals: How to Achieve 100/100 Lighthouse Scores',
          excerpt: 'Discover why minimizing client-side JavaScript hydration and optimizing critical rendering paths is the secret to unmatched SEO rankings.',
          content: `## Why Core Web Vitals Dictate Modern SEO

Google's search algorithm puts massive emphasis on user experience signals. Specifically, **Largest Contentful Paint (LCP)**, **Interaction to Next Paint (INP)**, and **Cumulative Layout Shift (CLS)** now directly determine how competitively your content ranks.

### The JavaScript Hydration Trap

Many modern websites build simple content blogs with heavy single-page application (SPA) frameworks. While dynamic interactivity is valuable, downloading 500KB of React or Angular JavaScript just to read an article creates severe CPU overhead on mobile devices.

### 3 Key Pillars of Ultra-Fast Websites:

1. **Islands Architecture**: Only ship JavaScript to interactive components (e.g. search bars, comment feeds), keeping articles static HTML.
2. **Next-Gen Images**: Serve WebP or AVIF formats with explicit \`width\` and \`height\` dimensions to eliminate layout shifts.
3. **Edge Database Delivery**: Place data close to users via SQLite or distributed edge replicas.

By adopting these patterns, your website delivers sub-50ms Time to First Byte (TTFB) and guarantees flawless 100/100 performance scores across mobile and desktop.`,
          coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
          category: 'Performance',
          author: 'Alex Mercer',
          status: 'published',
          metaTitle: 'Mastering Core Web Vitals in 2025: The Complete Guide',
          metaDescription: 'Learn how to score 100/100 on Google Lighthouse by optimizing LCP, INP, and eliminating JavaScript hydration bloat.',
        },
        {
          slug: 'why-sqlite-is-future-of-standalone-websites',
          title: 'Why SQLite & LibSQL Are the Future of Portable Websites',
          excerpt: 'Explore how embedded SQLite removes database administration friction while unlocking instant deployment across any hosting panel.',
          content: `## The Simplicity of SQLite in Production

For over two decades, the standard recipe for dynamic websites required running a separate database daemon—typically MySQL or PostgreSQL—alongside the web server.

While relational server databases excel for massive multi-node transactional platforms, they add substantial operational friction to standard business websites and blogs.

### The Benefits of Embedded Storage

* **Zero Daemon Configuration**: No passwords to leak in database connection strings, no socket errors, and no memory leaks from background database processes.
* **Effortless Backups**: Backing up your database is as simple as copying a single \`.db\` file.
* **Blazing Fast In-Memory Reads**: Because the database lives in the same process or file system, read latencies drop from 10–50ms over a network down to microseconds.

### Seamless Cloud Scale with Turso

When deploying to serverless platforms like Vercel, traditional local file writes are ephemeral. With **LibSQL / Turso**, you get the exact same SQLite syntax and local development experience, combined with instant global edge replication.`,
          coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop',
          category: 'Architecture',
          author: 'Sophia Chen',
          status: 'published',
          metaTitle: 'Why SQLite is the Future of Standalone Web Hosting',
          metaDescription: 'Discover the advantages of embedded SQLite and LibSQL for building superfast, portable websites without database management overhead.',
        },
      ]);
    }

    isInitialized = true;
  } catch (err) {
    console.error('Failed to initialize SQLite tables:', err);
  }
}
