import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ProductForm, { type ProductFormData } from '../../ProductForm';

export const runtime = 'nodejs';

async function getData(id: string) {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const [{ data: product }, { data: variants }] = await Promise.all([
    db.from('products').select('*').eq('id', id).single(),
    db.from('product_variants').select('*').eq('product_id', id).order('sort_order'),
  ]);
  return { product, variants: variants ?? [] };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { product, variants } = await getData(id);

  if (!product) notFound();

  const sizes = variants
    .filter((v: any) => v.variant_type === 'size')
    .map((v: any) => ({ id: v.id, label: v.label, value: v.value, price: v.price, stockQuantity: v.stock_quantity }));

  const materials = variants
    .filter((v: any) => v.variant_type === 'material')
    .map((v: any) => ({ id: v.id, label: v.label, value: v.value, priceAdder: v.price_adder, color: v.color ?? '#888888' }));

  const initialData: Partial<ProductFormData> = {
    name:            product.name,
    slug:            product.slug,
    description:     product.description ?? '',
    type:            product.type ?? 'single',
    photoSlots:      product.photo_slots ?? 1,
    occasions:       product.occasion ?? [],
    basePrice:       product.base_price,
    stockQuantity:   product.stock_quantity ?? 0,
    sizes,
    materials,
    images:          product.images ?? [],
    seoTitle:        product.seo_title ?? '',
    seoDescription:  product.seo_description ?? '',
    status:          product.status ?? 'draft',
    badge:           product.badge ?? '',
    featured:        product.featured ?? false,
    isActive:        product.is_active ?? true,
  };

  return <ProductForm initialData={initialData} productId={id} />;
}
