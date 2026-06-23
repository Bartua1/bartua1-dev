# 🚀 Blog & Portfolio Improvement Roadmap

Welcome to the **Improvements** roadmap! This folder is dedicated to planning, tracking, and detailing enhancements for the `bartua1-dev` platform. 

This document outlines high-impact feature ideas divided into **Reader Experience (UX)**, **Authoring Experience (DX/Admin)**, and **Technical/SEO Core** to make your blog more engaging for readers and easier for you to manage.

---

## 🗺️ Feature Roadmap

Use the checklists below to plan and track implementation. Mark items as completed (`[x]`) as they are developed.

### 🌟 1. Reader Experience (UX & Frontend)
Enhance the reading journey, engagement, and visual aesthetics for visitors.

- [ ] **🌓 Dark / Light Mode Toggle**
  - Implement a theme toggle utilizing Tailwind CSS v4's native dark mode support (e.g., using CSS variables or class-based theme switching).
  - Add a smooth transition animation for theme changes.
- [x] **⏱️ Reading Time Indicator**
  - Add a server-side helper to calculate estimated reading time (e.g., `content.split(/\s+/).length / 200`) and display it next to the post date (e.g., `⚡ 5 min read`).
- [x] **🔍 Instant Search & Multi-Tag Filters**
  - Add an interactive search input to instantly filter posts on the homepage.
  - Enable clicking on tags/topics to filter the list without full page reloads.
- [x] **📜 Floating Table of Contents (TOC)**
  - Generate a dynamic, scroll-spy TOC on the post details page from markdown headings (`##` and `###`).
  - Highlights the current section as the reader scrolls down.
- [ ] **❤️ Post Reaction / Claps System**
  - Add a interactive clap/like button on articles with a dynamic count.
  - Store reactions in the SQLite database, using a simple cookie/localStorage checks to prevent spam.
- [ ] **📧 Newsletter Subscription Widget**
  - Add a sleek sign-up form in the footer or sidebar to capture emails, saving them to the database or integrating with a newsletter provider (e.g., Mailchimp, Buttondown).
- [ ] **🔗 Share Sheet & Link Copier**
  - Create a sharing action button that opens native sharing on mobile or displays a sleek "Copied to clipboard!" toast on desktop.
- [ ] **🖼️ Markdown Image Zoom / Lightbox**
  - Integrate a zoom-on-click library or custom client-side React component to view images/diagrams in full screen.

---

### ✍️ 2. Authoring & Blog Management (Admin)
Streamline content creation, editing, and analytics.

- [ ] **💾 Editor Auto-Save & Local Backup**
  - Save drafts to `localStorage` automatically while typing.
  - Display a "Recover draft" alert if the editor is closed with unsaved changes.
- [ ] **🛠️ Rich Markdown Toolbar**
  - Add a text formatting helper toolbar above the inline editor (Bold, Italic, Link, Code, Lists, Quote, Image) to speed up writing.
- [ ] **📤 Drag-and-Drop Image Uploader**
  - Enable dropping or pasting screenshots directly into the markdown editor.
  - Build an API route `/api/admin/upload` to store uploads in `public/assets/uploads/` and auto-insert `![Image](/dev/assets/uploads/filename.png)`.
- [ ] **📅 Drafts & Scheduled Publishing**
  - Add a `status` field (Draft vs. Published) or a `publishedAt` timestamp to the `Post` schema.
  - Allow writing posts and scheduling them to appear automatically after a certain date/time.
- [ ] **📊 Interactive Traffic Dashboard**
  - Build a visual dashboard using charts (e.g., Recharts) inside `/admin` to display visit data collected from the `Analytics` table.
  - Track metrics like page views, popular articles, and country/referrer distribution.
- [ ] **🤖 AI Writing & Translation Assistant**
  - Integrate a Gemini API call inside the editor to auto-translate posts between Spanish and English.
  - Generate SEO summaries, titles, and suggest topic tags based on article contents.
- [ ] **👁️ Live SEO & Social Cards Preview**
  - Display a live mock-up of how the post will appear on Google search results (Title, Snippet, URL) and social media (Open Graph cards on Twitter/LinkedIn).

---

### 🛠️ 3. Technical, SEO & Performance
Improve search engine discovery, scalability, and system reliability.

- [ ] **🗺️ Dynamic Sitemap (`sitemap.xml`) & RSS Feed**
  - Build a route `/dev/sitemap.xml` that outputs fresh SEO sitemaps dynamically based on database posts.
  - Build an RSS feed (`/dev/feed.xml`) so readers can subscribe via RSS readers.
- [ ] **🏷️ JSON-LD Structured Data**
  - Inject `BlogPosting` and `ProfilePage` structured schema script tags on article and portfolio pages to optimize Google Rich snippets.
- [ ] **🔋 Database Automatic Backups**
  - Add an admin button or cron job script to zip and download/backup the `dev.db` SQLite database file.
- [ ] **⚡ Image Auto-Optimization Pipeline**
  - Automate image optimization on upload to convert assets to highly compressed `.webp` format and generate responsive sizes.

---

## 🛠️ DB Schema Ideas (Prisma)

Here are draft schema changes in [`prisma/schema.prisma`](file:///c:/Users/gbartual/Documents/PythonTests/Test/bartua1-dev/prisma/schema.prisma) to support some of these features:

### 1. Reactions & Comments Schema
```prisma
model PostReaction {
  id        String   @id @default(uuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  type      String   // e.g., "like", "clap"
  count     Int      @default(0)
  createdAt DateTime @default(now())
}

model Comment {
  id        String   @id @default(uuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    String
  email     String?
  content   String
  approved  Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### 2. Multi-Tag Support
```prisma
model Tag {
  id      String   @id @default(uuid())
  nameEs  String   @unique
  nameEn  String   @unique
  posts   Post[]
}
```

### 3. Newsletter Subscribers
```prisma
model Subscriber {
  id        String   @id @default(uuid())
  email     String   @unique
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}
```
