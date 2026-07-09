'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email address'); return; }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#F5EDE5] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-[#E8DDD6] text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#2D1F1A] mb-2">Check your email</h2>
            <p className="text-[#7A6A64] mb-1">We sent a password reset link to</p>
            <p className="font-semibold text-[#2D1F1A] mb-5">{email}</p>
            <p className="text-sm text-[#7A6A64] mb-6">
              Click the link in the email to reset your password. The link expires in 1 hour.
              Check your spam folder if you don&apos;t see it.
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setSent(false); }}
              >
                Try a different email
              </Button>
              <Button asChild className="w-full">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-[#2D1F1A]">Forgot password?</h1>
          <p className="text-[#7A6A64] mt-1 text-sm">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8DDD6]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail size={15} />}
              autoComplete="email"
              autoFocus
            />

            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        </div>

        <div className="text-center mt-5">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-[#7A6A64] hover:text-[#C4634F] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
