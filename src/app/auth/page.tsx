import { redirect } from 'next/navigation';

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const sp = await searchParams;
  const redirectParam = sp.redirect ? `?redirect=${encodeURIComponent(sp.redirect)}` : '';
  redirect(`/auth/login${redirectParam}`);
}
