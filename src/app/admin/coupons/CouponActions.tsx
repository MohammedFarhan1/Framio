'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CouponActions({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    });
    setLoading(false);
    if (res.ok) { toast.success(isActive ? 'Coupon deactivated' : 'Coupon activated'); router.refresh(); }
    else toast.error('Failed to update');
  };

  const deleteCoupon = async () => {
    if (!confirm('Delete this coupon?')) return;
    setLoading(true);
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
    setLoading(false);
    if (res.ok) { toast.success('Coupon deleted'); router.refresh(); }
    else toast.error('Failed to delete');
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={toggle} disabled={loading}
        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
      <button onClick={deleteCoupon} disabled={loading}
        className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#7A6A64] hover:bg-red-50 hover:text-red-600 transition-all">
        Delete
      </button>
    </div>
  );
}
