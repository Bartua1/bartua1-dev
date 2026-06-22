import prisma from './prisma';
import { headers } from 'next/headers';

export async function checkIsAdmin(): Promise<{ isAdmin: boolean; clientIp: string }> {
  let clientIp = '127.0.0.1';
  try {
    const headersList = await headers();
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
    console.error('[auth] Failed to retrieve headers:', err);
  }

  const isLocal = clientIp === '127.0.0.1' ||
    clientIp === '::1' ||
    clientIp === 'localhost' ||
    clientIp === '::' ||
    clientIp.endsWith('127.0.0.1') ||
    clientIp.startsWith('::ffff:127.0.0.1');

  if (isLocal) {
    return { isAdmin: true, clientIp };
  }

  // Check custom env fallback
  const adminIpEnv = process.env.ADMIN_IP;
  if (adminIpEnv && clientIp === adminIpEnv) {
    return { isAdmin: true, clientIp };
  }

  // Check the database table AdminIp
  try {
    const dbIp = await prisma.adminIp.findUnique({
      where: { ip: clientIp }
    });
    if (dbIp) {
      return { isAdmin: true, clientIp };
    }
  } catch (err) {
    // Gracefully handle table not existing yet on target deployment (e.g. Raspberry Pi)
    console.error('[auth] Failed to check AdminIp in database:', err);
  }

  return { isAdmin: false, clientIp };
}
