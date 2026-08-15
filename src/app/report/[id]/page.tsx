"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SatarkStore } from '@/lib/db/store';
import { EmergencyReport } from '@/types';
import TrustBadge from '@/components/trust-badge';
import { ArrowLeft } from 'lucide-react';

export default function ReportDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [report, setReport] = useState<EmergencyReport | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const all = await SatarkStore.getReports();
      const found = all.find((r) => r.id === id) || null;
      if (!mounted) return;
      setReport(found);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <button onClick={() => router.back()} className="mb-4 text-xs text-slate-400 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 text-slate-400">Report not found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <button onClick={() => router.back()} className="text-xs text-slate-400 flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white">{report.type} • {report.address}</h2>
            <p className="text-xs text-slate-400 mt-1">Report ID: <span className="font-mono text-amber-400">{report.id}</span></p>
          </div>

          <div className="text-right">
            <TrustBadge trustLevel={report.trustLevel} />
            <div className="text-xs text-slate-400 mt-1">Status: <span className="font-bold text-white">{report.status}</span></div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-3">
            <p className="text-sm text-slate-200">{report.description}</p>
            {report.mediaUrl && <img src={report.mediaUrl} alt="media" className="w-full h-60 object-cover rounded-lg" />}
            <div className="pt-2 text-xs text-slate-400">
              <div>Reported by: {report.userName || 'Anonymous'}</div>
              <div>Contact: {report.userPhone || '—'}</div>
              <div>Priority: {report.priority}</div>
              <div>Created At: {new Date(report.createdAt).toLocaleString()}</div>
            </div>
          </div>

          <div className="md:col-span-1 bg-navy-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs text-slate-400">Location</div>
            <div className="text-sm font-bold text-white">{report.address}</div>
            <div className="text-xs text-slate-400">Coords</div>
            <div className="text-sm text-white">{report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}</div>
            <button
              onClick={() => router.push(`/map`)}
              className="w-full mt-3 bg-amber-500 text-slate-900 font-bold py-2 rounded-lg text-xs"
            >
              View on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}