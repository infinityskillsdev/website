# Infinity Modern Website with Built-In SEO Engine

A standalone, ultra-fast website built with **Astro**, **SQLite (LibSQL)**, and **Tailwind CSS**. Designed for 100/100 Core Web Vitals and zero vendor lock-in, deployable on **Vercel (100% Free)**, **cPanel**, **Plesk**, **CyberPanel**, or **Docker/VPS**.

---

## 🚀 Key Features

* **⚡ 100/100 Lighthouse Speed**: Astro Islands architecture ships **zero JavaScript** to regular visitors by default.
* **🎛️ Live In-Dashboard SEO Panel (`/admin/seo`)**:
  * Real-time Google SERP Snippet Simulator (title length & truncation warning).
  * Social Media (OpenGraph / Twitter Card) live preview.
  * Page-by-page Meta Titles, Descriptions, Keywords, and Canonical URL overrides.
  * Schema.org (JSON-LD) structured data generator (`WebSite`, `Organization`, `Article`, `Product`, or custom).
  * `noindex` and `nofollow` robot toggles.
  * 301/302 Redirect Manager.
* **🤖 Automated Search Engine Feeds**:
  * Dynamic `/sitemap.xml` generated automatically from the SQLite database.
  * Dynamic `/robots.txt` generated with custom rules from the dashboard.
* **🌐 Universal Hosting Portability**:
  * **Vercel Free Tier**: Connect free Turso Cloud SQLite (`libsql://...`).
  * **cPanel / Plesk**: Run as a native Node.js application with a local zero-config SQLite file (`file:local.db`).
  * **Docker / VPS**: Pre-configured Alpine Docker image (~85MB) and `docker-compose.yml`.

---

## 🛠️ Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:4321](http://localhost:4321) to view the website, or [http://localhost:4321/admin/seo](http://localhost:4321/admin/seo) to access the SEO Control Panel.

3. **Build and test the standalone server**:
   ```bash
   npm run build
   npm run start
   ```

---

## ☁️ Deployment Guide

### Option 1: 100% Free on Vercel + Turso SQLite

1. **Create a Free Turso SQLite Database**:
   * Sign up at [turso.tech](https://turso.tech) (Free tier gives 9GB, 500 databases, and 1B reads/month).
   * Create a database:
     ```bash
     turso db create infinity-db
     turso db show infinity-db --url
     turso db tokens create infinity-db
     ```
2. **Deploy to Vercel**:
   * Push this repository to GitHub or GitLab.
   * Import the project into [Vercel](https://vercel.com).
   * In Vercel Project Settings ➔ **Environment Variables**, add:
     * `DEPLOY_TARGET`: `vercel`
     * `DATABASE_URL`: `libsql://your-database-name.turso.io`
     * `DATABASE_AUTH_TOKEN`: `your-turso-token`
     * `SITE_URL`: `https://your-custom-domain.com`
   * Click **Deploy**. Vercel will automatically build using the serverless edge adapter!

---

### Option 2: Deploy to cPanel (Shared Hosting with Node.js)

1. In cPanel, navigate to **Setup Node.js App**.
2. Click **Create Application**:
   * **Node.js version**: Choose `20.x` or `22.x`.
   * **Application mode**: `Production`.
   * **Application root**: e.g. `infinity`.
   * **Application startup file**: `dist/server/entry.mjs`.
3. Upload your project files (via File Manager or Git Version Control).
4. In the cPanel Node.js dashboard, click **Run NPM Install** and then **Run JS script ➔ build**.
5. Ensure your `.env` contains:
   ```env
   DATABASE_URL="file:local.db"
   SITE_URL="https://yourdomain.com"
   ```
6. Click **Restart Application**. The local SQLite database (`local.db`) will auto-initialize on first load!

---

### Option 3: Deploy to VPS / Docker (Coolify, CapRover, Portainer, or Terminal)

Run using Docker Compose:
```bash
docker compose up -d --build
```
Your website will be running on port `4321` with persistent SQLite storage mounted in `./data/local.db`.

---

## 📁 Project Structure

```
├── astro.config.mjs             # Dual adapter (Node standalone or Vercel serverless)
├── Dockerfile                   # Lightweight Alpine multi-stage Docker build
├── docker-compose.yml           # Production Docker Compose definition
├── src/
│   ├── components/
│   │   ├── SEO.astro            # Head meta injector (OG, Twitter, JSON-LD, Sitemap link)
│   │   └── admin/
│   │       └── SeoPanel.tsx     # React SEO dashboard island with live SERP preview
│   ├── db/
│   │   ├── client.ts            # LibSQL client with automatic schema initialization
│   │   └── schema.ts            # Drizzle SQLite schemas (site_settings, pages_seo, redirects)
│   ├── layouts/
│   │   └── Layout.astro         # Main HTML5 layout with navigation and footer
│   ├── middleware.ts            # 301/302 Redirect engine
│   └── pages/
│       ├── index.astro          # High-performance Homepage
│       ├── about.astro          # About Page
│       ├── services.astro       # Services Page
│       ├── admin/
│       │   └── seo.astro        # Admin SEO Panel page
│       ├── sitemap.xml.ts       # Dynamic automated XML sitemap endpoint
│       ├── robots.txt.ts        # Dynamic robots.txt endpoint
│       └── api/seo/             # REST API for the SEO dashboard
```
