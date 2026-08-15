'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface Relief {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  people_affected: number;
  status: string;
  contact_phone?: string;
  created_at: string;
}

const STATUS_OPTIONS = ['NEEDED', 'ASSIGNED', 'IN PROGRESS', 'COMPLETED'];

const STATUS_BADGE: Record<string, string> = {
  NEEDED: 'bg-red-600/20 text-red-400 border border-red-600/30',
  ASSIGNED: 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
  'IN PROGRESS': 'bg-amber-600/20 text-amber-400 border border-amber-600/30',
  COMPLETED: 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30',
};

const CATEGORY_ICON: Record<string, string> = {
  food: '🍚', water: '💧', medicine: '💊', shelter: '🏠',
  rescue: '🚁', transport: '🚌', other: '📦',
};

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminReliefPage() {
  const [reliefs, setReliefs] = useState<Relief[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/relief');
      if (!r.ok) { showToast('Failed to load relief requests', 'error'); return; }
      const j = await r.json();
      setReliefs(j.relief || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, action: string) => {
    setActionLoading(id + action);
    try {
      const r = await fetch('/api/admin/relief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id }),
      });
      if (!r.ok) { showToast('Update failed', 'error'); return; }
      showToast('Status updated ✓');
      load();
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === 'ALL' ? reliefs : reliefs.filter(r => r.status === filter);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = reliefs.filter(r => r.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold
          ${toast.type === 'success' ? 'bg-emerald-900/90 border border-emerald-600/50 text-emerald-300' : 'bg-red-900/90 border border-red-600/50 text-red-300'}`}>
          {toast.type === 'success' ? '✓' : '✗'} {toast.msg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Relief Requests</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {counts['NEEDED'] > 0 && <span className="text-red-400 font-semibold">{counts['NEEDED']} urgent · </span>}
            {reliefs.length} total requests
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

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ label: 'All', value: 'ALL', count: reliefs.length }, ...STATUS_OPTIONS.map(s => ({ label: s, value: s, count: counts[s] || 0 }))].map(({ label, value, count }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
              ${filter === value ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-white/5 text-slate-500 border border-slate-800 hover:text-white'}`}
          >
            {label}
            {count > 0 && (
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${filter === value ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-300'}`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-slate-500">No relief requests</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(relief => (
            <div key={relief.id} className={`bg-navy-900/60 border rounded-2xl p-4 transition-all ${relief.status === 'NEEDED' ? 'border-red-600/30 shadow-sm shadow-red-900/10' : 'border-slate-800/60'}`}>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-xl flex-shrink-0">{CATEGORY_ICON[relief.category] || '📦'}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{relief.title}</p>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{relief.description}</p>
                </div>
              </div>
              <div className="space-y-1.5 mb-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {relief.location}
                </div>
                {relief.people_affected > 0 && (
                  <div className="flex items-center gap-2">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    {relief.people_affected} people affected
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${STATUS_BADGE[relief.status] || 'bg-slate-700 text-slate-400'}`}>{relief.status}</span>
                  <span>{timeAgo(relief.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {relief.status !== 'ASSIGNED' && relief.status !== 'COMPLETED' && (
                  <button onClick={() => updateStatus(relief.id, 'verify')} disabled={actionLoading === relief.id + 'verify'} className="flex-1 py-1.5 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-600/30 rounded-lg text-xs font-semibold transition-colors">
                    {actionLoading === relief.id + 'verify' ? '...' : 'Assign'}
                  </button>
                )}
                {relief.status === 'IN PROGRESS' && (
                  <button onClick={() => updateStatus(relief.id, 'reject')} disabled={!!actionLoading} className="flex-1 py-1.5 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-600/30 rounded-lg text-xs font-semibold transition-colors">
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
