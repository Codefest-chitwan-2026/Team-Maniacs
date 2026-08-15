'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface Report {
  id: string;
  title?: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  verified: boolean;
  user_id?: string;
  user_name?: string;
  address?: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

const STATUS_OPTIONS = ['ALL', 'NEW', 'UNDER REVIEW', 'VERIFIED', 'RESPONDING', 'RESOLVED'];
const CATEGORY_OPTIONS = ['all', 'flood', 'landslide', 'earthquake', 'fire', 'storm', 'medical', 'building', 'road', 'other'];

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-red-600/20 text-red-400 border border-red-600/30',
  urgent: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'non-critical': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
};

const STATUS_BADGE: Record<string, string> = {
  NEW: 'bg-slate-700 text-slate-300',
  'UNDER REVIEW': 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30',
  VERIFIED: 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30',
  RESPONDING: 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
  RESOLVED: 'bg-slate-600/20 text-slate-400 border border-slate-600/30',
};

const CATEGORY_ICON: Record<string, string> = {
  flood: '🌊', landslide: '⛰️', earthquake: '🌍', fire: '🔥',
  storm: '🌩️', medical: '🏥', building: '🏗️', road: '🛣️', other: '⚠️',
};

type ModalAction = { type: 'verify' | 'reject' | 'delete'; report: Report } | null;

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filtered, setFiltered] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('all');
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
      const r = await fetch('/api/admin/reports');
      if (!r.ok) { showToast('Failed to load reports', 'error'); return; }
      const j = await r.json();
      setReports(j.reports || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let f = reports;
    if (statusFilter !== 'ALL') f = f.filter(r => r.status === statusFilter);
    if (categoryFilter !== 'all') f = f.filter(r => r.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter(r =>
        (r.title || r.description || '').toLowerCase().includes(q) ||
        (r.user_name || '').toLowerCase().includes(q) ||
        (r.address || '').toLowerCase().includes(q)
      );
    }
    setFiltered(f);
  }, [reports, statusFilter, categoryFilter, search]);

  const handleAction = async () => {
    if (!modal) return;
    setActionLoading(true);
    try {
      const r = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: modal.type, id: modal.report.id }),
      });
      if (!r.ok) { showToast('Action failed', 'error'); return; }
      showToast(
        modal.type === 'verify' ? 'Report verified ✓' :
        modal.type === 'reject' ? 'Report rejected' : 'Report deleted',
        'success'
      );
      setModal(null);
      load();
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = reports.filter(r => r.status === 'NEW').length;

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all
          ${toast.type === 'success' ? 'bg-emerald-900/90 border border-emerald-600/50 text-emerald-300' : 'bg-red-900/90 border border-red-600/50 text-red-300'}`}>
          {toast.type === 'success' ? '✓' : '✗'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Disaster Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {pendingCount > 0 && <span className="text-orange-400 font-semibold">{pendingCount} pending review · </span>}
            {reports.length} total reports
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-slate-800 rounded-xl text-sm text-slate-400 hover:text-white transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-all"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-slate-600"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-navy-950">{s}</option>)}
        </select>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-slate-600"
        >
          {CATEGORY_OPTIONS.map(c => <option key={c} value={c} className="bg-navy-950">{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {/* Status tabs (pill style) */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_OPTIONS.slice(1).map(s => {
          const count = reports.filter(r => r.status === s).length;
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(active ? 'ALL' : s)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${active ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-white/5 text-slate-500 border border-slate-800 hover:text-white'}`}
            >
              {s}
              {count > 0 && <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${active ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-300'}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Reports table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <div className="text-4xl mb-3">📋</div>
          <p>No reports match the current filters</p>
        </div>
      ) : (
        <div className="bg-navy-900/50 border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/60">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Report</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Time</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filtered.map(report => (
                  <tr key={report.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0">{CATEGORY_ICON[report.category] || '⚠️'}</span>
                        <div>
                          <p className="text-sm font-semibold text-white line-clamp-1">{report.title || report.description.slice(0, 60)}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-48">{report.address || `${report.latitude?.toFixed(3)}, ${report.longitude?.toFixed(3)}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-slate-400 capitalize">{report.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${SEVERITY_BADGE[report.severity] || 'bg-slate-700 text-slate-300'}`}>
                        {report.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${STATUS_BADGE[report.status] || 'bg-slate-700 text-slate-400'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-slate-500">{timeAgo(report.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => setModal({ type: 'verify', report })}
                          className="px-2.5 py-1.5 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-600/30 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => setModal({ type: 'reject', report })}
                          className="px-2.5 py-1.5 bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-600/30 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setModal({ type: 'delete', report })}
                          className="p-1.5 bg-white/5 hover:bg-red-600/10 text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-600/30 rounded-lg transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !actionLoading && setModal(null)} />
          <div className="relative bg-navy-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4
              ${modal.type === 'verify' ? 'bg-emerald-600/20' : modal.type === 'reject' ? 'bg-orange-600/20' : 'bg-red-600/20'}`}>
              {modal.type === 'verify'
                ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>
                : modal.type === 'reject'
                ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/></svg>
              }
            </div>
            <h3 className="text-center text-base font-bold text-white capitalize mb-1">{modal.type} Report?</h3>
            <p className="text-center text-sm text-slate-400 mb-5">
              "{modal.report.title || modal.report.description.slice(0, 60)}"
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-slate-700 rounded-xl text-sm text-slate-400 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2
                  ${modal.type === 'verify' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' :
                    modal.type === 'reject' ? 'bg-orange-600 hover:bg-orange-500 text-white' :
                    'bg-red-600 hover:bg-red-500 text-white'}`}
              >
                {actionLoading && <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>}
                Confirm {modal.type}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
