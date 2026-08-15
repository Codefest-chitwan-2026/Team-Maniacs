'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Shield, ChevronDown, ChevronUp, MapPin, Clock, Camera, Bot } from 'lucide-react';
import { TrustLevel, TrustDetails } from '@/types';
import { useLanguage } from '@/context/language-context';

export default function TrustBadge({
  trustLevel,
  details,
}: {
  trustLevel: TrustLevel;
  details?: TrustDetails;
}) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const getPill = () => {
    switch (trustLevel) {
      case 'HIGH':
        return {
          bg: 'bg-safe-500/20 text-safe-500 border-safe-500/50',
          label: t.trustHigh,
          icon: ShieldCheck,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
          label: t.trustMedium,
          icon: Shield,
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-red-500/20 text-red-400 border-red-500/50',
          label: t.trustLow,
          icon: ShieldAlert,
        };
    }
  };

  const pill = getPill();
  const Icon = pill.icon;

  return (
    <div className="inline-block">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-full text-xs font-bold transition hover:opacity-90 ${pill.bg}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{pill.label}</span>
        {details && (
          expanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />
        )}
      </button>

      {expanded && details && (
        <div className="mt-2 bg-navy-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 space-y-1.5 shadow-xl max-w-xs">
          <p className="font-bold text-white border-b border-slate-800 pb-1 mb-1">
            {t.trustLayerTitle}
          </p>
          <div className="flex items-center gap-2">
            <MapPin className={`w-3.5 h-3.5 ${details.gpsVerified ? 'text-safe-500' : 'text-slate-500'}`} />
            <span>{details.gpsVerified ? '✓ GPS Location Verified' : '✕ Manual Location (GPS Pending)'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-safe-500" />
            <span>✓ Recent Submission (&lt; 1 hour)</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className={`w-3.5 h-3.5 ${details.mediaAttached ? 'text-safe-500' : 'text-slate-500'}`} />
            <span>{details.mediaAttached ? '✓ Photo/Video Proof Attached' : '✕ No Media Attached'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>Satark AI: {details.aiStatus}</span>
          </div>
          {trustLevel === 'LOW' && (
            <p className="text-[10px] text-amber-400 italic pt-1 border-t border-slate-800">
              {t.trustLowNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}