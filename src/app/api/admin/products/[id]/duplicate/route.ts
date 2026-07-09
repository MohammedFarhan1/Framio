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

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const db = adminClient();

  const { data: original, error: fetchErr } = await db
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr) return Response.json({ error: 'Product not found' }, { status: 404 });

  const { data: variants } = await db
    .from('product_variants')
    .select('*')
    .eq('product_id', id)
    .order('sort_order');

  // Generate unique slug
  const baseSlug = `${original.slug}-copy`;
  let slug = baseSlug;
  let attempt = 0;
  while (attempt < 10) {
    const { data: existing } = await db.from('products').select('id').eq('slug', slug).maybeSingle();
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const { id: _id, created_at, updated_at, ...rest } = original;
  const { data: newProduct, error: insertErr } = await db
    .from('products')
    .insert({ ...rest, name: `${original.name} (Copy)`, slug, status: 'draft' })
    .select('id')
    .single();

  if (insertErr) return Response.json({ error: insertErr.message }, { status: 400 });

  if (variants && variants.length > 0) {
    const newVariants = variants.map(({ id: _vid, product_id, created_at: _ca, ...v }: any) => ({
      ...v, product_id: newProduct.id,
    }));
    await db.from('product_variants').insert(newVariants);
  }

  return Response.json({ id: newProduct.id }, { status: 201 });
}
