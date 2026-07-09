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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const db = adminClient();

  const { data: product, error } = await db
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 404 });

  const { data: variants } = await db
    .from('product_variants')
    .select('*')
    .eq('product_id', id)
    .order('sort_order');

  return Response.json({ ...product, variants: variants ?? [] });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { sizes, materials, ...productData } = body;
  const db = adminClient();

  const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
  if ('name'           in productData) updatePayload.name            = productData.name;
  if ('slug'           in productData) updatePayload.slug            = productData.slug;
  if ('description'    in productData) updatePayload.description     = productData.description;
  if ('basePrice'      in productData) updatePayload.base_price      = productData.basePrice;
  if ('status'         in productData) updatePayload.status          = productData.status;
  if ('badge'          in productData) updatePayload.badge           = productData.badge || null;
  if ('type'           in productData) updatePayload.type            = productData.type;
  if ('photoSlots'     in productData) updatePayload.photo_slots     = productData.photoSlots;
  if ('featured'       in productData) updatePayload.featured        = productData.featured;
  if ('isActive'       in productData) updatePayload.is_active       = productData.isActive;
  if ('images'         in productData) updatePayload.images          = productData.images;
  if ('occasions'      in productData) updatePayload.occasion        = productData.occasions;
  if ('seoTitle'       in productData) updatePayload.seo_title       = productData.seoTitle || null;
  if ('seoDescription' in productData) updatePayload.seo_description = productData.seoDescription || null;
  if ('stockQuantity'  in productData) updatePayload.stock_quantity  = productData.stockQuantity;

  const { error: prodErr } = await db.from('products').update(updatePayload).eq('id', id);
  if (prodErr) return Response.json({ error: prodErr.message }, { status: 400 });

  if (sizes !== undefined || materials !== undefined) {
    await db.from('product_variants').delete().eq('product_id', id);

    const variants = [
      ...(sizes ?? []).map((s: any, i: number) => ({
        product_id: id, variant_type: 'size',
        label: s.label, value: s.value,
        price: s.price ?? 0, price_adder: 0,
        stock_quantity: s.stockQuantity ?? 0,
        sort_order: i, is_active: true,
      })),
      ...(materials ?? []).map((m: any, i: number) => ({
        product_id: id, variant_type: 'material',
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
  }

  return Response.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { error } = await adminClient().from('products').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ success: true });
}
