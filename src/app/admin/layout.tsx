import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Admin - Satark Nepal',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto py-8 px-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 bg-navy-950 p-4 rounded-xl border border-slate-800">
          <div className="mb-6">
            <h3 className="text-lg font-extrabold">Satark Admin</h3>
            <p className="text-sm text-slate-400 mt-1">Administration</p>
          </div>

          <nav className="space-y-2">
            <Link href="/admin" className="block px-3 py-2 rounded hover:bg-navy-900">Dashboard</Link>
            <Link href="/admin/users" className="block px-3 py-2 rounded hover:bg-navy-900">Users</Link>
            <Link href="/admin/reports" className="block px-3 py-2 rounded hover:bg-navy-900">Reports</Link>
            <Link href="/admin/sos" className="block px-3 py-2 rounded hover:bg-navy-900">SOS Alerts</Link>
            <Link href="/admin/points" className="block px-3 py-2 rounded hover:bg-navy-900">Satark Points</Link>
            <Link href="/admin/problems" className="block px-3 py-2 rounded hover:bg-navy-900">Problems</Link>
            <Link href="/admin/volunteers" className="block px-3 py-2 rounded hover:bg-navy-900">Volunteers</Link>
            <Link href="/admin/relief" className="block px-3 py-2 rounded hover:bg-navy-900">Relief</Link>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="w-full text-left px-3 py-2 rounded hover:bg-navy-900">Logout</button>
            </form>
          </nav>
        </aside>

        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          {children}
        </main>
      </div>
    </div>
  );
}
