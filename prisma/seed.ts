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
        topic: 'others'
      },
      {
        slug: 'hosting-raspberry-pi',
        titleEs: 'Hospedando en casa con Raspberry Pi y Nginx Proxy Manager',
        titleEn: 'Home hosting with Raspberry Pi and Nginx Proxy Manager',
        contentEs: 'En esta guía explico cómo configurar Nginx Proxy Manager para redirigir tráfico de subdominios y subrutas (como /dev) hacia aplicaciones internas en una red local de forma segura.',
        contentEn: 'In this guide I explain how to configure Nginx Proxy Manager to securely route traffic from subdomains and subpaths (like /dev) to internal applications in a local network.',
        published: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        topic: 'home-labbing'
      },
      {
        slug: 'mobile-apps-capacitor',
        titleEs: 'Desarrollo de Apps con Capacitor y Android Studio',
        titleEn: 'App Development with Capacitor and Android Studio',
        contentEs: 'Cómo configurar un entorno de desarrollo eficiente para compilar aplicaciones móviles híbridas utilizando Capacitor y desplegarlas en dispositivos físicos.',
        contentEn: 'How to set up an efficient development environment to compile hybrid mobile applications using Capacitor and deploy them to physical devices.',
        published: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        topic: 'phone-development'
      },
      {
        slug: 'local-llm-ollama',
        titleEs: 'Integrando Modelos de Lenguaje Localmente con Ollama',
        titleEn: 'Integrating Language Models Locally with Ollama',
        contentEs: 'Una guía paso a paso para ejecutar modelos de inteligencia artificial como Llama 3 en tu propio hardware utilizando Ollama y consumiendo su API en Next.js.\n\nAquí tienes un ejemplo de cómo consumir la API de Ollama desde Python:\n\n```python\nimport requests\n\nresponse = requests.post(\n    "http://localhost:11434/api/generate",\n    json={"model": "llama3", "prompt": "Hello!"}\n)\nprint(response.json()["response"])\n```\n\nY aquí tienes cómo estructurar un componente en HTML/Next.js para mostrarlo:\n\n```html\n<div class="p-6 bg-stone-100 rounded-xl shadow-sm border border-stone-200">\n  <h2 class="text-xl font-bold">Ollama Integration</h2>\n  <p class="text-stone-600">Model: Llama 3</p>\n  <button class="px-4 py-2 mt-4 text-white bg-amber-600 hover:bg-amber-700 rounded-lg">\n    Trigger AI\n  </button>\n</div>\n```',
        contentEn: 'A step-by-step guide to running artificial intelligence models like Llama 3 on your own hardware using Ollama and consuming its API in Next.js.\n\nHere is an example of how to consume the Ollama API from Python:\n\n```python\nimport requests\n\nresponse = requests.post(\n    "http://localhost:11434/api/generate",\n    json={"model": "llama3", "prompt": "Hello!"}\n)\nprint(response.json()["response"])\n```\n\nAnd here is how to structure an HTML/Next.js component to display it:\n\n```html\n<div class="p-6 bg-stone-100 rounded-xl shadow-sm border border-stone-200">\n  <h2 class="text-xl font-bold">Ollama Integration</h2>\n  <p class="text-stone-600">Model: Llama 3</p>\n  <button class="px-4 py-2 mt-4 text-white bg-amber-600 hover:bg-amber-700 rounded-lg">\n    Trigger AI\n  </button>\n</div>\n```',
        published: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        topic: 'ai-projects'
      },
      {
        slug: '3d-print-first-layer',
        titleEs: 'Calibración de la Primera Capa en Impresoras 3D FDM',
        titleEn: 'First Layer Calibration in FDM 3D Printers',
        contentEs: 'Consejos prácticos para lograr una adherencia perfecta en la primera capa de tus impresiones 3D, resolviendo problemas de warping y nivelación de la cama.',
        contentEn: 'Practical tips to achieve perfect first-layer adhesion in your 3D prints, solving warping issues and bed leveling.',
        published: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        topic: '3d-printing'
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
