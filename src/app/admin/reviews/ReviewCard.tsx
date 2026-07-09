'use client';

import { useState } from 'react';
import { Star, Trash2, Check, Pin } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  is_approved: boolean;
  is_featured: boolean;
  admin_reply: string | null;
  created_at: string;
  products: { name: string; images: string[] } | null;
  profiles: { full_name: string } | null;
}

export default function ReviewCard({ review }: { review: Review }) {
  const router = useRouter();
  const [reply, setReply] = useState(review.admin_reply || '');
  const [showReply, setShowReply] = useState(false);
  const [saving, setSaving] = useState(false);

  const action = async (updates: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/reviews/${review.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) router.refresh();
    else toast.error('Failed to update');
  };

  const saveReply = async () => {
    setSaving(true);
    await action({ admin_reply: reply, admin_reply_at: new Date().toISOString() });
    setSaving(false);
    toast.success('Reply saved');
    setShowReply(false);
  };

  const deleteReview = async () => {
    if (!confirm('Delete this review?')) return;
    const res = await fetch(`/api/admin/reviews/${review.id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Deleted'); router.refresh(); }
    else toast.error('Failed to delete');
  };

  const img = review.products?.images?.[0];

  return (
    <div className="bg-white rounded-2xl border border-[#E8DDD6] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {img && (
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F5EDE5] flex-shrink-0">
              <Image src={img} alt="" width={48} height={48} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-[#2D1F1A]">{review.profiles?.full_name || 'Anonymous'}</span>
              <span className="text-xs text-[#7A6A64]">on</span>
              <span className="text-sm font-medium text-[#C4634F] truncate">{review.products?.name}</span>
            </div>
            <div className="flex gap-0.5 my-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={12} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
              ))}
            </div>
            {review.review_text && <p className="text-sm text-[#7A6A64] mt-1">{review.review_text}</p>}
            {review.admin_reply && (
              <div className="mt-2 pl-3 border-l-2 border-[#C4634F]/30">
                <p className="text-xs font-semibold text-[#C4634F]">Admin Reply</p>
                <p className="text-sm text-[#7A6A64]">{review.admin_reply}</p>
              </div>
            )}
            <p className="text-xs text-[#7A6A64]/60 mt-2">{new Date(review.created_at).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {review.is_featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Featured</span>}
          {review.is_approved && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Approved</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#F5EDE5]">
        {!review.is_approved && (
          <button onClick={() => action({ is_approved: true })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-medium transition-all">
            <Check size={12} /> Approve
          </button>
        )}
        <button onClick={() => action({ is_featured: !review.is_featured })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-medium transition-all">
          <Pin size={12} /> {review.is_featured ? 'Unfeature' : 'Feature'}
        </button>
        <button onClick={() => setShowReply(!showReply)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-all">
          Reply
        </button>
        {review.is_approved && (
          <button onClick={() => action({ is_approved: false })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5EDE5] text-[#7A6A64] hover:bg-[#E8DDD6] rounded-lg text-xs font-medium transition-all">
            Unapprove
          </button>
        )}
        <button onClick={deleteReview}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition-all ml-auto">
          <Trash2 size={12} /> Delete
        </button>
      </div>

      {showReply && (
        <div className="mt-3 flex gap-2">
          <textarea value={reply} onChange={e => setReply(e.target.value)} rows={2}
            placeholder="Write your reply…"
            className="flex-1 px-3 py-2 rounded-xl border border-[#E8DDD6] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#C4634F]" />
          <button onClick={saveReply} disabled={saving}
            className="px-4 py-2 bg-[#C4634F] hover:bg-[#a8513f] text-white rounded-xl text-sm font-medium disabled:opacity-60">
            {saving ? '…' : 'Post'}
          </button>
        </div>
      )}
    </div>
  );
}
