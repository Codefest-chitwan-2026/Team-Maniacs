'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  is_volunteer: boolean;
  role: string;
  satark_points: number;
  rank?: string;
  created_at: string;
}

type Tab = 'all' | 'verified' | 'pending';
type ModalAction = { type: 'verify' | 'reject'; vol: Volunteer } | null;

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalAction>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/volunteers');
      if (!r.ok) { showToast('Failed to load volunteers', 'error'); return; }
      const j = await r.json();
      setVolunteers(j.volunteers || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async () => {
    if (!modal) return;
    setActionLoading(true);
    try {
      const r = await fetch('/api/admin/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: modal.type, id: modal.vol.id }),
      });
      if (!r.ok) { showToast('Action failed', 'error'); return; }
      showToast(modal.type === 'verify' ? 'Volunteer verified ✓' : 'Volunteer rejected');
      setModal(null);
      load();
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = volunteers.filter(v => {
    const matchSearch = search.trim() === '' ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      (v.phone || '').includes(search) ||
      (v.location || '').toLowerCase().includes(search.toLowerCase());

    const matchTab =
      tab === 'all' ? true :
      tab === 'verified' ? v.role === 'volunteer' :
      tab === 'pending' ? v.role !== 'volunteer' : true;

    return matchSearch && matchTab;
  });

  const verifiedCount = volunteers.filter(v => v.role === 'volunteer').length;
  const pendingCount = volunteers.filter(v => v.role !== 'volunteer').length;

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Volunteer Verification</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {pendingCount > 0 && <span className="text-orange-400 font-semibold">{pendingCount} pending · </span>}
            {verifiedCount} verified volunteers
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-slate-800 rounded-xl text-sm text-slate-400 hover:text-white transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 p-1 bg-white/5 border border-slate-800 rounded-xl">
          {([
            { key: 'all', label: 'All', count: volunteers.length },
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'verified', label: 'Verified', count: verifiedCount },
          ] as { key: Tab; label: string; count: number }[]).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${tab === key ? 'bg-navy-950 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {label}
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center
                ${tab === key
                  ? key === 'pending' ? 'bg-orange-500 text-black' : key === 'verified' ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white'
                  : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search volunteers..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-slate-500">No volunteers found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(vol => {
            const isVerified = vol.role === 'volunteer';
            return (
              <div
                key={vol.id}
                className={`bg-navy-900/60 border rounded-2xl p-4 transition-all
                  ${isVerified ? 'border-emerald-600/20' : 'border-slate-800/60'}`}
              >
                {/* Avatar + info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold
                    ${isVerified ? 'bg-emerald-600/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    {vol.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{vol.name}</p>
                    <p className="text-xs text-slate-500 truncate">{vol.email}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex-shrink-0
                    ${isVerified ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' : 'bg-orange-600/20 text-orange-400 border border-orange-600/30'}`}>
                    {isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 mb-3">
                  {vol.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      {vol.phone}
                    </div>
                  )}
                  {vol.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {vol.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    {vol.satark_points} points · {vol.rank || 'Newcomer'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Joined {timeAgo(vol.created_at)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!isVerified && (
                    <button
                      onClick={() => setModal({ type: 'verify', vol })}
                      className="flex-1 py-2 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-600/30 rounded-lg text-xs font-bold transition-colors"
                    >
                      ✓ Verify
                    </button>
                  )}
                  <button
                    onClick={() => setModal({ type: 'reject', vol })}
                    className={`py-2 px-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 rounded-lg text-xs font-bold transition-colors ${!isVerified ? '' : 'flex-1'}`}
                  >
                    {isVerified ? '✗ Revoke' : '✗'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !actionLoading && setModal(null)} />
          <div className="relative bg-navy-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4
              ${modal.type === 'verify' ? 'bg-emerald-600/20' : 'bg-red-600/20'}`}>
              {modal.type === 'verify'
                ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>
                : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              }
            </div>
            <h3 className="text-center text-base font-bold text-white mb-1">
              {modal.type === 'verify' ? 'Verify Volunteer?' : 'Revoke Volunteer Status?'}
            </h3>
            <p className="text-center text-sm text-slate-400 mb-5">{modal.vol.name}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-white/5 border border-slate-700 rounded-xl text-sm text-slate-400 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2
                  ${modal.type === 'verify' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
              >
                {actionLoading && <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
