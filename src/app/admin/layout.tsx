import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import Image from 'next/image';
import AdminNav from './AdminNav';
import LogoutButton from './LogoutButton';

export const runtime = 'nodejs';

async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('framio_admin')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { name: string; email: string; role: string };
  } catch { return null; }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect('/auth/login');

  const initials = admin.name
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F5EDE5] flex" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar — z-[9999] stays above any third-party chat widgets */}
      <aside className="w-[220px] bg-[#2D1F1A] flex flex-col fixed h-screen z-[9999]">

        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-[14px] border-b border-white/10 flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Framio"
            width={30}
            height={30}
            className="rounded-lg border border-white/20 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-white font-bold text-[13px] leading-tight">Framio</p>
            <p className="text-white/35 text-[10px] leading-tight">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <AdminNav />

        {/* User footer */}
        <div className="flex-shrink-0 border-t border-white/10 px-2 py-2">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-[#C4634F] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[11px] font-bold">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-[12px] font-semibold truncate leading-tight">{admin.name}</p>
              <p className="text-white/40 text-[10px] truncate leading-tight mt-0.5">{admin.email}</p>
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Suppress all third-party floating chat / support widgets */}
        <style>{`
          body > div[class*="tawk"],
          body > div[id*="tawk"],
          body > iframe[src*="tawk"],
          body > div[class*="crisp"],
          body > div[id*="crisp-client"],
          body > div[id*="tidio"],
          body > div[id*="intercom"],
          body > div[id*="hubspot"],
          body > div[class*="widget-bubble"],
          body > div[class*="chat-widget"],
          body > div[id*="chat-widget"],
          body > div[style*="z-index: 999"],
          body > div[style*="z-index:999"] { display: none !important; }
        `}</style>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-[220px] overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
