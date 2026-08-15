import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-extrabold">Terms of Service</h2>
        <p className="text-sm text-slate-400 mt-3">Brief, citizen-friendly terms explaining acceptable use of Satark Nepal.</p>
        <div className="mt-4 text-sm text-slate-300">Use the app responsibly and do not misuse emergency features.</div>
        <div className="mt-4"><Link href="/help" className="text-amber-400">Back</Link></div>
      </div>
    </div>
  );
}