import { redirect } from 'next/navigation';

// Admin login is now unified with the main login page.
// Entering admin@framio.shop on /auth/login routes to the admin dashboard.
export default function AdminLoginRedirect() {
  redirect('/auth/login');
}
