"use client";

import React, { useEffect, useState } from 'react';

export default function AdminVolunteersPage() {
  const [vols, setVols] = useState<any[]>([]);

  const load = async () => {
    const r = await fetch('/api/admin/volunteers');
    if (!r.ok) { alert('Failed to load'); return; }
    const j = await r.json();
    setVols(j.volunteers || []);
  };

  useEffect(() => { load(); }, []);

  const act = async (id: string, action: string) => {
    if (!confirm(`${action} volunteer ${id}?`)) return;
    const r = await fetch('/api/admin/volunteers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id }) });
    if (!r.ok) { alert('Action failed'); return; }
    alert('Done'); load();
  };

  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-4">Volunteers</h2>
      <div className="overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-sm"><th>Name</th><th>Phone</th><th>Area</th><th>Verified</th><th></th></tr>
          </thead>
          <tbody>
            {vols.map(v => (
              <tr key={v.id} className="border-t border-slate-800">
                <td className="py-2">{v.name}</td>
                <td>{v.phone}</td>
                <td>{v.area}</td>
                <td>{v.verified ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => act(v.id, 'verify')} className="px-2 py-1 bg-amber-500 rounded mr-2">Verify</button>
                  <button onClick={() => act(v.id, 'reject')} className="px-2 py-1 bg-red-600 rounded">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
