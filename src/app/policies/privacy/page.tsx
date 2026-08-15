
import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-extrabold">Privacy Policy</h2>
        <p className="text-sm text-slate-400 mt-3">This page explains how Satark Nepal collects and uses data. Keep language simple and clear for citizens.</p>
        <div className="mt-4 text-sm text-slate-300 space-y-2">
          <p>We collect minimal personal data needed for emergency response and safety features. Location data is used only with permission.</p>
          <p>We do not sell personal data. Data is retained to support community safety and may be removed upon account deletion.</p>
        </div>
        <div className="mt-4"><Link href="/help" className="text-amber-400">Back</Link></div>
      </div>
    </div>
  );
}