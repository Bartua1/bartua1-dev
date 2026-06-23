# 📊 Analytics Dashboard Implementation Plan

This document outlines the design and integration plan for building a simple, beautiful analytics dashboard in the Admin Panel using the existing `Analytics` database model.

---

## 📈 Current Database Schema
The database already tracks page visits via the `Analytics` table:
```prisma
model Analytics {
  id        Int      @id @default(autoincrement())
  slug      String   // Path name (e.g. "/posts/my-post" or "/")
  visitedAt DateTime @default(now())
  country   String?  // Optional geolocation metadata
}
```

Currently, data is being accumulated in `Analytics` (presumably via a middleware or route-level logging), but there is no admin-facing interface to read or visualize it.

---

## 🏛️ Proposed Dashboard View

We can create a new section in the Admin page `/dev/[locale]/admin` displaying:
1. **Key Performance Indicators (KPIs)**: Total views, Unique posts tracked, Views in the last 7 days.
2. **Most Viewed Posts**: A simple ordered bar chart list of slugs and their view counts.
3. **Views Over Time**: A line chart or bar chart displaying daily visits.
4. **Country Distribution**: A list or map of reader locations.

---

## 🛠️ Implementation Options

### Option A: Standard CSS-based Mini-Dashboard (No External Libraries)
To keep the bundle size small and load instantly, we can generate statistical bar charts directly using Tailwind CSS v4 layout rules (e.g., flexboxes with percentage widths).

```tsx
// Server Action or Loader Query
const analyticsData = await prisma.analytics.groupBy({
  by: ['slug'],
  _count: { id: true },
  orderBy: { _count: { id: 'desc' } },
});

// Inside Admin Page UI:
return (
  <div className="space-y-6">
    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 font-mono">
      Popular Content
    </h3>
    <div className="space-y-3 bg-white p-6 border border-stone-200 rounded-xl shadow-sm">
      {analyticsData.map((item) => {
        const percentage = Math.round((item._count.id / maxViews) * 100);
        return (
          <div key={item.slug} className="space-y-1">
            <div className="flex justify-between text-xs font-mono font-semibold text-stone-700">
              <span>{item.slug}</span>
              <span>{item._count.id} views</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
```

### Option B: Rich Charting Dashboard with Recharts
If dynamic hover states, line charts, and interactive tooltips are desired, we can install the `recharts` package.

```bash
npm install recharts
```

#### Client Component: `AnalyticsCharts.tsx`
Create a client component to render a line chart of visits over the last 30 days:

```tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ChartDataPoint {
  date: string;
  views: number;
}

export default function AnalyticsCharts({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Views Over Time */}
      <div className="bg-white p-6 border border-stone-200 rounded-xl shadow-sm h-80">
        <h4 className="text-xs font-bold font-mono text-stone-500 uppercase mb-4">Traffic (Last 30 Days)</h4>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="#78716c" fontSize={10} fontClassName="font-mono" />
            <YAxis stroke="#78716c" fontSize={10} fontClassName="font-mono" />
            <Tooltip contentStyle={{ background: '#1c1917', color: '#f5f5f4', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="views" stroke="#d97706" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* ... Add Bar charts for top pages and countries ... */}
    </div>
  );
}
```

---

## 📍 Geolocation Tracking (Country metadata)
To populate the `country` field, we can inspect request headers in Next.js Middleware or directly inside server components on load.

If hosted behind Cloudflare or a reverse proxy like Vercel/Netlify, geography headers are automatically injected:
```ts
const country = req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || 'Unknown';
```

For self-hosted instances on Raspberry Pi, you can fetch country metadata on the server side using a lightweight lookup library or a free local DB (like MaxMind GeoLite2), or query a lightweight API client-side/server-side:
```ts
const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
const geoData = await geoRes.json();
const country = geoData.country_name || 'Unknown';
```

---

## 📋 Integration Checklist
- [ ] Implement visitor geolocation detection in page views tracker.
- [ ] Build a database query resolver to aggregate views grouped by day, slug, and country.
- [ ] Create the Admin Dashboard UI component containing stats counters.
- [ ] Choose and implement Option A (CSS bar lists) or Option B (Recharts) to visualize the data.
- [ ] Add navigation tab/button in `/admin` to toggle between "Posts Manager" and "Analytics".
