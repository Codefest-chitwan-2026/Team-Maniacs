import React from 'react';
import Link from 'next/link';

export default function SupportContact() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-extrabold">Contact Support</h2>
        <p className="text-sm text-slate-400 mt-3">If you need help, email our support team and include a short description of your issue.</p>
        <div className="mt-4 text-sm text-slate-300">Email: <a href="mailto:support@satark.np" className="text-amber-400">support@satark.np</a></div>
        <div className="mt-4"><Link href="/help" className="text-amber-400">Back</Link></div>
      </div>
    </div>
  );
}