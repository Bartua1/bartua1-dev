import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // 1. Authenticate requester
    const { isAdmin } = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date'); // format: YYYY-MM-DD

    // 2. Route branch: Detail view for a specific day
    if (dateParam) {
      const startOfDay = new Date(`${dateParam}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateParam}T23:59:59.999Z`);

      const logs = await prisma.analytics.findMany({
        where: {
          visitedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: {
          visitedAt: 'desc',
        },
      });

      // Group and aggregate by IP address
      const ipGroupMap: Record<
        string,
        {
          ip: string;
          visits: number;
          paths: string[];
          lastActive: Date;
          consented: boolean;
          browser: string;
        }
      > = {};

      logs.forEach((log) => {
        const ipKey = log.ip || 'unknown';
        const isMasked = ipKey.includes('xxx') || ipKey.includes('xxxx');

        if (!ipGroupMap[ipKey]) {
          ipGroupMap[ipKey] = {
            ip: ipKey,
            visits: 0,
            paths: [],
            lastActive: log.visitedAt,
            consented: !isMasked,
            browser: parseUserAgent(log.userAgent || ''),
          };
        }

        ipGroupMap[ipKey].visits += 1;
        if (!ipGroupMap[ipKey].paths.includes(log.slug)) {
          ipGroupMap[ipKey].paths.push(log.slug);
        }
        if (log.visitedAt > ipGroupMap[ipKey].lastActive) {
          ipGroupMap[ipKey].lastActive = log.visitedAt;
        }
      });

      const ipDetails = Object.values(ipGroupMap).sort((a, b) => b.visits - a.visits);

      return NextResponse.json({ success: true, date: dateParam, visitors: ipDetails });
    }

    // 3. Route branch: Aggregated heatmap calendar view (last 180 days)
    const gteDate = new Date();
    gteDate.setDate(gteDate.getDate() - 180);
    gteDate.setHours(0, 0, 0, 0);

    const logs = await prisma.analytics.findMany({
      where: {
        visitedAt: {
          gte: gteDate,
        },
      },
      orderBy: {
        visitedAt: 'asc',
      },
    });

    const dailyMap: Record<string, { date: string; accesses: number; uniqueIps: Set<string>; consentedCount: number }> = {};
    let totalAccesses = 0;
    const allUniqueIps = new Set<string>();
    let consentedTotal = 0;

    // Process all logs in memory (perfect for SQLite/RPi workload scale)
    logs.forEach((log) => {
      totalAccesses += 1;
      const ip = log.ip || 'unknown';
      allUniqueIps.add(ip);

      const isMasked = ip.includes('xxx') || ip.includes('xxxx');
      if (!isMasked) {
        consentedTotal += 1;
      }

      // Format date as YYYY-MM-DD
      const dateStr = log.visitedAt.toISOString().split('T')[0];

      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = {
          date: dateStr,
          accesses: 0,
          uniqueIps: new Set<string>(),
          consentedCount: 0,
        };
      }

      dailyMap[dateStr].accesses += 1;
      dailyMap[dateStr].uniqueIps.add(ip);
      if (!isMasked) {
        dailyMap[dateStr].consentedCount += 1;
      }
    });

    const dailyStats = Object.values(dailyMap).map((d) => ({
      date: d.date,
      accesses: d.accesses,
      uniqueIps: d.uniqueIps.size,
      consentedCount: d.consentedCount,
    }));

    // Find popular pages
    const pageViews: Record<string, number> = {};
    logs.forEach((log) => {
      pageViews[log.slug] = (pageViews[log.slug] || 0) + 1;
    });

    const popularPages = Object.entries(pageViews)
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const consentRate = totalAccesses > 0 ? Math.round((consentedTotal / totalAccesses) * 100) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalAccesses,
        uniqueVisitors: allUniqueIps.size,
        consentRate,
      },
      dailyStats,
      popularPages,
    });
  } catch (err) {
    console.error('[Analytics API] GET Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve analytics data' }, { status: 500 });
  }
}

function parseUserAgent(ua: string): string {
  if (!ua) return 'Unknown';

  const uaLower = ua.toLowerCase();
  if (uaLower.includes('googlebot')) return 'Googlebot';
  if (uaLower.includes('bingbot')) return 'Bingbot';
  if (uaLower.includes('slurp') || uaLower.includes('yahoo')) return 'Yahoo! Slurp';
  if (uaLower.includes('duckduckbot')) return 'DuckDuckBot';
  if (uaLower.includes('baiduspider')) return 'Baiduspider';
  if (uaLower.includes('yandex')) return 'Yandex Bot';
  if (uaLower.includes('facebot') || uaLower.includes('facebookexternalhit')) return 'Facebook Bot';
  if (uaLower.includes('twitterbot')) return 'Twitter Bot';
  if (uaLower.includes('bot') || uaLower.includes('crawler') || uaLower.includes('spider')) return 'Bot/Crawler';

  let os = 'Unknown OS';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Linux')) os = 'Linux';

  let browser = 'Unknown Browser';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome') || ua.includes('CriOS')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge';

  return `${browser} (${os})`;
}
