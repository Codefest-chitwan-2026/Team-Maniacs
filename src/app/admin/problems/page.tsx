"use client";

import React, { useEffect, useState } from 'react';

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);

  const load = async () => {
    const r = await fetch('/api/admin/problems');
    if (!r.ok) { alert('Failed to load problems'); return; }
    const j = await r.json();
    setProblems(j.problems || []);
  };

  useEffect(() => { load(); }, []);

  const act = async (id: string, action: string) => {
    if (!confirm(`Confirm ${action} problem ${id}?`)) return;
    const r = await fetch('/api/admin/problems', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id }) });
    if (!r.ok) { alert('Action failed'); return; }
    alert('Done');
    load();
  };

  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-4">Problems</h2>
      <div className="overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-sm"><th>Title</th><th>User</th><th>Location</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {problems.map(p => (
              <tr key={p.id} className="border-t border-slate-800">
                <td className="py-2">{p.title || p.description}</td>
                <td>{p.user_id}</td>
                <td>{p.location}</td>
                <td>{p.status}</td>
                <td>
                  <button onClick={() => act(p.id, 'verify')} className="px-2 py-1 bg-amber-500 rounded mr-2">Verify</button>
                  <button onClick={() => act(p.id, 'reject')} className="px-2 py-1 bg-red-600 rounded">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
