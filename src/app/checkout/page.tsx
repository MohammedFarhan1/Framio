'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice, getEstimatedDelivery } from '@/lib/utils';
import {
  Shield, Lock, Loader2, CreditCard, Smartphone, Building,
  LogIn, UserPlus, Check, ChevronRight, MapPin, Tag,
  Pencil, Truck, Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void };
  }
}
interface RazorpayOptions {
  key: string; amount: number; currency: string; name: string;
  description: string; order_id: string;
  handler: (r: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  notes: Record<string, string>;
  theme: { color: string };
  modal: { ondismiss: () => void };
}
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const INDIAN_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry'];

const STEP_LABELS = ['Address', 'Payment', 'Summary', 'Pay'] as const;

/* ── Mobile progress bar ─────────────────────────────────────────── */
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center mb-8 select-none">
      {STEP_LABELS.map((label, idx) => {
        const num  = idx + 1;
        const done   = step > num;
        const active = step === num;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                done   ? 'bg-emerald-500 text-white' :
                active ? 'bg-[#C4634F] text-white' :
                         'bg-[#E8DDD6] text-[#7A6A64]'
              }`}>
                {done ? <Check size={14} /> : num}
              </div>
              <span className={`text-xs font-medium ${
                active ? 'text-[#C4634F]' : done ? 'text-emerald-600' : 'text-[#7A6A64]'
              }`}>{label}</span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div className={`h-0.5 w-10 mx-2 mb-4 rounded-full transition-colors ${
                step > num ? 'bg-emerald-500' : 'bg-[#E8DDD6]'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const router   = useRouter();
  const supabase = createClient();

  const [authUser,    setAuthUser]    = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* shared form state */
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    line1: '', line2: '', city: '', state: 'Maharashtra', pincode: '',
  });
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [coupon,        setCoupon]        = useState('');
  const [discount,      setDiscount]      = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [loading,       setLoading]       = useState(false);

  /* mobile wizard step */
  const [step, setStep] = useState(1);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthUser(user);
      setAuthLoading(false);
      if (user) {
        const meta = user.user_metadata ?? {};
        setForm(prev => ({
          ...prev,
          email: user.email ?? prev.email,
          name:  meta.full_name ?? meta.name ?? prev.name,
        }));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sub            = subtotal();
  const shipping       = sub >= 999 ? 0 : 99;
  const discountAmount = Math.round(sub * discount / 100);
  const total          = sub + shipping - discountAmount;
  const deliveryDate   = form.pincode.length === 6 ? getEstimatedDelivery(form.pincode) : null;

  const f = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }));
      setErrors(prev => ({ ...prev, [key]: '' }));
    };

  const validateAddress = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())                               e.name    = 'Full name is required';
    if (!/^[6-9]\d{9}$/.test(form.phone))               e.phone   = 'Enter a valid 10-digit mobile number';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email   = 'Enter a valid email';
    if (!form.line1.trim())                              e.line1   = 'Address is required';
    if (!form.city.trim())                               e.city    = 'City is required';
    if (!form.state)                                     e.state   = 'State is required';
    if (!/^\d{6}$/.test(form.pincode))                  e.pincode = 'Enter a valid 6-digit PIN code';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    const { data } = await supabase
      .from('discount_codes').select('*')
      .eq('code', coupon.toUpperCase()).eq('is_active', true).single();
    if (!data) { toast.error('Invalid or expired coupon code'); return; }
    if (data.valid_until && new Date(data.valid_until) < new Date()) { toast.error('Coupon has expired'); return; }
    if (data.min_order_amount && sub < data.min_order_amount) {
      toast.error(`Minimum order ₹${data.min_order_amount} required`); return;
    }
    if (data.type === 'percentage') {
      setDiscount(data.value); toast.success(`${data.value}% discount applied!`);
    } else {
      setDiscount(0); toast.success(`₹${data.value} discount applied!`);
    }
    setCouponApplied(coupon.toUpperCase());
  };

  const saveOrder = async (paymentId: string, razorpayOrderId: string, signature: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: order, error } = await supabase.from('orders').insert({
      user_id: user?.id || null, guest_email: form.email || null,
      status: 'processing', total, subtotal: sub, shipping_fee: shipping,
      discount_amount: discountAmount,
      shipping_address: { name: form.name, phone: form.phone, line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode },
      razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId,
      razorpay_signature: signature, payment_status: 'paid',
      coupon_code: couponApplied || null, estimated_delivery: deliveryDate,
    }).select('id').single();
    if (error || !order) throw new Error('Failed to save order');
    await supabase.from('order_items').insert(
      items.map(item => ({
        order_id: order.id, product_id: item.product.id, product_name: item.product.name,
        quantity: item.quantity, unit_price: item.unitPrice,
        size: item.selectedSize, material: item.selectedMaterial,
      }))
    );
    return order.id;
  };

  const handleRazorpay = async () => {
    setLoading(true);
    try {
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = () => resolve(); s.onerror = () => reject();
          document.body.appendChild(s);
        });
      }
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });
      const { orderId, keyId, error } = await res.json();
      if (error) throw new Error(error);
      new window.Razorpay({
        key: keyId, amount: total * 100, currency: 'INR',
        name: 'Framio', description: 'Personalized Photo Frame', order_id: orderId,
        handler: async (response) => {
          try {
            const v = await fetch('/api/razorpay/verify', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId:   response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const { verified } = await v.json();
            if (!verified) throw new Error('Verification failed');
            const oid = await saveOrder(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
            clearCart();
            router.push(`/order-confirmation/${oid}`);
          } catch { toast.error('Order save failed. Please contact support.'); }
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        notes: { address: `${form.line1}, ${form.city}`, pincode: form.pincode },
        theme: { color: '#C4634F' },
        modal: { ondismiss: () => { setLoading(false); toast.error('Payment cancelled'); } },
      }).open();
    } catch {
      toast.error('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const handleCOD = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user?.id || null, guest_email: form.email || null,
        status: 'processing', total, subtotal: sub, shipping_fee: shipping,
        discount_amount: discountAmount,
        shipping_address: { name: form.name, phone: form.phone, line1: form.line1, line2: form.line2, city: form.city, state: form.state, pincode: form.pincode },
        payment_status: 'pending', coupon_code: couponApplied || null, estimated_delivery: deliveryDate,
      }).select('id').single();
      if (error || !order) throw new Error('Order failed');
      await supabase.from('order_items').insert(
        items.map(item => ({
          order_id: order.id, product_id: item.product.id, product_name: item.product.name,
          quantity: item.quantity, unit_price: item.unitPrice,
          size: item.selectedSize, material: item.selectedMaterial,
        }))
      );
      clearCart();
      router.push(`/order-confirmation/${order.id}?cod=true`);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* desktop: validate then pay */
  const handleDesktopPay = () => {
    if (!validateAddress()) {
      document.getElementById('checkout-address')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (paymentMethod === 'razorpay') handleRazorpay();
    else handleCOD();
  };

  /* ── Guards ──────────────────────────────────────────────────── */
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-[#C4634F]" />
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-[#E8DDD6] p-8 shadow-sm">
          <div className="w-16 h-16 bg-[#F5EDE5] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock size={28} className="text-[#C4634F]" />
          </div>
          <h2 className="text-2xl font-bold text-[#2D1F1A] mb-2">Sign in to checkout</h2>
          <p className="text-[#7A6A64] text-sm mb-8 leading-relaxed">
            Create an account or sign in to place your order,<br />
            track delivery, and manage your purchases.
          </p>
          <div className="space-y-3">
            <Button size="lg" className="w-full" asChild>
              <Link href="/auth/login?redirect=/checkout"><LogIn size={16} className="mr-2" />Sign In</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full" asChild>
              <Link href="/auth/signup?redirect=/checkout"><UserPlus size={16} className="mr-2" />Create Account</Link>
            </Button>
          </div>
          <div className="mt-6 pt-5 border-t border-[#E8DDD6] flex items-center justify-center gap-2 text-xs text-[#7A6A64]">
            <Shield size={12} className="text-[#C4634F]" />
            Your cart is saved — it will be waiting after you sign in.
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <h2 className="text-xl font-bold text-[#2D1F1A] mb-3">No items to checkout</h2>
        <Button asChild><Link href="/products">Shop Now</Link></Button>
      </div>
    );
  }

  /* ── Shared form blocks (used in both layouts) ───────────────── */
  const addressForm = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input label="Full Name *" placeholder="Priya Sharma" value={form.name} onChange={f('name')} error={errors.name} />
      <Input label="Mobile Number *" placeholder="9876543210" type="tel" maxLength={10} value={form.phone} onChange={f('phone')} error={errors.phone} />
      <Input label="Email (optional)" placeholder="you@email.com" type="email" value={form.email} onChange={f('email')} error={errors.email} className="sm:col-span-2" />
      <Input label="Address Line 1 *" placeholder="Flat / House No., Street" value={form.line1} onChange={f('line1')} error={errors.line1} className="sm:col-span-2" />
      <Input label="Address Line 2" placeholder="Landmark, Area (optional)" value={form.line2} onChange={f('line2')} />
      <Input label="City *" placeholder="Mumbai" value={form.city} onChange={f('city')} error={errors.city} />
      <div>
        <label className="block text-sm font-medium text-[#2D1F1A] mb-1.5">State *</label>
        <select value={form.state} onChange={f('state')} className="flex h-11 w-full rounded-xl border border-[#E8DDD6] bg-white px-4 text-sm text-[#2D1F1A] focus:outline-none focus:ring-2 focus:ring-[#C4634F] focus:border-transparent transition-all">
          {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
        </select>
        {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
      </div>
      <div>
        <Input label="PIN Code *" placeholder="400001" type="tel" maxLength={6} value={form.pincode} onChange={f('pincode')} error={errors.pincode} />
        {deliveryDate && <p className="mt-1 text-xs text-emerald-600 font-medium">🚚 Estimated delivery: {deliveryDate}</p>}
      </div>
    </div>
  );

  const paymentOptions = (
    <div className="space-y-3">
      {([
        { value: 'razorpay' as const, label: 'Pay Online (Recommended)', sub: 'UPI · Cards · Net Banking · Wallets', icon: <Lock size={14} className="text-[#C4634F]" /> },
        { value: 'cod'      as const, label: 'Cash on Delivery',         sub: 'Pay when your frame arrives at your door', icon: <Package size={14} className="text-[#C9A84C]" /> },
      ]).map(opt => (
        <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
          paymentMethod === opt.value ? 'border-[#C4634F] bg-[#C4634F]/5' : 'border-[#E8DDD6] hover:border-[#C4634F]/40'
        }`}>
          <input type="radio" value={opt.value} className="accent-[#C4634F]"
            checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 font-semibold text-[#2D1F1A] text-sm mb-0.5">{opt.icon}{opt.label}</div>
            <p className="text-xs text-[#7A6A64]">{opt.sub}</p>
          </div>
          {opt.value === 'razorpay' && (
            <div className="flex gap-2 flex-shrink-0">
              <CreditCard size={16} className="text-[#7A6A64]" />
              <Smartphone size={16} className="text-[#7A6A64]" />
              <Building size={16} className="text-[#7A6A64]" />
            </div>
          )}
        </label>
      ))}
    </div>
  );

  /* ── Mobile step content ─────────────────────────────────────── */
  const card = (title: string, children: React.ReactNode) => (
    <div className="bg-white rounded-2xl border border-[#E8DDD6] p-6">
      <h2 className="text-lg font-bold text-[#2D1F1A] mb-6">{title}</h2>
      {children}
    </div>
  );

  const mobileSteps = [
    /* 1 */ card('Shipping Address', addressForm),

    /* 2 */ card('Payment Method', (
      <>
        {paymentOptions}
        <p className="flex items-center gap-2 text-xs text-[#7A6A64] mt-3">
          <Shield size={12} className="text-[#C4634F]" />
          All payments are 256-bit encrypted and processed securely via Razorpay.
        </p>
      </>
    )),

    /* 3 */ card('Order Summary', (
      <div className="space-y-6">
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 py-3 border-b border-[#E8DDD6] last:border-0">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-[3px] relative bg-[#F5EDE5]"
                style={{ borderColor: item.materialColor || '#5C3D2E' }}>
                {item.product.images?.[0] && <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="56px" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#2D1F1A] text-sm leading-tight">{item.product.name}</p>
                <p className="text-xs text-[#7A6A64] mt-0.5">{[item.selectedSizeLabel, item.selectedMaterialLabel].filter(Boolean).join(' · ')}</p>
                <p className="text-xs text-[#7A6A64] mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-[#C4634F] text-sm flex-shrink-0">{formatPrice(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#7A6A64] uppercase tracking-wider mb-2">
            <Tag size={12} className="inline mr-1" />Coupon Code
          </label>
          <div className="flex gap-2">
            <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter coupon code"
              disabled={!!couponApplied}
              className="flex-1 h-10 px-3 rounded-xl border border-[#E8DDD6] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4634F] disabled:opacity-50" />
            <Button size="sm" variant="outline" onClick={applyCoupon} disabled={!!couponApplied}>
              {couponApplied ? <><Check size={12} /> Applied</> : 'Apply'}
            </Button>
          </div>
          {couponApplied && <p className="text-xs text-emerald-600 mt-1 font-medium">Coupon {couponApplied} applied!</p>}
        </div>
        <div className="bg-[#F5EDE5] rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-[#7A6A64]">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span className="font-medium text-[#2D1F1A]">{formatPrice(sub)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#7A6A64]">Shipping</span>
            <span className={shipping === 0 ? 'text-emerald-600 font-medium' : 'text-[#2D1F1A] font-medium'}>
              {shipping === 0 ? 'FREE' : formatPrice(shipping)}
            </span>
          </div>
          {sub < 999 && <p className="text-xs text-[#7A6A64]">Add {formatPrice(999 - sub)} more for free shipping</p>}
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Coupon discount</span><span>−{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="border-t border-[#E8DDD6] pt-2.5 flex justify-between">
            <span className="font-bold text-[#2D1F1A]">Total (incl. taxes)</span>
            <span className="font-bold text-[#C4634F] text-lg">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    )),

    /* 4 */ (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-[#E8DDD6] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#2D1F1A]">
              <MapPin size={15} className="text-[#C4634F]" /> Delivering to
            </div>
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-[#C4634F] font-semibold hover:underline">
              <Pencil size={11} /> Edit
            </button>
          </div>
          <p className="text-sm text-[#2D1F1A] font-medium">{form.name} · {form.phone}</p>
          <p className="text-sm text-[#7A6A64]">{form.line1}{form.line2 ? `, ${form.line2}` : ''}</p>
          <p className="text-sm text-[#7A6A64]">{form.city}, {form.state} — {form.pincode}</p>
          {deliveryDate && <p className="text-xs text-emerald-600 mt-1 font-medium">🚚 {deliveryDate}</p>}
        </div>
        <div className="bg-white rounded-2xl border border-[#E8DDD6] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#2D1F1A]">
              <CreditCard size={15} className="text-[#C4634F]" /> Payment
            </div>
            <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-[#C4634F] font-semibold hover:underline">
              <Pencil size={11} /> Edit
            </button>
          </div>
          <p className="text-sm text-[#2D1F1A]">
            {paymentMethod === 'razorpay' ? '💳 Pay Online via Razorpay' : '💵 Cash on Delivery'}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8DDD6] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-[#2D1F1A]">
              Order · {items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
            </span>
            <button onClick={() => setStep(3)} className="flex items-center gap-1 text-xs text-[#C4634F] font-semibold hover:underline">
              <Pencil size={11} /> Edit
            </button>
          </div>
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg border-2 bg-[#F5EDE5] overflow-hidden flex-shrink-0 relative"
                  style={{ borderColor: item.materialColor || '#5C3D2E' }}>
                  {item.product.images?.[0] && <Image src={item.product.images[0]} alt="" fill className="object-cover" sizes="32px" />}
                </div>
                <p className="text-xs text-[#2D1F1A] truncate">{item.product.name} × {item.quantity}</p>
              </div>
              <p className="text-xs font-semibold text-[#C4634F] flex-shrink-0">{formatPrice(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-[#E8DDD6] space-y-1.5">
            <div className="flex justify-between text-xs text-[#7A6A64]"><span>Subtotal</span><span>{formatPrice(sub)}</span></div>
            <div className="flex justify-between text-xs text-[#7A6A64]">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600"><span>Discount</span><span>−{formatPrice(discountAmount)}</span></div>
            )}
            <div className="flex justify-between font-bold text-[#2D1F1A] text-sm pt-1 border-t border-[#E8DDD6]">
              <span>Total</span><span className="text-[#C4634F]">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
        <Button onClick={paymentMethod === 'razorpay' ? handleRazorpay : handleCOD}
          disabled={loading} size="lg" className="w-full text-base">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Processing…</> :
           paymentMethod === 'razorpay' ? <><Lock size={16} /> Pay {formatPrice(total)} Securely</> :
           <>Confirm Order · {formatPrice(total)}</>}
        </Button>
        <p className="flex items-center justify-center gap-2 text-xs text-[#7A6A64]">
          <Shield size={12} className="text-[#C4634F]" /> 100% Secure · Encrypted · Powered by Razorpay
        </p>
      </div>
    ),
  ];

  const mobileNextLabel =
    step === 1 ? 'Continue to Payment' :
    step === 2 ? 'Continue to Summary' :
    step === 3 ? 'Review Order' : '';

  const handleMobileNext = () => {
    if (step === 1 && !validateAddress()) return;
    setStep(s => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[#2D1F1A] mb-8">Checkout</h1>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE — 4-step wizard (hidden on lg+)
      ══════════════════════════════════════════════════════════════ */}
      <div className="block lg:hidden max-w-2xl mx-auto">
        <ProgressBar step={step} />

        {mobileSteps[step - 1]}

        {step < 4 && (
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <Button variant="outline" onClick={() => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-28">
                Back
              </Button>
            )}
            <Button onClick={handleMobileNext} className="flex-1" size="lg">
              {mobileNextLabel} <ChevronRight size={16} />
            </Button>
          </div>
        )}
        {step === 4 && (
          <Button variant="outline" onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full mt-3">
            Back to Summary
          </Button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP — single-page 2-column layout (hidden below lg)
      ══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-8">

        {/* Left: form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Delivery address */}
          <div id="checkout-address" className="bg-white rounded-2xl border border-[#E8DDD6] p-6">
            <h2 className="font-bold text-[#2D1F1A] text-lg mb-5">Delivery Address</h2>
            {addressForm}
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl border border-[#E8DDD6] p-6">
            <h2 className="font-bold text-[#2D1F1A] text-lg mb-5">Payment Method</h2>
            {paymentOptions}
          </div>
        </div>

        {/* Right: sticky order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#E8DDD6] p-5 sticky top-20">
            <h2 className="font-bold text-[#2D1F1A] text-lg mb-4">Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F5EDE5] overflow-hidden flex-shrink-0 border-2 relative"
                    style={{ borderColor: item.materialColor || '#5C3D2E' }}>
                    {item.product.images?.[0] && <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2D1F1A] truncate">{item.product.name}</p>
                    <p className="text-xs text-[#7A6A64]">
                      {item.selectedSizeLabel}{item.selectedSizeLabel && item.selectedMaterialLabel ? ' · ' : ''}{item.selectedMaterialLabel} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#C4634F]">{formatPrice(item.unitPrice * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Coupon code"
                  disabled={!!couponApplied}
                  className="flex-1 h-9 px-3 rounded-xl border border-[#E8DDD6] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4634F] disabled:opacity-50" />
                <Button size="sm" variant="outline" onClick={applyCoupon} disabled={!!couponApplied}>
                  {couponApplied ? '✓' : 'Apply'}
                </Button>
              </div>
              {couponApplied && <p className="text-xs text-emerald-600 mt-1 font-medium">Coupon {couponApplied} applied!</p>}
            </div>

            {/* Totals */}
            <div className="space-y-2.5 border-t border-[#E8DDD6] pt-4 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-[#7A6A64]">Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#7A6A64]">Shipping</span>
                <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span><span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[#2D1F1A] text-base border-t border-[#E8DDD6] pt-2.5">
                <span>Total</span>
                <span className="text-[#C4634F]">{formatPrice(total)}</span>
              </div>
            </div>

            <Button onClick={handleDesktopPay} disabled={loading} className="w-full" size="lg">
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Processing...</>
              ) : paymentMethod === 'razorpay' ? (
                <><Lock size={16} /> Pay {formatPrice(total)} Securely</>
              ) : (
                <>Confirm COD Order ({formatPrice(total)})</>
              )}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#7A6A64]">
              <Shield size={12} className="text-[#C4634F]" />
              100% Secure · Powered by Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
