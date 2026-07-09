'use client';

export const dynamic = 'force-dynamic';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Printer, Archive, Truck, Home, Loader2, ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, getOrderStatusLabel, getOrderStatusStep } from '@/lib/utils';

interface OrderDetail {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  shipping_address: {
    name: string; phone: string; line1: string;
    line2?: string; city: string; state: string; pincode: string;
  };
  estimated_delivery: string | null;
  payment_status: string;
  razorpay_payment_id: string | null;
  created_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    size: string;
    material: string;
    custom_text: { text: string; font: string; color: string } | null;
    preview_url: string | null;
    custom_photo_url: string | null;
  }>;
}

const STEPS = [
  { key: 'processing', label: 'Order Placed',  icon: <CheckCircle size={16} />, desc: 'We received your order' },
  { key: 'printing',   label: 'Printing',       icon: <Printer size={16} />,     desc: 'Your frame is being printed' },
  { key: 'packed',     label: 'Packed',          icon: <Archive size={16} />,     desc: 'Safely packed for delivery' },
  { key: 'shipped',    label: 'Shipped',         icon: <Truck size={16} />,       desc: 'On the way to you' },
  { key: 'delivered',  label: 'Delivered',       icon: <Home size={16} />,        desc: 'Arrived at your door!' },
];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();
      setOrder(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#C4634F]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-xl font-bold text-[#2D1F1A] mb-3">Order not found</h2>
        <Button asChild variant="outline"><Link href="/orders">My Orders</Link></Button>
      </div>
    );
  }

  const currentStep = getOrderStatusStep(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/orders" className="flex items-center gap-2 text-sm text-[#7A6A64] hover:text-[#C4634F] mb-6 transition-colors">
        <ArrowLeft size={14} /> All Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D1F1A]">Order #{id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-[#7A6A64] text-sm mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Badge variant={order.status === 'delivered' ? 'green' : order.status === 'shipped' ? 'gold' : 'subtle'}>
          {getOrderStatusLabel(order.status)}
        </Badge>
      </div>

      {/* Tracker */}
      <div className="bg-white rounded-2xl border border-[#E8DDD6] p-6 mb-5">
        <h2 className="font-bold text-[#2D1F1A] mb-5">Tracking</h2>
        <div className="space-y-4">
          {STEPS.map((step, idx) => {
            const done = idx <= currentStep;
            const current = idx === currentStep;
            return (
              <div key={step.key} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done ? 'bg-[#C4634F] text-white' : 'bg-[#F5EDE5] text-[#E8DDD6]'
                }`}>
                  {step.icon}
                </div>
                <div className="flex-1 pt-1">
                  <p className={`text-sm font-semibold ${done ? 'text-[#2D1F1A]' : 'text-[#E8DDD6]'}`}>
                    {step.label}
                    {current && <span className="ml-2 text-xs text-[#C4634F] font-normal">← Current</span>}
                  </p>
                  <p className={`text-xs ${done ? 'text-[#7A6A64]' : 'text-[#E8DDD6]'}`}>{step.desc}</p>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`absolute left-8 w-0.5 h-4 ${done && idx < currentStep ? 'bg-[#C4634F]' : 'bg-[#E8DDD6]'}`} />
                )}
              </div>
            );
          })}
        </div>
        {order.estimated_delivery && (
          <div className="mt-5 p-3 bg-emerald-50 rounded-xl">
            <p className="text-sm text-emerald-700 font-medium">
              🚚 Estimated delivery: {order.estimated_delivery}
            </p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-[#E8DDD6] p-6 mb-5">
        <h2 className="font-bold text-[#2D1F1A] mb-4">Items Ordered</h2>
        <div className="space-y-4">
          {order.order_items.map(item => (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#F5EDE5] overflow-hidden flex-shrink-0 flex items-center justify-center">
                {item.preview_url || item.custom_photo_url ? (
                  <img src={item.preview_url || item.custom_photo_url!} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={20} className="text-[#7A6A64]/40" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#2D1F1A]">{item.product_name}</p>
                <p className="text-xs text-[#7A6A64]">{item.size} · {item.material} · Qty {item.quantity}</p>
                {item.custom_text?.text && (
                  <p className="text-xs text-[#7A6A64] italic">Text: &ldquo;{item.custom_text.text}&rdquo;</p>
                )}
              </div>
              <p className="font-semibold text-[#C4634F]">{formatPrice(item.unit_price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-[#E8DDD6] mt-4 pt-4 space-y-2">
          {order.subtotal && (
            <div className="flex justify-between text-sm text-[#7A6A64]">
              <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
            </div>
          )}
          {order.shipping_fee !== null && (
            <div className="flex justify-between text-sm text-[#7A6A64]">
              <span>Shipping</span>
              <span className={order.shipping_fee === 0 ? 'text-emerald-600' : ''}>{order.shipping_fee === 0 ? 'FREE' : formatPrice(order.shipping_fee)}</span>
            </div>
          )}
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Discount</span><span>-{formatPrice(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-[#2D1F1A] border-t border-[#E8DDD6] pt-2">
            <span>Total</span>
            <span className="text-[#C4634F]">{formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between text-xs text-[#7A6A64]">
            <span>Payment</span>
            <span className={`capitalize ${order.payment_status === 'paid' ? 'text-emerald-600 font-medium' : ''}`}>
              {order.payment_status === 'paid' ? '✓ Paid' : order.payment_status}
              {order.razorpay_payment_id && ` · ${order.razorpay_payment_id.slice(-8)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery address */}
      <div className="bg-white rounded-2xl border border-[#E8DDD6] p-6 mb-6">
        <h2 className="font-bold text-[#2D1F1A] mb-3">Delivery Address</h2>
        <p className="font-medium text-[#2D1F1A]">{order.shipping_address?.name}</p>
        <p className="text-sm text-[#7A6A64]">{order.shipping_address?.line1}</p>
        {order.shipping_address?.line2 && <p className="text-sm text-[#7A6A64]">{order.shipping_address.line2}</p>}
        <p className="text-sm text-[#7A6A64]">{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}</p>
        <p className="text-sm text-[#7A6A64]">📞 {order.shipping_address?.phone}</p>
      </div>

      <Button asChild variant="outline" className="w-full">
        <Link href="/products">Order Another Frame</Link>
      </Button>
    </div>
  );
}
