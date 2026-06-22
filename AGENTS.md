# Developer Blog & Portfolio - Agent Instructions

Welcome to the `bartua1-dev` repository. This document outlines the architecture, constraints, and instructions for AI agents operating in this workspace.

---

## 🚀 Repository & Tech Stack Overview
- **Framework**: Next.js 16 (App Router) with TypeScript.
- **Styling**: Tailwind CSS v4 (configured via `@tailwindcss/postcss` and imported in `src/app/globals.css`).
- **Localization (i18n)**: `next-intl` is configured for internationalization (Spanish/English).
- **Database Layer**: SQLite managed via Prisma ORM.
- **Configuration & Environment**: LinkedIn and GitHub profile links are fetched from environment variables.

---

## 🗺️ Key Directories & Files
- **[`src/app`](file:///c:/Users/gbartual/Documents/PythonTests/Test/bartua1-dev/src/app)**: Main App Router directory.
  - **[`[locale]`](file:///c:/Users/gbartual/Documents/PythonTests/Test/bartua1-dev/src/app/[locale])**: Localized routing folder.
  - **[`[locale]/page.tsx`](file:///c:/Users/gbartual/Documents/PythonTests/Test/bartua1-dev/src/app/[locale]/page.tsx)**: Main Blog index page.
  - **[`[locale]/bartua1/page.tsx`](file:///c:/Users/gbartual/Documents/PythonTests/Test/bartua1-dev/src/app/[locale]/bartua1/page.tsx)**: Developer portfolio page.
- **[`src/messages`](file:///c:/Users/gbartual/Documents/PythonTests/Test/bartua1-dev/src/messages)**: JSON translation files (`en.json`, `es.json`).
- **[`src/i18n`](file:///c:/Users/gbartual/Documents/PythonTests/Test/bartua1-dev/src/i18n)**: `next-intl` configuration files (`request.ts`, `routing.ts`).
- **[`prisma`](file:///c:/Users/gbartual/Documents/PythonTests/Test/bartua1-dev/prisma)**: Prisma directory containing `schema.prisma` and the seeding script `seed.ts`.
- **[`public/assets`](file:///c:/Users/gbartual/Documents/PythonTests/Test/bartua1-dev/public/assets)**: Static assets including the developer photo and portfolio logos.

---

## ⚠️ Critical Constraints & Configurations

### 1. Base Path Configuration
- The app uses a basePath `/dev` configured in [`next.config.ts`](file:///c:/Users/gbartual/Documents/PythonTests/Test/bartua1-dev/next.config.ts).
- **Local Dev Server**: Served at `http://localhost:3000/dev`.
- **Static Assets**: Must be requested using the prefix `/dev/assets/...` (which maps to the physical directory `public/assets/`).
- **Internal Routing**: Always use the `Link` wrapper from `@/i18n/routing` to ensure pages load correctly within both the `/dev` base path and the selected locale.

### 2. Localization (i18n) Rules
- Supported locales: `es` (Spanish) and `en` (English).
- **No Hardcoded Strings**: All UI copy, headings, and descriptions must be extracted into the translation files in [`src/messages/`](file:///c:/Users/gbartual/Documents/PythonTests/Test/bartua1-dev/src/messages).
- Update both `en.json` and `es.json` synchronously when changing or adding copy.
- Fetch translations using `getTranslations` (server components) or `useTranslations` (client components) from `next-intl`.

### 3. Database & Prisma
- SQLite is utilized as the database backend. The database file is located at `dev.db` in the project root.
- To update the database schema:
  1. Modify [`prisma/schema.prisma`](file:///c:/Users/gbartual/Documents/PythonTests/Test/bartua1-dev/prisma/schema.prisma).
  2. Generate TypeScript definitions: `npx prisma generate`
  3. Push local changes: `npx prisma db push` or create a migration with `npx prisma migrate dev`.
- Seed data using `npx prisma db seed` or through custom programmatic seeding during initialization.

### 4. Developer Profiles & Assets
- Environment variables in [`.env`](file:///c:/Users/gbartual/Documents/PythonTests/Test/bartua1-dev/.env) control profile links:
  - `LINKEDIN_PROFILE`: URL of the developer's LinkedIn profile.
  - `GITHUB_PROFILE`: URL of the developer's GitHub profile.
- Developer professional photo is stored at [`public/assets/professionalphoto.jpg`](file:///c:/Users/gbartual/Documents/PythonTests/Test/bartua1-dev/public/assets/professionalphoto.jpg) and referenced as `/dev/assets/professionalphoto.jpg`.

---

## 🛠️ Essential Commands
- **Start Development Server**: `npm run dev`
- **Build Production Code**: `npm run build`
- **Lint Code**: `npm run lint`
- **Seed Database**: `npx prisma db seed`

---

## 🎨 Design & Aesthetic Guidelines
- **Modern Styling**: Maintain a sleek, modern UI utilizing Tailwind CSS v4 styling rules.
- **Animation and Hover States**: Use smooth interactive elements, scaling hover states, and clear transitions (e.g., `transition-all duration-200`).
- **Language Switcher**: Ensure the locale toggle behaves correctly, translating all dynamic values without resetting user state unnecessarily.
