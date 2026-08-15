import React from 'react';
import Link from 'next/link';

export default function AchievementsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-extrabold">Achievements</h2>
        <p className="text-sm text-slate-400 mt-1">All unlocked and locked achievements.</p>
        <div className="mt-4 text-sm text-slate-400">Coming soon — achievements are tracked here.</div>
        <div className="mt-4">
          <Link href="/profile" className="text-amber-400">Back to dashboard</Link>
        </div>
      </div>
    </div>
  );
}