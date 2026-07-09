'use client';

import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/auth/login';
      }}
      title="Sign Out"
      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
                 text-white/40 hover:text-red-400 hover:bg-red-500/15 transition-all"
    >
      <LogOut size={13} />
    </button>
  );
}
