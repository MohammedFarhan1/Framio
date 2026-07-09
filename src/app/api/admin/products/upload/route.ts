import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

const BUCKET = 'product-images';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('framio_admin')?.value;
  if (!token) return false;
  try { jwt.verify(token, process.env.JWT_SECRET!); return true; } catch { return false; }
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: 'Only JPEG, PNG, WebP, GIF and AVIF images are allowed' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: 'File size must be under 5 MB' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bytes = await file.arrayBuffer();

  const db = adminClient();

  // Create bucket if it doesn't exist yet
  await db.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const { error } = await db.storage
    .from(BUCKET)
    .upload(fileName, Buffer.from(bytes), { contentType: file.type, upsert: false });

  if (error) return Response.json({ error: error.message }, { status: 400 });

  const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(fileName);
  return Response.json({ url: publicUrl });
}
