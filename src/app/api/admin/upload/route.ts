import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { isAdmin } = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Unique filename
    const ext = path.extname(file.name) || '.png';
    const cleanName = path.basename(file.name, ext)
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    const uniqueName = `image_${Date.now()}_${cleanName}${ext}`;

    // Save directory: public/assets/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'assets', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });

    // Save file
    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    const url = `/dev/assets/uploads/${uniqueName}`;
    return NextResponse.json({ success: true, url });
  } catch (err) {
    console.error('[Upload API] POST Error:', err);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { isAdmin } = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'assets', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({ success: true, images: [] });
    }

    const files = fs.readdirSync(uploadDir);
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

    // Sort by newest modified time first
    const sortedImages = files
      .filter(file => allowedExts.includes(path.extname(file).toLowerCase()))
      .map(file => {
        const stats = fs.statSync(path.join(uploadDir, file));
        return {
          url: `/dev/assets/uploads/${file}`,
          mtime: stats.mtimeMs,
        };
      })
      .sort((a, b) => b.mtime - a.mtime)
      .map(item => item.url);

    return NextResponse.json({ success: true, images: sortedImages });
  } catch (err) {
    console.error('[Upload API] GET Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve images' }, { status: 500 });
  }
}
