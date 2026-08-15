'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  satark_points: number;
  rank?: string;
  is_volunteer: boolean;
  created_at: string;
}

interface UserDetail extends User {
  location?: string;
  reports?: any[];
  transactions?: any[];
}

const ROLE_OPTIONS = ['ALL', 'citizen', 'volunteer', 'admin', 'coordinator'];

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-red-600/20 text-red-400 border border-red-600/30',
  volunteer: 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30',
  citizen: 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
  coordinator: 'bg-violet-600/20 text-violet-400 border border-violet-600/30',
};

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async (q = '', role = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (role && role !== 'ALL') params.set('role', role);
      const r = await fetch(`/api/admin/users?${params}`);
      if (!r.ok) { showToast('Failed to load users', 'error'); return; }
      const j = await r.json();
      setUsers(j.users || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search, roleFilter);
  };

  const viewUser = async (id: string) => {
    setDetailLoading(true);
    setSelectedUser(null);
    try {
      const r = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`);
      if (!r.ok) { showToast('Failed to load user', 'error'); return; }
      const j = await r.json();
      setSelectedUser(j.profile);
    } finally {
      setDetailLoading(false);
    }
  };

  const changeRole = async (userId: string, newRole: string) => {
    setRoleChangeLoading(true);
    try {
      const r = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_role', id: userId, role: newRole }),
      });
      if (!r.ok) { showToast('Failed to change role', 'error'); return; }
      showToast(`Role updated to ${newRole} ✓`);
      // Refresh user detail
      await viewUser(userId);
      load(search, roleFilter);
    } finally {
      setRoleChangeLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold
          ${toast.type === 'success' ? 'bg-emerald-900/90 border border-emerald-600/50 text-emerald-300' : 'bg-red-900/90 border border-red-600/50 text-red-300'}`}>
          {toast.type === 'success' ? '✓' : '✗'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">User Management</h1>
        <p className="text-slate-500 text-sm mt-0.5">{users.length} users loaded</p>
      </div>

      {/* Search + filter */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); load(search, e.target.value); }}
          className="px-3 py-2.5 bg-white/5 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none"
        >
          {ROLE_OPTIONS.map(r => <option key={r} value={r} className="bg-navy-950">{r === 'ALL' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
        <button
          type="submit"
          className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-xl text-sm font-semibold transition-colors"
        >
          Search
        </button>
      </form>

      <div className={`grid gap-4 ${selectedUser ? 'lg:grid-cols-3' : ''}`}>
        {/* Users table */}
        <div className={selectedUser ? 'lg:col-span-2' : ''}>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-slate-600">
              <div className="text-4xl mb-3">👤</div>
              <p>No users found</p>
            </div>
          ) : (
            <div className="bg-navy-900/50 border border-slate-800/60 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800/60">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Points</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {users.map(user => (
                      <tr
                        key={user.id}
                        className={`hover:bg-white/2 transition-colors cursor-pointer ${selectedUser?.id === user.id ? 'bg-blue-600/5' : ''}`}
                        onClick={() => viewUser(user.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                              ${ROLE_BADGE[user.role] || 'bg-slate-800 text-slate-400'}`}>
                              {user.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{user.name}</p>
                              <p className="text-xs text-slate-500 truncate max-w-36">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${ROLE_BADGE[user.role] || 'bg-slate-700 text-slate-400'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-amber-400 font-semibold">{user.satark_points}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-slate-500">{timeAgo(user.created_at)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* User detail panel */}
        {(selectedUser || detailLoading) && (
          <div className="lg:col-span-1">
            <div className="bg-navy-900/60 border border-slate-800/60 rounded-2xl overflow-hidden sticky top-20">
              {detailLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : selectedUser ? (
                <>
                  <div className="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">User Profile</h3>
                    <button onClick={() => setSelectedUser(null)} className="text-slate-500 hover:text-white transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-black ${ROLE_BADGE[selectedUser.role] || 'bg-slate-800 text-slate-400'}`}>
                        {selectedUser.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{selectedUser.name}</p>
                        <p className="text-xs text-slate-500">{selectedUser.email}</p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 text-xs text-slate-400">
                      {selectedUser.phone && <div className="flex gap-2"><span className="text-slate-600">Phone</span>{selectedUser.phone}</div>}
                      {selectedUser.location && <div className="flex gap-2"><span className="text-slate-600">Location</span>{selectedUser.location}</div>}
                      <div className="flex gap-2"><span className="text-slate-600">Points</span><span className="text-amber-400 font-semibold">{selectedUser.satark_points}</span></div>
                      <div className="flex gap-2"><span className="text-slate-600">Rank</span>{selectedUser.rank || 'Newcomer'}</div>
                      <div className="flex gap-2"><span className="text-slate-600">Joined</span>{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                    </div>

                    {/* Role change */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Change Role</label>
                      <div className="flex gap-2">
                        <select
                          defaultValue={selectedUser.role}
                          id={`role-select-${selectedUser.id}`}
                          className="flex-1 px-2 py-2 bg-navy-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                        >
                          {['citizen', 'volunteer', 'coordinator', 'admin'].map(r => (
                            <option key={r} value={r} className="bg-navy-950">{r}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const sel = document.getElementById(`role-select-${selectedUser.id}`) as HTMLSelectElement;
                            if (sel) changeRole(selectedUser.id, sel.value);
                          }}
                          disabled={roleChangeLoading}
                          className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition-colors"
                        >
                          {roleChangeLoading ? '...' : 'Set'}
                        </button>
                      </div>
                    </div>

                    {/* Recent reports */}
                    {selectedUser.reports && selectedUser.reports.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recent Reports ({selectedUser.reports.length})</h4>
                        <div className="space-y-1.5">
                          {selectedUser.reports.slice(0, 3).map((rep: any) => (
                            <div key={rep.id} className="px-2.5 py-2 bg-white/3 border border-slate-800/60 rounded-lg">
                              <p className="text-xs text-white truncate">{rep.title || rep.description?.slice(0, 40)}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{rep.status} · {rep.category}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent transactions */}
                    {selectedUser.transactions && selectedUser.transactions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Points History</h4>
                        <div className="space-y-1.5">
                          {selectedUser.transactions.slice(0, 3).map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between px-2.5 py-1.5 bg-white/3 border border-slate-800/60 rounded-lg">
                              <p className="text-xs text-slate-400 truncate">{tx.reason}</p>
                              <span className={`text-xs font-bold ml-2 ${tx.points > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {tx.points > 0 ? '+' : ''}{tx.points}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
