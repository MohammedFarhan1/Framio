import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

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

type BulkAction = 'delete' | 'publish' | 'unpublish' | 'archive' | 'feature' | 'unfeature';

export async function POST(req: NextRequest) {
  if (!await verifyAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, ids }: { action: BulkAction; ids: string[] } = await req.json();
  if (!action || !Array.isArray(ids) || ids.length === 0) {
    return Response.json({ error: 'action and ids are required' }, { status: 400 });
  }

  const db = adminClient();

  if (action === 'delete') {
    const { error } = await db.from('products').delete().in('id', ids);
    if (error) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ success: true, count: ids.length });
  }

  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (action === 'publish')   updates.status   = 'published';
  if (action === 'unpublish') updates.status   = 'draft';
  if (action === 'archive')   updates.status   = 'archived';
  if (action === 'feature')   updates.featured = true;
  if (action === 'unfeature') updates.featured = false;

  const { error } = await db.from('products').update(updates).in('id', ids);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ success: true, count: ids.length });
}
