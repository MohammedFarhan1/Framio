'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Password updated successfully!');
    router.replace('/account');
  };

  return (
    <div className="min-h-screen bg-[#F5EDE5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-[#C4634F] rounded-2xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-2xl font-bold text-[#2D1F1A]">Framio</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#2D1F1A]">Set new password</h1>
          <p className="text-[#7A6A64] mt-1 text-sm">Choose a strong password for your account</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8DDD6]">
          <form onSubmit={handleReset} className="space-y-4">

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-[#2D1F1A] mb-1.5">New Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A64]">
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                  className="flex h-11 w-full rounded-xl border border-[#E8DDD6] bg-white pl-10 pr-11 py-2 text-sm text-[#2D1F1A] placeholder:text-[#7A6A64] transition-all focus:outline-none focus:ring-2 focus:ring-[#C4634F] focus:border-transparent"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6A64] hover:text-[#2D1F1A] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-[#2D1F1A] mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6A64]">
                  <Lock size={15} />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className={`flex h-11 w-full rounded-xl border bg-white pl-10 pr-11 py-2 text-sm text-[#2D1F1A] placeholder:text-[#7A6A64] transition-all focus:outline-none focus:ring-2 focus:border-transparent ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-[#E8DDD6] focus:ring-[#C4634F]'
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6A64] hover:text-[#2D1F1A] transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
