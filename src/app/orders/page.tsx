'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, getOrderStatusLabel, getOrderStatusStep } from '@/lib/utils';

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_items: Array<{ product_name: string; quantity: number }>;
}

const statusVariant = (s: string): 'default' | 'gold' | 'green' | 'red' | 'subtle' => {
  if (s === 'delivered') return 'green';
  if (s === 'shipped') return 'gold';
  if (s === 'cancelled') return 'red';
  return 'subtle';
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (!u) { setLoading(false); return; }
      const { data } = await supabase
        .from('orders')
        .select('id, status, total, created_at, order_items(product_name, quantity)')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#C4634F]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Package size={56} className="mx-auto mb-5 text-[#E8DDD6]" />
        <h2 className="text-xl font-bold text-[#2D1F1A] mb-3">Sign in to view your orders</h2>
        <p className="text-[#7A6A64] mb-6">Your order history appears here once you're logged in</p>
        <Button asChild><Link href="/auth/login?redirect=/orders">Sign In</Link></Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Package size={56} className="mx-auto mb-5 text-[#E8DDD6]" />
        <h2 className="text-xl font-bold text-[#2D1F1A] mb-3">No orders yet</h2>
        <p className="text-[#7A6A64] mb-6">Your orders will appear here after you place them</p>
        <Button asChild><Link href="/products">Start Shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[#2D1F1A] mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => {
          const step = getOrderStatusStep(order.status);
          return (
            <Link key={order.id} href={`/orders/${order.id}`} className="block group">
              <div className="bg-white rounded-2xl border border-[#E8DDD6] p-5 hover:border-[#C4634F] hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-mono text-xs text-[#7A6A64] mb-1">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-[#7A6A64]">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant(order.status)}>
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                    <span className="font-bold text-[#C4634F]">{formatPrice(order.total)}</span>
                  </div>
                </div>

                <p className="text-sm text-[#2D1F1A] mb-3">
                  {order.order_items?.map((i, idx) => (
                    <span key={idx}>{i.product_name}{idx < order.order_items.length - 1 ? ', ' : ''}</span>
                  ))}
                </p>

                {/* Mini progress bar */}
                <div className="w-full h-1.5 bg-[#F5EDE5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C4634F] rounded-full transition-all"
                    style={{ width: `${((step + 1) / 5) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <p className="text-xs text-[#C4634F] font-medium">{getOrderStatusLabel(order.status)}</p>
                  <ArrowRight size={14} className="text-[#7A6A64] group-hover:text-[#C4634F] transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
