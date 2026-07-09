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

export async function GET(req: NextRequest) {
  if (!await verifyAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const url    = new URL(req.url);
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');

  let query = adminClient()
    .from('products')
    .select(`
      id, name, slug, base_price, status, badge, type, photo_slots,
      rating, review_count, featured, is_active, images, occasion,
      stock_quantity, created_at, updated_at
    `)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!await verifyAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { sizes = [], materials = [], ...productData } = body;
  const db = adminClient();

  const { data: product, error: prodErr } = await db
    .from('products')
    .insert({
      name:            productData.name,
      slug:            productData.slug,
      description:     productData.description,
      base_price:      productData.basePrice ?? 0,
      status:          productData.status ?? 'draft',
      badge:           productData.badge || null,
      type:            productData.type ?? 'single',
      photo_slots:     productData.photoSlots ?? 1,
      featured:        productData.featured ?? false,
      is_active:       productData.isActive ?? true,
      images:          productData.images ?? [],
      occasion:        productData.occasions ?? [],
      seo_title:       productData.seoTitle || null,
      seo_description: productData.seoDescription || null,
      stock_quantity:  productData.stockQuantity ?? 0,
    })
    .select('id')
    .single();

  if (prodErr) return Response.json({ error: prodErr.message }, { status: 400 });

  const productId = product.id;
  const variants = [
    ...sizes.map((s: any, i: number) => ({
      product_id: productId, variant_type: 'size',
      label: s.label, value: s.value,
      price: s.price ?? 0, price_adder: 0,
      stock_quantity: s.stockQuantity ?? 0,
      sort_order: i, is_active: true,
    })),
    ...materials.map((m: any, i: number) => ({
      product_id: productId, variant_type: 'material',
      label: m.label, value: m.value,
      price: 0, price_adder: m.priceAdder ?? 0,
      color: m.color || null,
      stock_quantity: 0,
      sort_order: i, is_active: true,
    })),
  ];

  if (variants.length > 0) {
    const { error: varErr } = await db.from('product_variants').insert(variants);
    if (varErr) return Response.json({ error: varErr.message }, { status: 400 });
  }

  return Response.json({ id: productId }, { status: 201 });
}
