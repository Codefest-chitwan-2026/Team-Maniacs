'use client';

import React from 'react';
import { Shield, AlertCircle, CheckCircle2, CloudRain, Flame, AlertTriangle } from 'lucide-react';
import { SatarkPulseState } from '@/types';
import { useLanguage } from '@/context/language-context';

export default function SatarkPulseCard({ pulse }: { pulse: SatarkPulseState }) {
  const { t, language } = useLanguage();

  const getRiskBadge = () => {
    switch (pulse.riskLevel) {
      case 'HIGH':
        return {
          bg: 'bg-red-600/20 border-red-600 text-red-400',
          indicator: 'bg-red-600 animate-ping',
          label: t.riskHigh,
          icon: AlertTriangle,
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500/20 border-amber-500 text-amber-400',
          indicator: 'bg-amber-500 animate-pulse',
          label: t.riskModerate,
          icon: AlertCircle,
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-safe-500/20 border-safe-500 text-safe-500',
          indicator: 'bg-safe-500',
          label: t.riskLow,
          icon: CheckCircle2,
        };
    }
  };

  const badge = getRiskBadge();
  const Icon = badge.icon;

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-navy-800 border border-slate-700">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
              <span>{t.satarkPulseTitle}</span>
              <span className="text-[10px] bg-navy-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                Pulse v2.4
              </span>
            </h2>
            <p className="text-xs text-slate-400">{t.satarkPulseSubtitle}</p>
          </div>
        </div>

        {/* Risk Pill */}
        <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-full font-bold text-xs md:text-sm ${badge.bg}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${badge.indicator}`}></span>
          <Icon className="w-4 h-4" />
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Breakdown Reasons */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          {t.whyRiskHeading}
        </h4>
        <div className="space-y-2">
          {pulse.reasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs md:text-sm text-slate-200 bg-navy-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-amber-400 font-bold">•</span>
              <span>{language === 'np' ? reason.np : reason.en}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80">
        <span className="flex items-center gap-1">
          <CloudRain className="w-3.5 h-3.5 text-blue-400" />
          {pulse.heavyRain ? (language === 'np' ? 'भारी वर्षा जारी' : 'Heavy Rainfall Active') : (language === 'np' ? 'सामान्य वर्षा' : 'Normal Rainfall')}
        </span>
        <span>
          {t.updatedMinutesAgo}: {pulse.updatedAt}
        </span>
      </div>
    </div>
  );
}