'use client';

export const dynamic = 'force-dynamic';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Package, Printer, Archive, Truck, Home, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';

interface Order {
  id: string;
  status: string;
  total: number;
  shipping_address: {
    name: string; phone: string; line1: string;
    line2?: string; city: string; state: string; pincode: string;
  };
  estimated_delivery: string | null;
  payment_status: string;
  created_at: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    size: string;
    material: string;
  }>;
}

const STATUS_STEPS = [
  { key: 'processing', label: 'Order Placed', icon: <CheckCircle size={18} /> },
  { key: 'printing',   label: 'Printing',     icon: <Printer size={18} /> },
  { key: 'packed',     label: 'Packed',        icon: <Archive size={18} /> },
  { key: 'shipped',    label: 'Shipped',       icon: <Truck size={18} /> },
  { key: 'delivered',  label: 'Delivered',     icon: <Home size={18} /> },
];

export default function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cod?: string }>;
}) {
  const { id } = use(params);
  const sp = use(searchParams);
  const isCOD = sp.cod === 'true';
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchOrder() {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();
      setOrder(data);
      setLoading(false);
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#C4634F]" />
      </div>
    );
  }

  const currentStep = order
    ? STATUS_STEPS.findIndex(s => s.key === order.status)
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-[#2D1F1A] mb-2">
          {isCOD ? 'Order Confirmed!' : 'Payment Successful!'}
        </h1>
        <p className="text-[#7A6A64] text-lg">
          {isCOD
            ? 'Your order has been placed. Pay when it arrives at your door.'
            : 'Your personalized frame is being prepared with love.'}
        </p>
        <div className="mt-3 inline-block bg-[#F5EDE5] text-[#C4634F] font-mono text-sm font-semibold px-4 py-2 rounded-xl">
          Order ID: #{id.slice(0, 8).toUpperCase()}
        </div>
      </div>

      {/* Order status tracker */}
      <div className="bg-white rounded-2xl border border-[#E8DDD6] p-6 mb-6">
        <h2 className="font-bold text-[#2D1F1A] mb-6">Order Status</h2>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-[#E8DDD6]" />
          <div
            className="absolute top-5 left-5 h-0.5 bg-[#C4634F] transition-all duration-500"
            style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {STATUS_STEPS.map((step, idx) => {
              const done = idx <= currentStep;
              return (
                <div key={step.key} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                    done ? 'bg-[#C4634F] text-white' : 'bg-white border-2 border-[#E8DDD6] text-[#E8DDD6]'
                  }`}>
                    {step.icon}
                  </div>
                  <p className={`text-xs font-medium text-center ${done ? 'text-[#C4634F]' : 'text-[#7A6A64]'}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order details */}
      {order && (
        <>
          <div className="bg-white rounded-2xl border border-[#E8DDD6] p-6 mb-6">
            <h2 className="font-bold text-[#2D1F1A] mb-4">Order Details</h2>
            <div className="space-y-3 mb-4">
              {order.order_items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-[#2D1F1A]">{item.product_name}</p>
                    <p className="text-xs text-[#7A6A64]">{item.size} · {item.material} × {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-[#C4634F]">{formatPrice(item.unit_price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E8DDD6] pt-3 flex justify-between font-bold">
              <span>Total Paid</span>
              <span className="text-[#C4634F]">{formatPrice(order.total)}</span>
            </div>
            {isCOD && (
              <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-xl p-3">
                💳 Payment: Cash on Delivery — please keep exact change ready
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DDD6] p-6 mb-8">
            <h2 className="font-bold text-[#2D1F1A] mb-3">Delivering To</h2>
            <p className="font-medium text-[#2D1F1A]">{order.shipping_address?.name}</p>
            <p className="text-sm text-[#7A6A64]">{order.shipping_address?.line1}</p>
            {order.shipping_address?.line2 && <p className="text-sm text-[#7A6A64]">{order.shipping_address.line2}</p>}
            <p className="text-sm text-[#7A6A64]">{order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}</p>
            <p className="text-sm text-[#7A6A64]">📞 {order.shipping_address?.phone}</p>
            {order.estimated_delivery && (
              <p className="mt-3 text-sm text-emerald-600 font-medium">
                🚚 Estimated delivery: {order.estimated_delivery}
              </p>
            )}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1">
          <Link href="/orders">
            <Package size={16} /> Track Order
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/products">
            Shop More <ArrowRight size={16} />
          </Link>
        </Button>
      </div>

      {/* WhatsApp notification note */}
      <p className="mt-6 text-center text-xs text-[#7A6A64]">
        📱 Order updates will be sent to {order?.shipping_address?.phone} via SMS/WhatsApp
      </p>
    </div>
  );
}
