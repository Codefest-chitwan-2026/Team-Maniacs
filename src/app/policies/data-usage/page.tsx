import React from 'react';
import Link from 'next/link';

export default function DataUsagePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-extrabold">Data & Location Usage</h2>
        <p className="text-sm text-slate-400 mt-3">Explanation of how location and other data are used to improve response and safety.</p>
        <div className="mt-4 text-sm text-slate-300">Location is used when you allow it to show nearby incidents and improve accuracy of SOS.</div>
        <div className="mt-4"><Link href="/help" className="text-amber-400">Back</Link></div>
      </div>
    </div>
  );
}