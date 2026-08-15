'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, HeartHandshake, Shield, MapPin, ArrowRight, Bell, ChevronRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { SatarkStore } from '@/lib/db/store';
import { calculateSatarkPulse } from '@/lib/satark-pulse';
import { INITIAL_WEATHER } from '@/lib/db/mock-data';
import { EmergencyReport, Alert, SatarkPulseState } from '@/types';
import SatarkPulseCard from '@/components/satark-pulse-card';
import WeatherWidget from '@/components/weather-widget';
import TrustBadge from '@/components/trust-badge';

export default function HomePage() {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [pulse, setPulse] = useState<SatarkPulseState | null>(null);

  useEffect(() => {
    async function loadData() {
      const rep = await SatarkStore.getReports();
      const alt = await SatarkStore.getAlerts();
      setReports(rep);
      setAlerts(alt);
      const calculatedPulse = calculateSatarkPulse(rep, INITIAL_WEATHER);
      setPulse(calculatedPulse);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Primary Emergency Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          aria-label="Open SOS modal"
          onClick={() => {
            try { window.dispatchEvent(new CustomEvent('open-sos')); } catch (e) { /* ignore */ }
          }}
          className="group relative bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl p-6 shadow-xl shadow-red-600/30 border border-red-500/50 flex flex-col justify-center items-center text-center transition-all transform hover:-translate-y-0.5"
        >
          {/* icons removed to highlight large SOS text */}
          <div className="mt-2">
            <span className="block font-black text-7xl md:text-9xl leading-none tracking-tight uppercase text-white" style={{ color: '#ffffff' }}>SOS</span>
            <span className="block text-xs md:text-sm font-semibold tracking-wide text-red-100 mt-2">
              {language === 'np' ? 'छिटो प्रतिक्रिया, सशक्त उद्धार' : 'Quick Response, Stronger Rescue'}
            </span>
          </div>
        </button>

        <Link
          href="/report"
          className="group relative bg-gradient-to-r from-navy-800 via-navy-800 to-navy-900 hover:from-navy-700 hover:to-navy-800 text-white rounded-2xl p-6 shadow-xl border border-slate-700 flex flex-col justify-between transition-all transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl">📢</span>
            <ArrowRight className="w-6 h-6 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="mt-4">
            <h3 className="font-black text-xl tracking-tight uppercase text-yellow-400 force-yellow">
              {t.reportEmergency}
            </h3>
            <p className="text-xs text-white mt-1">
              {language === 'np'
                ? 'नजिकैको घटना, सडक अवरोध वा आगलागीको तस्विर र स्थान पोस्ट गर्नुहोस्'
                : 'Submit geo-tagged report with photo/video proof for rapid response'}
            </p>
          </div>
        </Link>
      </div>

      {/* Satark Pulse & Weather Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pulse && <SatarkPulseCard pulse={pulse} />}
        <WeatherWidget />
      </div>

      {/* Active Alerts Section */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500 animate-bounce" />
            <h3 className="font-extrabold text-white text-base">
              {t.activeAlerts}
            </h3>
          </div>
          <Link
            href="/map"
            className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>{t.viewAllOnMap}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-navy-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-red-600/30 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/40">
                    {t.officialAlert}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400" />
                    {alert.location}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">
                  {language === 'np' && alert.titleNp ? alert.titleNp : alert.title}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {language === 'np' && alert.descriptionNp ? alert.descriptionNp : alert.description}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                <TrustBadge trustLevel="HIGH" />
              </div>
            </div>
          ))}

          {alerts.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">
              {t.noAlerts}
            </p>
          )}
        </div>
      </div>

      {/* Nearby Support & Shelters Summary */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>{t.nearbyShelters}</span>
          </h4>
          <Link href="/relief" className="text-xs text-slate-400 hover:text-white underline">
            {t.navRelief}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-navy-950 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Birendra Sainik Ground Shelter</p>
              <p className="text-slate-400 mt-0.5">Suryabinayak, Bhaktapur • Capacity: 250</p>
              <span className="inline-block mt-1 bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">
                OPEN & SUPPLIED
              </span>
            </div>
          </div>

          <div className="bg-navy-950 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Patan High School Safe Hall</p>
              <p className="text-slate-400 mt-0.5">Mangal Bazaar, Lalitpur • Capacity: 180</p>
              <span className="inline-block mt-1 bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">
                OPEN & SUPPLIED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}