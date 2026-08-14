"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { SatarkStore } from '@/lib/db/store';
import { EmergencyReport } from '@/types';
import { AlertTriangle, Check, Star, Users, CheckSquare, User, Lock, MapPin } from 'lucide-react';

type Activity = {
  id: string;
  type: 'report' | 'verified' | 'points' | 'volunteer' | 'checklist' | 'profile' | 'security' | 'preference';
  title: string;
  subtitle?: string;
  date: string;
  meta?: any;
};

export default function ActivityPage() {
  const { t, language } = useLanguage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<'all' | 'reports' | 'safety' | 'points' | 'account'>('all');
  const [selected, setSelected] = useState<Activity | null>(null);

  useEffect(() => {
    async function load() {
      const reports: EmergencyReport[] = await SatarkStore.getReports();
      const tx = await SatarkStore.getTransactions();
      const logs = await SatarkStore.getAuditLogs();

      const items: Activity[] = [];

      // map reports
      reports.forEach((r) => {
        items.push({
          id: r.id,
          type: 'report',
          title: language === 'np' ? 'आपतकालीन रिपोर्ट पेश' : 'Emergency report submitted',
          subtitle: r.address || r.description || r.type,
          date: r.createdAt || r.updatedAt || new Date().toISOString(),
          meta: r,
        });
        if (r.status === 'VERIFIED') {
          items.push({
            id: `${r.id}-v`,
            type: 'verified',
            title: language === 'np' ? 'रिपोर्ट प्रमाणित' : 'Report verified',
            subtitle: r.address || r.description,
            date: r.updatedAt || new Date().toISOString(),
            meta: r,
          });
        }
      });

      // points
      tx.forEach((titem: any) => {
        items.push({
          id: titem.id,
          type: 'points',
          title: language === 'np' ? 'Satark अंक प्राप्त' : 'Satark Points earned',
          subtitle: titem.reason,
          date: titem.createdAt,
          meta: titem,
        });
      });

      // audit logs
      logs.forEach((l) => {
        items.push({
          id: l.id,
          type: l.action?.toLowerCase().includes('password') ? 'security' : 'profile',
          title: l.action,
          subtitle: `${l.entityType} ${l.entityId}`,
          date: l.createdAt,
          meta: l,
        });
      });

      // sort by date desc
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setActivities(items);
    }
    load();
  }, [language]);

  const filtered = activities.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'reports') return a.type === 'report' || a.type === 'verified';
    if (filter === 'safety') return a.type === 'checklist' || a.type === 'preference';
    if (filter === 'points') return a.type === 'points';
    if (filter === 'account') return a.type === 'profile' || a.type === 'security';
    return true;
  });

  const fmt = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString(language === 'np' ? 'ne-NP' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const iconFor = (type: Activity['type']) => {
    switch (type) {
      case 'report': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'verified': return <Check className="w-5 h-5 text-emerald-300" />;
      case 'points': return <Star className="w-5 h-5 text-amber-400" />;
      case 'volunteer': return <Users className="w-5 h-5 text-sky-400" />;
      case 'checklist': return <CheckSquare className="w-5 h-5 text-safe-500" />;
      case 'profile': return <User className="w-5 h-5 text-slate-300" />;
      case 'security': return <Lock className="w-5 h-5 text-rose-400" />;
      default: return <MapPin className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-extrabold">{language === 'np' ? 'गतिविधि लग' : 'Activity Log'}</h2>
        <p className="text-sm text-slate-400 mt-1">{language === 'np' ? 'तपाईंका पछिल्ला क्रियाकलापहरू तल छन्।' : 'Your recent actions and important account activities.'}</p>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {['all', 'reports', 'safety', 'points', 'account'].map((f) => (
            <button key={f} onClick={() => setFilter(f as any)} className={`px-3 py-1 text-xs rounded-xl border ${filter === f ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-navy-950 text-slate-300 border-slate-800'}`}>
              {f === 'all' ? (language === 'np' ? 'सबै' : 'All') : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <div className="p-6 text-center text-slate-400">{language === 'np' ? 'अहिलेसम्म कुनै गतिविधि छैन' : 'No activity yet'}<div className="text-xs mt-1">{language === 'np' ? 'यहाँ तपाईंका Satark गतिविधिहरू देखा पर्नेछन्।' : 'Your Satark Nepal activities will appear here.'}</div></div>
          )}

          {filtered.map((a) => (
            <div key={a.id} className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-start gap-3">
              <div className="pt-1">{iconFor(a.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white">{a.title}</div>
                  <div className="text-xs text-slate-400">{fmt(a.date)}</div>
                </div>
                {a.subtitle && <div className="text-xs text-slate-300 mt-1 line-clamp-2">{a.subtitle}</div>}
                <div className="mt-2">
                  <button onClick={() => setSelected(a)} className="text-amber-400 text-xs font-bold">{language === 'np' ? 'विवरण' : 'Details'}</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4"><Link href="/profile" className="text-amber-400">{language === 'np' ? 'ड्यासबोर्डमा फिर्ता जानुहोस्' : 'Back to dashboard'}</Link></div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 max-w-xl w-full">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-bold text-white">{selected.title}</div>
                <div className="text-xs text-slate-400">{fmt(selected.date)}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400">Close</button>
            </div>
            <div className="mt-3 text-sm text-slate-300">
              {selected.type === 'report' && (
                <div>
                  <div className="font-bold">{(selected.meta as EmergencyReport).type}</div>
                  <div className="mt-2">{(selected.meta as EmergencyReport).address}</div>
                  <div className="mt-2 text-xs text-slate-400">Status: {(selected.meta as EmergencyReport).status}</div>
                </div>
              )}
              {selected.type === 'points' && (
                <div>
                  <div className="font-bold">{selected.subtitle}</div>
                  <div className="mt-2 text-xs text-slate-400">Points transaction: {(selected.meta as any).points}</div>
                </div>
              )}
              {(selected.type === 'profile' || selected.type === 'security') && (
                <div>
                  <div className="font-bold">{selected.subtitle}</div>
                  <div className="mt-2 text-xs text-slate-400">Recorded by: {(selected.meta as any).adminName || (selected.meta as any).adminId || 'System'}</div>
                </div>
              )}
            </div>
            <div className="mt-4 text-right">
              <button onClick={() => setSelected(null)} className="px-3 py-1 rounded-xl bg-navy-950 border border-slate-800">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}