"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const router = useRouter();

  const load = async (q = '') => {
    const url = `/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`;
    const r = await fetch(url);
    if (!r.ok) {
      alert('Failed to load users');
      return;
    }
    const j = await r.json();
    setUsers(j.users || []);
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(query);
  };

  const viewDetails = async (id: string) => {
    const r = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`);
    if (!r.ok) { alert('Failed to load user'); return; }
    const j = await r.json();
    setSelected(j.profile);
  };

  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-4">Users</h2>
      <form onSubmit={handleSearch} className="mb-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users" className="p-2 rounded-l border border-slate-800" />
        <button className="px-3 py-2 bg-amber-500 rounded-r">Search</button>
      </form>

      <div className="overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-sm">
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Points</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-slate-800">
                <td className="py-2">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.role}</td>
                <td>{u.satark_points}</td>
                <td>{new Date(u.created_at).toLocaleString()}</td>
                <td><button onClick={() => viewDetails(u.id)} className="px-2 py-1 bg-navy-800 rounded">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="mt-6 bg-navy-950 p-4 rounded">
          <h3 className="font-bold">{selected.name}</h3>
          <p>{selected.email} • {selected.phone}</p>
          <p>Role: {selected.role}</p>
          <p>Points: {selected.satark_points}</p>
          <div className="mt-3">
            <h4 className="font-semibold">Reports</h4>
            <ul>
              {selected.reports?.map((r:any) => (
                <li key={r.id}>{r.title || r.description} — {r.status}</li>
              ))}
            </ul>
            <h4 className="font-semibold mt-2">Transactions</h4>
            <ul>
              {selected.transactions?.map((t:any) => (
                <li key={t.id}>{t.points} — {t.reason} — {new Date(t.created_at).toLocaleString()}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
