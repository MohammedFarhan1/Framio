import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = db();

  const { data: product, error } = await client
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .eq('is_active', true)
    .single();

  if (error || !product) {
    return Response.json({ error: 'Product not found' }, { status: 404 });
  }

  const { data: variants } = await client
    .from('product_variants')
    .select('*')
    .eq('product_id', id)
    .eq('is_active', true)
    .order('sort_order');

  return Response.json({ ...product, variants: variants ?? [] });
}
