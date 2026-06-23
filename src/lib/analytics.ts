import { cookies, headers } from 'next/headers';
import prisma from './prisma';
import { checkIsAdmin } from './auth';

export async function trackVisit(slug: string) {
  let clientIp = '127.0.0.1';
  let userAgent = '';
  let hasConsent = false;
  let isAdmin = false;

  // 1. Resolve client IP and User Agent from headers
  try {
    const headersList = await headers();
    userAgent = headersList.get('user-agent') || '';

    const xForwardedFor = headersList.get('x-forwarded-for');
    if (xForwardedFor) {
      clientIp = xForwardedFor.split(',')[0].trim();
    } else {
      const realIp = headersList.get('x-real-ip');
      if (realIp) {
        clientIp = realIp;
      }
    }
  } catch (err) {
    console.error('[Analytics] Failed to retrieve request headers:', err);
  }

  // 2. Verify admin bypass so admin actions don't pollute statistics
  try {
    const authResult = await checkIsAdmin();
    isAdmin = authResult.isAdmin;
  } catch (err) {
    console.error('[Analytics] Failed to verify admin status:', err);
  }

  if (isAdmin) {
    return; // Do not log admin visits
  }

  // 3. Check privacy consent preference from cookies
  try {
    const cookieStore = await cookies();
    hasConsent = cookieStore.get('privacy-consent')?.value === 'true';
  } catch {
    // Gracefully handle build time / context without cookie support
    console.log('[Analytics] Cookies not available (likely static build phase)');
  }

  // 4. Anonymize/Mask IP if they have not explicitly consented
  const finalIp = hasConsent ? clientIp : maskIp(clientIp);

  // 5. Write log entry to SQLite database via Prisma
  try {
    await prisma.analytics.create({
      data: {
        slug,
        ip: finalIp,
        userAgent,
        country: null, // Optional for future geolookup
      },
    });
  } catch (err) {
    console.error('[Analytics] Failed to save view to database:', err);
  }
}

/**
 * Anonymizes/masks the IP address to comply with GDPR/privacy principles
 * when explicit consent is not present.
 */
function maskIp(ip: string): string {
  if (!ip) return 'xxx.xxx.xxx.xxx';
  
  // IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 3) {
      return `${parts.slice(0, 3).join(':')}:xxxx:xxxx:xxxx:xxxx:xxxx`;
    }
    return 'xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx';
  }

  // IPv4
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  return 'xxx.xxx.xxx.xxx';
}
