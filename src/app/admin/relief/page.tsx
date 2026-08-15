"use client";

import React, { useEffect, useState } from 'react';

export default function AdminReliefPage() {
  const [list, setList] = useState<any[]>([]);

  const load = async () => {
    const r = await fetch('/api/admin/relief');
    if (!r.ok) { alert('Failed to load relief'); return; }
    const j = await r.json();
    setList(j.relief || []);
  };

  useEffect(() => { load(); }, []);

  const act = async (id: string, action: string) => {
    if (!confirm(`${action} relief ${id}?`)) return;
    const r = await fetch('/api/admin/relief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id }) });
    if (!r.ok) { alert('Action failed'); return; }
    alert('Done'); load();
  };

  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-4">Relief Requests / Organizations</h2>
      <div className="overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-sm"><th>Title</th><th>Created By</th><th>Location</th><th>Verified</th><th></th></tr>
          </thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id} className="border-t border-slate-800">
                <td className="py-2">{r.title}</td>
                <td>{r.created_by}</td>
                <td>{r.location}</td>
                <td>{r.verified ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => act(r.id, 'verify')} className="px-2 py-1 bg-amber-500 rounded mr-2">Verify</button>
                  <button onClick={() => act(r.id, 'reject')} className="px-2 py-1 bg-red-600 rounded">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
