import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getAdminOrRedirect(): Promise<AdminPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get('framio_admin')?.value;
  if (!token) redirect('/admin/login');
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as AdminPayload;
  } catch {
    redirect('/admin/login');
  }
}
