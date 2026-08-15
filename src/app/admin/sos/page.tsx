'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface SosAlert {
  id: string;
  user_id?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  notes?: string;
  created_at: string;
  resolved_at?: string;
}

interface Broadcast {
  id: string;
  title: string;
  message: string;
  severity: string;
  category: string;
  created_at: string;
}

type ModalAction = { type: 'resolve' | 'responded'; sos: SosAlert } | null;

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

const SEVERITY_OPTIONS = [
  { value: 'critical', label: '🔴 Critical', color: 'text-red-400' },
  { value: 'warning', label: '🟠 Warning', color: 'text-orange-400' },
  { value: 'info', label: '🔵 Info', color: 'text-blue-400' },
];

const CATEGORY_OPTIONS = [
  'general', 'flood', 'earthquake', 'landslide', 'fire', 'storm', 'evacuation', 'medical',
];

export default function AdminSosPage() {
  const [sosList, setSosList] = useState<SosAlert[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalAction>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [tab, setTab] = useState<'sos' | 'broadcast'>('sos');

  // Broadcast form
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcSeverity, setBcSeverity] = useState('warning');
  const [bcCategory, setBcCategory] = useState('general');
  const [bcLoading, setBcLoading] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadSos = useCallback(async () => {
    const r = await fetch('/api/admin/sos');
    if (r.ok) {
      const j = await r.json();
      setSosList(j.sos || []);
    }
  }, []);

  const loadBroadcasts = useCallback(async () => {
    const r = await fetch('/api/admin/broadcasts');
    if (r.ok) {
      const j = await r.json();
      setBroadcasts(j.broadcasts || []);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadSos(), loadBroadcasts()]);
    setLoading(false);
  }, [loadSos, loadBroadcasts]);

  useEffect(() => { load(); }, [load]);

  const handleSosAction = async () => {
    if (!modal) return;
    setActionLoading(true);
    try {
      const r = await fetch('/api/admin/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: modal.type, id: modal.sos.id }),
      });
      if (!r.ok) { showToast('Action failed', 'error'); return; }
      showToast('SOS alert resolved ✓');
      setModal(null);
      loadSos();
    } finally {
      setActionLoading(false);
    }
  };

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcMessage.trim()) { showToast('Title and message required', 'error'); return; }
    setBcLoading(true);
    try {
      const r = await fetch('/api/admin/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: bcTitle, message: bcMessage, severity: bcSeverity, category: bcCategory }),
      });
      if (!r.ok) { showToast('Failed to send broadcast', 'error'); return; }
      showToast('Emergency broadcast sent! 📡');
      setBcTitle('');
      setBcMessage('');
      setBcSeverity('warning');
      setBcCategory('general');
      loadBroadcasts();
    } finally {
      setBcLoading(false);
    }
  };

  const activeCount = sosList.filter(s => s.status === 'ACTIVE').length;

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
        <h1 className="text-2xl font-extrabold text-white">SOS &amp; Broadcasting</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {activeCount > 0
            ? <span className="text-red-400 font-semibold animate-pulse">{activeCount} active SOS alert{activeCount > 1 ? 's' : ''} — Needs attention</span>
            : 'No active SOS alerts'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 border border-slate-800 rounded-xl w-fit">
        {[
          { key: 'sos', label: 'SOS Alerts', badge: activeCount > 0 ? activeCount : null },
          { key: 'broadcast', label: '📡 Broadcast', badge: null },
        ].map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key as 'sos' | 'broadcast')}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab === key ? 'bg-navy-950 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {label}
            {badge != null && (
              <span className="w-5 h-5 bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center font-black animate-pulse">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SOS Alerts Tab */}
      {tab === 'sos' && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
            </div>
          ) : sosList.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-slate-500">No SOS alerts on record</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {sosList.map(sos => (
                <div
                  key={sos.id}
                  className={`relative bg-navy-900/60 border rounded-2xl p-4 overflow-hidden transition-all
                    ${sos.status === 'ACTIVE' ? 'border-red-600/40 shadow-lg shadow-red-900/20' : 'border-slate-800/60 opacity-70'}`}
                >
                  {sos.status === 'ACTIVE' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-transparent pointer-events-none" />
                  )}
                  <div className="relative flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${sos.status === 'ACTIVE' ? 'bg-red-600/20 border border-red-600/40' : 'bg-slate-800 border border-slate-700'}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sos.status === 'ACTIVE' ? '#ef4444' : '#64748b'} strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase
                          ${sos.status === 'ACTIVE' ? 'bg-red-600/20 text-red-400 border border-red-600/30 animate-pulse' :
                            sos.status === 'RESOLVED' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' :
                            'bg-slate-700 text-slate-400'}`}>
                          {sos.status}
                        </span>
                        <span className="text-xs text-slate-500">{timeAgo(sos.created_at)}</span>
                      </div>
                      <p className="text-sm text-white mt-1 font-medium">{sos.notes || 'Emergency SOS Alert'}</p>
                      {sos.latitude && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          📍 {sos.latitude.toFixed(4)}, {sos.longitude?.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                  {sos.status === 'ACTIVE' && (
                    <div className="relative mt-3 flex gap-2">
                      <button
                        onClick={() => setModal({ type: 'responded', sos })}
                        className="flex-1 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Mark Responded
                      </button>
                      <button
                        onClick={() => setModal({ type: 'resolve', sos })}
                        className="flex-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Broadcast Tab */}
      {tab === 'broadcast' && (
        <div className="grid md:grid-cols-2 gap-5">
          {/* Compose form */}
          <div className="bg-navy-900/60 border border-slate-800/60 rounded-2xl p-5">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-lg">📡</span> Compose Broadcast
            </h2>
            <form onSubmit={sendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Title</label>
                <input
                  value={bcTitle}
                  onChange={e => setBcTitle(e.target.value)}
                  placeholder="Emergency broadcast title..."
                  className="w-full px-3 py-2.5 bg-navy-950/80 border border-slate-700/60 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-red-600/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Message</label>
                <textarea
                  value={bcMessage}
                  onChange={e => setBcMessage(e.target.value)}
                  placeholder="Write your emergency message here..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-navy-950/80 border border-slate-700/60 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-red-600/50 resize-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Severity</label>
                  <select
                    value={bcSeverity}
                    onChange={e => setBcSeverity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-navy-950/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-red-600/50"
                  >
                    {SEVERITY_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} className="bg-navy-950">{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
                  <select
                    value={bcCategory}
                    onChange={e => setBcCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-navy-950/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-red-600/50"
                  >
                    {CATEGORY_OPTIONS.map(c => (
                      <option key={c} value={c} className="bg-navy-950">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={bcLoading}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/30"
              >
                {bcLoading ? (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : '📡'}
                {bcLoading ? 'Sending...' : 'Send Emergency Broadcast'}
              </button>
            </form>
          </div>

          {/* Broadcast history */}
          <div className="bg-navy-900/60 border border-slate-800/60 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800/60">
              <h2 className="text-sm font-bold text-white">Broadcast History</h2>
            </div>
            <div className="divide-y divide-slate-800/40 max-h-96 overflow-y-auto">
              {broadcasts.length === 0 ? (
                <div className="px-4 py-12 text-center text-slate-600 text-sm">No broadcasts sent yet</div>
              ) : (
                broadcasts.map(b => (
                  <div key={b.id} className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5">
                        {b.severity === 'critical' ? '🔴' : b.severity === 'warning' ? '🟠' : '🔵'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{b.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{b.message}</p>
                        <p className="text-xs text-slate-600 mt-1">{timeAgo(b.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SOS Action Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !actionLoading && setModal(null)} />
          <div className="relative bg-navy-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
            <h3 className="text-center text-base font-bold text-white mb-1 capitalize">
              {modal.type === 'responded' ? 'Mark as Responded?' : 'Resolve SOS?'}
            </h3>
            <p className="text-center text-sm text-slate-400 mb-5">This will update the alert status.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-white/5 border border-slate-700 rounded-xl text-sm text-slate-400 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSosAction}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
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
