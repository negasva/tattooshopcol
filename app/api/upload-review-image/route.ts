import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

const REVIEWS_DIR = join(process.cwd(), 'public', 'reviews');

function generateFileName() {
  return `r${randomBytes(4).toString('hex')}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return Response.json({ error: 'No files provided' }, { status: 400 });
    }

    // Create reviews directory if it doesn't exist
    try {
      await mkdir(REVIEWS_DIR, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue;
      }

      const buffer = await file.arrayBuffer();
      const ext = file.type.split('/')[1] || 'jpg';
      const filename = `${generateFileName()}.${ext}`;
      const filepath = join(REVIEWS_DIR, filename);

      await writeFile(filepath, Buffer.from(buffer));
      uploadedFiles.push(`/reviews/${filename}`);
    }

    if (uploadedFiles.length === 0) {
      return Response.json({ error: 'No valid image files' }, { status: 400 });
    }

    return Response.json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
