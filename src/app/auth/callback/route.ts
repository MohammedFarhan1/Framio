import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/account';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    const url = new URL('/auth/login', origin);
    url.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(url);
  }

  if (code) {
    const destination = type === 'recovery'
      ? new URL('/auth/reset-password', origin)
      : new URL(next, origin);

    const response = NextResponse.redirect(destination);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) return response;
  }

  const fallback = new URL('/auth/login', origin);
  fallback.searchParams.set('error', 'Authentication failed. Please try again.');
  return NextResponse.redirect(fallback);
}
