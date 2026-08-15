'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ContactsPage() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('satark_contacts') : '[]';
    setList(JSON.parse(raw || '[]'));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-extrabold">Emergency Contacts</h2>
        <p className="text-sm text-slate-400 mt-1">Add or edit your emergency contacts.</p>
        <div className="mt-4 space-y-2">
          {list.length === 0 ? <div className="text-sm text-slate-400">No contacts saved.</div> : list.map((c, i) => (
            <div key={i} className="p-3 bg-navy-950 rounded border border-slate-800">{c.name} — {c.phone}</div>
          ))}
        </div>
        <div className="mt-4"><Link href="/profile" className="text-amber-400">Back to dashboard</Link></div>
      </div>
    </div>
  );
}
