# Gonzalo Bartual | Development Blog & Portfolio (`bartua1-dev`)

A lightweight, responsive, editorial-style personal blog and developer portfolio web application. Designed to look premium using a warm off-white and stone color scheme, and optimized to run efficiently on low-power servers like a Raspberry Pi.

---

## 🚀 Tech Stack & Architecture

- **Framework**: [Next.js](https://nextjs.org/) (App Router, base path set to `/dev` for subpath routing).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with a strict, custom light theme.
- **Internationalization (i18n)**: [`next-intl`](https://next-intl-docs.vercel.app/) supporting **Spanish (Default)** and **English**. Spanish URLs are prefix-free (e.g. `/dev/bartua1`), while English uses the prefix (e.g. `/dev/en/bartua1`).
- **Database**: [SQLite](https://www.sqlite.org/) (`prisma/dev.db`), keeping server footprint and resource usage minimal.
- **ORM**: [Prisma v7](https://www.prisma.io/) (TypeScript-first database schema and client).

---

## 🛠️ Local Development Setup

### 1. Prerequisites
Ensure you have **Node.js 18.x** or higher installed on your system.

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration & Generation
Run the migrations to create the local SQLite database file (`prisma/dev.db`) and generate the Prisma Client:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000/dev](http://localhost:3000/dev) in your browser to view the application.

---

## 📁 Directory Structure

```text
bartua1-dev/
├── prisma/
│   ├── dev.db             # Local SQLite database
│   ├── migrations/        # Database migrations
│   └── schema.prisma      # Prisma schema file
├── public/
│   └── assets/            # Static assets (images, pdfs)
├── src/
│   ├── app/
│   │   └── [locale]/      # Localized routes
│   │       ├── bartua1/
│   │       │   └── page.tsx # Portfolio Page
│   │       ├── layout.tsx # Internationalized Root Layout
│   │       └── page.tsx   # Main Blog Page
│   │   └── globals.css    # Global CSS & Tailwind v4 config
│   ├── i18n/
│   │   ├── request.ts     # next-intl configuration loader
│   │   └── routing.ts     # next-intl routing rules
│   ├── lib/
│   │   └── prisma.ts      # Prisma Client singleton
│   ├── messages/
│   │   ├── es.json        # Spanish translation strings
│   │   └── en.json        # English translation strings
│   └── middleware.ts      # URL locale interception middleware
├── next.config.ts         # Next.js configurations (basePath)
└── prisma.config.ts       # Prisma v7 configuration file
```

---

## 📦 Production Deployment & Nginx Proxy Manager (NPM)

To host this on a Raspberry Pi alongside other services (e.g., Nextcloud):

### 1. Build the Application
```bash
npm run build
```

### 2. Run the Application
Start the built production server (defaults to port `3000`):
```bash
npm run start
```
*Tip: Consider using a process manager like **PM2** to run the Next.js process in the background:*
```bash
pm2 start npm --name "bartua1-dev" -- run start
```

### 3. Nginx Proxy Manager (NPM) Configuration
To route public traffic matching `/dev` to the Next.js app, configure a **Proxy Host** or a **Custom Location** block in NPM under your domain targeting your Raspberry Pi local IP on port `3000`.

Add the following block to your **Custom Nginx Configuration** in NPM to ensure headers and subpaths are correctly handled:

```nginx
location /dev {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## 🧩 Database Schema

The database consists of two models:
- **`Post`**: Stores blog posts, which support markdown contents in both languages (`contentEs` and `contentEn`).
- **`Analytics`**: Stores basic page visit data for analytics.
