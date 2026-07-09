'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface InventoryItem {
  id: string;
  product_id: string;
  sku: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_available: boolean;
  products: { name: string; images: string[] } | null;
}

export default function InventoryRow({ item }: { item: InventoryItem }) {
  const router = useRouter();
  const [stock, setStock] = useState(item.stock_quantity.toString());
  const [threshold, setThreshold] = useState(item.low_stock_threshold.toString());
  const [saving, setSaving] = useState(false);

  const isLow = item.stock_quantity <= item.low_stock_threshold;
  const img = item.products?.images?.[0];

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/inventory/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stock_quantity: parseInt(stock) || 0,
        low_stock_threshold: parseInt(threshold) || 5,
      }),
    });
    setSaving(false);
    if (res.ok) { toast.success('Stock updated'); router.refresh(); }
    else toast.error('Failed to update');
  };

  return (
    <tr className="hover:bg-[#FDF8F4]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {img && (
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#F5EDE5] flex-shrink-0">
              <Image src={img} alt="" width={36} height={36} className="w-full h-full object-cover" />
            </div>
          )}
          <span className="text-sm font-medium text-[#2D1F1A] line-clamp-1">{item.products?.name || 'Unknown'}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-[#7A6A64] font-mono">{item.sku || '—'}</td>
      <td className="px-4 py-3">
        <input
          type="number" min="0" value={stock}
          onChange={e => setStock(e.target.value)}
          className="w-20 h-8 px-2 rounded-lg border border-[#E8DDD6] text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#C4634F]"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number" min="0" value={threshold}
          onChange={e => setThreshold(e.target.value)}
          className="w-20 h-8 px-2 rounded-lg border border-[#E8DDD6] text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#C4634F]"
        />
      </td>
      <td className="px-4 py-3">
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${
          !item.is_available ? 'text-red-500' : isLow ? 'text-amber-600' : 'text-emerald-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${!item.is_available ? 'bg-red-400' : isLow ? 'bg-amber-400' : 'bg-emerald-500'}`} />
          {!item.is_available ? 'Unavailable' : isLow ? 'Low Stock' : 'In Stock'}
        </span>
      </td>
      <td className="px-4 py-3">
        <button onClick={save} disabled={saving}
          className="px-3 py-1.5 bg-[#C4634F] hover:bg-[#a8513f] text-white rounded-lg text-xs font-medium transition-all disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </td>
    </tr>
  );
}
