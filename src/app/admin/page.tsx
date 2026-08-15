'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalReports: number;
  pendingReports: number;
  verifiedReports: number;
  activeSos: number;
  totalVolunteers: number;
}

interface RecentReport {
  id: string;
  title?: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  created_at: string;
  user_name?: string;
}

interface RecentSos {
  id: string;
  status: string;
  notes?: string;
  created_at: string;
  latitude?: number;
  longitude?: number;
}

const STAT_CARDS = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    color: 'from-blue-600 to-blue-800',
    glow: 'shadow-blue-900/30',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    key: 'totalReports',
    label: 'Total Reports',
    color: 'from-amber-600 to-amber-800',
    glow: 'shadow-amber-900/30',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
      </svg>
    ),
  },
  {
    key: 'pendingReports',
    label: 'Pending Review',
    color: 'from-orange-600 to-orange-800',
    glow: 'shadow-orange-900/30',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
      </svg>
    ),
  },
  {
    key: 'activeSos',
    label: 'Active SOS',
    color: 'from-red-600 to-red-800',
    glow: 'shadow-red-900/40',
    pulse: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    key: 'totalVolunteers',
    label: 'Volunteers',
    color: 'from-emerald-600 to-emerald-800',
    glow: 'shadow-emerald-900/30',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    key: 'verifiedReports',
    label: 'Verified Reports',
    color: 'from-violet-600 to-violet-800',
    glow: 'shadow-violet-900/30',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="20,6 9,17 4,12"/>
      </svg>
    ),
  },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-600/20 text-red-400 border border-red-600/30',
  urgent: 'bg-orange-600/20 text-orange-400 border border-orange-600/30',
  'non-critical': 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
};

const CATEGORY_ICONS: Record<string, string> = {
  flood: '🌊',
  landslide: '⛰️',
  earthquake: '🌍',
  fire: '🔥',
  storm: '🌩️',
  medical: '🏥',
  building: '🏗️',
  road: '🛣️',
  other: '⚠️',
};

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [recentSos, setRecentSos] = useState<RecentSos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/stats');
      if (!r.ok) {
        const j = await r.json();
        setError(j?.error || 'Failed to load stats');
        return;
      }
      const j = await r.json();
      setStats(j.stats);
      setRecentReports(j.recentReports || []);
      setRecentSos(j.recentSos || []);
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-3">⚠</div>
          <p className="text-slate-400">{error}</p>
          <button onClick={load} className="mt-3 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Satark Nepal — Command Overview</p>
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

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {STAT_CARDS.map(({ key, label, color, glow, pulse, icon }) => {
          const value = stats ? (stats as any)[key] ?? 0 : 0;
          return (
            <div
              key={key}
              className={`relative bg-gradient-to-br ${color} rounded-2xl p-4 md:p-5 shadow-lg ${glow} overflow-hidden`}
            >
              {/* Decorative circle */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/5" />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${pulse && value > 0 ? 'animate-pulse' : ''}`}>
                    {icon}
                  </div>
                  {pulse && value > 0 && (
                    <span className="flex h-2.5 w-2.5">
                      <span className="animate-ping absolute h-2.5 w-2.5 rounded-full bg-white opacity-75" />
                      <span className="relative rounded-full h-2.5 w-2.5 bg-white" />
                    </span>
                  )}
                </div>
                <div className="text-3xl font-black text-white tabular-nums">{value.toLocaleString()}</div>
                <div className="text-xs text-white/70 font-medium mt-0.5">{label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/admin/reports', label: 'Review Reports', color: 'hover:border-amber-600/50 hover:bg-amber-600/5', icon: '📋' },
            { href: '/admin/sos', label: 'SOS Broadcast', color: 'hover:border-red-600/50 hover:bg-red-600/5', icon: '📡' },
            { href: '/admin/volunteers', label: 'Verify Volunteers', color: 'hover:border-emerald-600/50 hover:bg-emerald-600/5', icon: '✅' },
            { href: '/admin/users', label: 'Manage Users', color: 'hover:border-blue-600/50 hover:bg-blue-600/5', icon: '👥' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col items-center gap-2 p-4 bg-white/3 border border-slate-800 rounded-2xl text-center transition-all duration-200 ${action.color} group`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Reports */}
        <div className="bg-navy-900/50 border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
            <h2 className="text-sm font-bold text-white">Recent Reports</h2>
            <Link href="/admin/reports" className="text-xs text-slate-500 hover:text-amber-400 transition-colors">View all →</Link>
          </div>
          <div className="divide-y divide-slate-800/40">
            {recentReports.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-600 text-sm">No reports yet</div>
            ) : (
              recentReports.map((r) => (
                <div key={r.id} className="px-4 py-3 hover:bg-white/2 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">{CATEGORY_ICONS[r.category] || '⚠️'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{r.title || r.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold uppercase ${SEVERITY_COLORS[r.severity] || 'bg-slate-800 text-slate-400'}`}>
                          {r.severity}
                        </span>
                        <span className="text-xs text-slate-500">{timeAgo(r.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active SOS */}
        <div className="bg-navy-900/50 border border-slate-800/60 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Active SOS Alerts</h2>
              {recentSos.length > 0 && (
                <span className="w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {recentSos.length}
                </span>
              )}
            </div>
            <Link href="/admin/sos" className="text-xs text-slate-500 hover:text-red-400 transition-colors">Manage →</Link>
          </div>
          <div className="divide-y divide-slate-800/40">
            {recentSos.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-slate-600 text-sm">No active SOS alerts</p>
              </div>
            ) : (
              recentSos.map((s) => (
                <div key={s.id} className="px-4 py-3 hover:bg-red-600/3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-red-300 truncate">{s.notes || 'Emergency SOS'}</p>
                      <p className="text-xs text-slate-500">{timeAgo(s.created_at)}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-600/30 rounded-full font-semibold animate-pulse uppercase">
                      {s.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
