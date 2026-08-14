'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Award, ShieldCheck, Star, Heart, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { SatarkStore } from '@/lib/db/store';
import { Volunteer, SatarkPointTransaction } from '@/types';
import getSatarkRank from '@/lib/satark-rank';

export default function LeadershipPage() {
  const { t, language } = useLanguage();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [transactions, setTransactions] = useState<SatarkPointTransaction[]>([]);

  useEffect(() => {
    async function loadData() {
      const vols = await SatarkStore.getVolunteers();
      setVolunteers(vols.sort((a, b) => b.points - a.points));
      setTransactions(await SatarkStore.getTransactions());
    }
    loadData();
  }, []);

  const getRankBadgeStyle = (rankName: string) => {
    switch (rankName) {
      case 'Satark Hero':
      case 'Satark Hero':
        return 'bg-amber-500/20 text-amber-400 border-amber-400/50';
      case 'Guardian':
        return 'bg-purple-500/20 text-purple-400 border-purple-400/50';
      case 'Responder':
        return 'bg-blue-500/20 text-blue-400 border-blue-400/50';
      case 'Community Leader':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-400/50';
      case 'Satark Champion':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50';
      case 'Helper':
      default:
        return 'bg-safe-500/20 text-safe-500 border-safe-500/50';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-2">
        <div className="w-14 h-14 bg-amber-500/20 border-2 border-amber-400 rounded-full flex items-center justify-center mx-auto text-amber-400 shadow-lg">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white">
          ⭐ {t.pointsTitle}
        </h2>
        <p className="text-xs text-slate-300 max-w-xl mx-auto">
          {t.pointsSubtitle}
        </p>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="font-extrabold text-white text-base flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Top Community Responders Leaderboard</span>
        </h3>

        <div className="space-y-3">
          {volunteers.map((vol, idx) => {
            const rankInfo = getSatarkRank(vol.points || 0);
            const displayRank = rankInfo.name;
            return (
              <div
                key={vol.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition ${idx === 0
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                    : 'bg-navy-950 border-slate-800'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${idx === 0
                        ? 'bg-amber-500 text-slate-950'
                        : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-navy-800 text-slate-400'
                      }`}
                  >
                    #{idx + 1}
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                      {vol.userName}
                      {vol.verified && <ShieldCheck className="w-3.5 h-3.5 text-safe-500" />}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {vol.area} • {vol.reliefTasksCompleted} tasks completed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`hidden sm:inline-block text-[10px] font-bold px-2.5 py-1 rounded-full border ${getRankBadgeStyle(
                      displayRank
                    )}`}
                  >
                    {displayRank}
                  </span>

                  <div className="text-right">
                    <span className="font-black text-amber-400 text-base block">
                      +{vol.points}
                    </span>
                    <span className="text-[10px] text-slate-400">Satark Points</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How Satark Points Work */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs text-slate-300">
        <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          <span>How to Earn Satark Points</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-navy-950 p-3 rounded-xl border border-slate-800">
            <span className="font-black text-amber-400 text-sm block mb-1">+20 Points</span>
            <p className="font-bold text-white">Verified Disaster Report</p>
            <p className="text-slate-400 mt-0.5">Submitting an accurate geo-tagged report verified by ward coordinators.</p>
          </div>
          <div className="bg-navy-950 p-3 rounded-xl border border-slate-800">
            <span className="font-black text-amber-400 text-sm block mb-1">+15 Points</span>
            <p className="font-bold text-white">Volunteer Action Accepted</p>
            <p className="text-slate-400 mt-0.5">Responding "I CAN HELP" on an active community relief request.</p>
          </div>
          <div className="bg-navy-950 p-3 rounded-xl border border-slate-800">
            <span className="font-black text-amber-400 text-sm block mb-1">+30 Points</span>
            <p className="font-bold text-white">Relief Task Completed</p>
            <p className="text-slate-400 mt-0.5">Delivering food, medical, or evacuation aid to displaced victims.</p>
          </div>
        </div>
      </div>
    </div>
  );
}