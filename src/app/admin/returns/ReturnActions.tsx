'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ReturnActions({ id, status, orderId }: { id: string; status: string; orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const update = async (newStatus: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/returns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    if (res.ok) { toast.success(`Marked as ${newStatus}`); router.refresh(); }
    else toast.error('Failed to update');
  };

  if (status === 'pending') return (
    <div className="flex gap-1.5">
      <button onClick={() => update('approved')} disabled={loading}
        className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium">
        Approve
      </button>
      <button onClick={() => update('rejected')} disabled={loading}
        className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium">
        Reject
      </button>
    </div>
  );

  if (status === 'approved') return (
    <div className="flex gap-1.5">
      <button onClick={() => update('refunded')} disabled={loading}
        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium">
        Mark Refunded
      </button>
      <a href={`/admin/orders/${orderId}`}
        className="px-2.5 py-1 bg-[#F5EDE5] text-[#7A6A64] hover:bg-[#E8DDD6] rounded-lg text-xs font-medium">
        View Order
      </a>
    </div>
  );

  return (
    <a href={`/admin/orders/${orderId}`}
      className="px-2.5 py-1 bg-[#F5EDE5] text-[#7A6A64] hover:bg-[#E8DDD6] rounded-lg text-xs font-medium">
      View Order
    </a>
  );
}
