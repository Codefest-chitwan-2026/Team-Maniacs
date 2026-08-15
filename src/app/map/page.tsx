"use client";

import React, { useEffect, useState } from 'react';
import DisasterMap from '@/components/disaster-map';
import { SatarkStore } from '@/lib/db/store';
import { EmergencyReport, Alert } from '@/types';

export default function MapPage() {
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    SatarkStore.initStore();

    (async () => {
      const r = await SatarkStore.getReports();
      const a = await SatarkStore.getAlerts();
      setReports(r);
      setAlerts(a);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white">Live Map</h1>
        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-navy-900 border border-slate-800 rounded px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="flood">Flood</option>
            <option value="landslide">Landslide</option>
            <option value="earthquake">Earthquake</option>
            <option value="fire">Fire</option>
            <option value="storm">Storm</option>
            <option value="medical">Medical</option>
            <option value="building">Building</option>
            <option value="road">Road</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <DisasterMap reports={reports} alerts={alerts} selectedCategory={category} />
    </div>
  );
}
