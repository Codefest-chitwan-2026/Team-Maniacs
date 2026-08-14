'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AlertPreferencesPage() {
  const [prefs, setPrefs] = useState<any>({ enabled: true, channels: ['push', 'sms'] });
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('satark_alert_prefs') : null;
    if (raw) setPrefs(JSON.parse(raw));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-extrabold">Alert Preferences</h2>
        <p className="text-sm text-slate-400 mt-1">Control how you receive emergency alerts.</p>
        <div className="mt-4 text-sm text-slate-400">Enabled: {prefs?.enabled ? 'Yes' : 'No'}</div>
        <div className="mt-4"><Link href="/profile" className="text-amber-400">Back to dashboard</Link></div>
      </div>
    </div>
  );
}
