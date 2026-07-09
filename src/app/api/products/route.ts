import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const { data, error } = await db()
    .from('products')
    .select('id, name, slug, base_price, type, photo_slots, images, badge, rating, review_count, occasion, featured, status, is_active')
    .eq('status', 'published')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}
