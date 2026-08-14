import React from 'react';
import Link from 'next/link';

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-extrabold">Emergency Disclaimer</h2>
        <p className="text-sm text-slate-400 mt-3">Satark Nepal provides community-sourced reports and indicators; it is not a substitute for official emergency services.</p>
        <div className="mt-4"><Link href="/help" className="text-amber-400">Back</Link></div>
      </div>
    </div>
  );
}