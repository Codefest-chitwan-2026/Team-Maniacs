'use client';

import React from 'react';
import { Bot, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { AIVerification } from '@/types';
import { useLanguage } from '@/context/language-context';

export default function AIAnalysisCard({ ai }: { ai?: AIVerification }) {
  const { t } = useLanguage();

  if (!ai) {
    return (
      <div className="bg-navy-950/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <Bot className="w-4 h-4 text-amber-400" />
          <span>{t.satarkAITitle}</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">{t.satarkAIOffline}</p>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (ai.status) {
      case 'Verified':
        return 'text-safe-500 bg-safe-500/10 border-safe-500/30';
      case 'Needs Review':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Suspicious':
      default:
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  return (
    <div className="bg-navy-950 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-amber-400" />
          <span className="font-extrabold text-white text-xs tracking-wide">
            🤖 Satark AI Intelligence
          </span>
        </div>

        <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor()}`}>
          {ai.status}
        </div>
      </div>

      {/* Confidence Bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
          <span>{t.confidenceLabel}</span>
          <span className="text-amber-400">{ai.confidence}%</span>
        </div>
        <div className="w-full bg-navy-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${ai.confidence >= 80 ? 'bg-safe-500' : ai.confidence >= 60 ? 'bg-amber-400' : 'bg-red-500'
              }`}
            style={{ width: `${ai.confidence}%` }}
          ></div>
        </div>
      </div>

      {/* Observations */}
      <div>
        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Analysis Observations
        </h5>
        <ul className="space-y-1 text-xs text-slate-300">
          {ai.observations.map((obs, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-amber-400 text-xs">•</span>
              <span>{obs}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendation */}
      <div className="bg-navy-900 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300">
        <p className="font-bold text-white mb-0.5">AI Recommendation:</p>
        <p>{ai.recommendation}</p>
      </div>

      <p className="text-[10px] text-slate-400 italic">
        * Satark AI is an assistance tool. Final decision rests with human ward emergency coordinators.
      </p>
    </div>
  );
}