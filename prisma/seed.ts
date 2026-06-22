import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear any existing posts to avoid unique constraint violations on slug
  await prisma.post.deleteMany({});
  
  await prisma.post.createMany({
    data: [
      {
        slug: 'first-post',
        titleEs: 'Iniciando mi Blog con Next.js y SQLite',
        titleEn: 'Starting my Blog with Next.js and SQLite',
        contentEs: '¡Bienvenidos! Este es mi primer artículo en este nuevo blog autohospedado en mi Raspberry Pi. He configurado Next.js con soporte multiidioma, Tailwind CSS v4, y SQLite administrado mediante Prisma.',
        contentEn: 'Welcome! This is my first article on this new self-hosted blog running on my Raspberry Pi. I configured Next.js with multi-language support, Tailwind CSS v4, and SQLite managed via Prisma.',
        published: true,
        createdAt: new Date(),
      },
      {
        slug: 'hosting-raspberry-pi',
        titleEs: 'Hospedando en casa con Raspberry Pi y Nginx Proxy Manager',
        titleEn: 'Home hosting with Raspberry Pi and Nginx Proxy Manager',
        contentEs: 'En esta guía explico cómo configurar Nginx Proxy Manager para redirigir tráfico de subdominios y subrutas (como /dev) hacia aplicaciones internas en una red local de forma segura.',
        contentEn: 'In this guide I explain how to configure Nginx Proxy Manager to securely route traffic from subdomains and subpaths (like /dev) to internal applications in a local network.',
        published: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      }
    ]
  });

  console.log('Seeded database successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
