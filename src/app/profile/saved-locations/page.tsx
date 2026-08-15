
'use client';

import React, { useState, useEffect } from 'react';
import { User, Shield, Star, Globe, CheckSquare, Bell, MapPin, Clock, Award, FileText, Users, Settings } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { SatarkStore } from '@/lib/db/store';
import { UserProfile, EmergencyReport } from '@/types';
import getSatarkRank from '@/lib/satark-rank';
import TrustBadge from '@/components/trust-badge';
import Link from 'next/link';

export default function ProfilePage() {
  const { t, language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myReports, setMyReports] = useState<EmergencyReport[]>([]);
  const [checkedList, setCheckedList] = useState<number[]>([1, 2]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const p = SatarkStore.getUserProfile();
      setProfile(p);
      const allReports = await SatarkStore.getReports();
      setMyReports(allReports.filter((r) => r.userId === (p?.id || 'USR-CURRENT') || r.userName === p?.name));
      const tx = await SatarkStore.getTransactions();
      setTransactions(tx);
      const vols = await SatarkStore.getVolunteers();
      setVolunteers(vols);
    }
    loadData();
  }, []);

  const toggleCheck = (id: number) => {
    if (checkedList.includes(id)) setCheckedList(checkedList.filter((i) => i !== id));
    else setCheckedList([...checkedList, id]);
  };

  if (!profile) return null;

  // Derived stats
  const reportsSubmitted = myReports.length;
  const verifiedReports = myReports.filter((r) => r.status === 'VERIFIED').length;
  const volunteerRecord = volunteers.find((v) => v.userId === profile.id || v.id === profile.id) || null;
  const volunteerContributions = volunteerRecord ? (volunteerRecord.reportsVerifiedCount || 0) + (volunteerRecord.reliefTasksCompleted || 0) : 0;

  // Achievements (simple rules)
  const achievements = [
    { id: 'safety-ready', label: language === 'np' ? 'सुरक्षा तयार' : 'Safety Ready', unlocked: checkedList.length >= 3 },
    { id: 'first-reporter', label: language === 'np' ? 'पहिलो रिपोर्टर' : 'First Reporter', unlocked: reportsSubmitted > 0 },
    { id: 'community-helper', label: language === 'np' ? 'समुदाय सहयोगी' : 'Community Helper', unlocked: volunteerContributions > 0 },
    { id: '100-points', label: '100 Satark Points', unlocked: profile.satarkPoints >= 100 },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Rank info (centralized)
  const rankInfo = getSatarkRank(profile.satarkPoints || 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-lg border-2 border-white/20 overflow-hidden">
            {/* show avatar if available */}
            {/* profile may have avatar as any */}
            {(profile as any).avatar ? (
              <img src={(profile as any).avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              profile.name.charAt(0)
            )}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">{profile.name}</h2>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              {profile.location}
            </p>
          </div>
        </div>

        <div className="bg-navy-950 p-4 rounded-xl border border-slate-800 text-center sm:text-right w-full sm:w-auto">
          <div className="flex items-center justify-center sm:justify-end gap-2 text-amber-400">
            <Star className="w-5 h-5 fill-amber-400" />
            <div className="text-right">
              <div className="font-black text-2xl">{profile.satarkPoints} <span className="text-sm font-medium">{language === 'np' ? 'सतर्क पोइन्ट' : 'Satark Points'}</span></div>
              <div className="text-[10px] bg-navy-800 text-slate-300 px-2 py-0.5 rounded font-bold border border-slate-700 uppercase mt-1">{rankInfo.name.toUpperCase()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Satark Impact */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="font-bold text-white text-sm flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" />{language === 'np' ? 'Satark प्रभाव' : 'Satark Impact'}</h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-center">
            <div className="text-amber-400 font-black text-lg">{profile.satarkPoints}</div>
            <div className="text-xs text-slate-400">{language === 'np' ? 'Satark Points' : 'Satark Points'}</div>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-center">
            <div className="text-emerald-300 font-black text-lg">{rankInfo.name}</div>
            <div className="text-xs text-slate-400">{language === 'np' ? 'वर्तमान रैंक' : 'Current Rank'}</div>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
            <div className="text-xs text-slate-400">{language === 'np' ? 'प्रगति अगाडि' : 'Progress toward next rank'}</div>
            <div className="mt-2">
              {rankInfo.nextRank ? (
                <>
                  <div className="text-[12px] text-slate-300 font-semibold">{language === 'np' ? 'प्रगति' : 'Progress'} {language === 'np' ? 'अर्को' : 'to'}: {rankInfo.nextRank}</div>
                  <div className="mt-2 w-full bg-navy-900 rounded-full h-3 border border-slate-800 overflow-hidden">
                    <div className="h-3 bg-amber-400" style={{ width: `${rankInfo.progressPercent}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-300 mt-2">{profile.satarkPoints} / {rankInfo.nextMin} • Next: {rankInfo.nextRank}</div>
                  <div className="text-xs text-slate-400 mt-1">{rankInfo.pointsToNext !== null ? `${rankInfo.pointsToNext} ${language === 'np' ? 'पॉइन्ट' : 'points'} ${language === 'np' ? 'आवश्यक' : 'to next rank'}` : (language === 'np' ? 'उच्चतम स्तर' : 'MAX RANK')}</div>
                </>
              ) : (
                <div className="text-sm text-emerald-300 font-bold">{language === 'np' ? 'अधिकतम स्तर' : 'MAX RANK'}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="font-bold text-white text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-red-500" />{language === 'np' ? 'गतिविधि सारांश' : 'Activity Summary'}</h3>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-center">
            <div className="font-black text-lg text-amber-400">{reportsSubmitted}</div>
            <div className="text-xs text-slate-400">{language === 'np' ? 'रिपोर्टहरू' : 'Reports'}</div>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-center">
            <div className="font-black text-lg text-emerald-300">{verifiedReports}</div>
            <div className="text-xs text-slate-400">{language === 'np' ? 'प्रमाणित' : 'Verified'}</div>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-center">
            <div className="font-black text-lg text-sky-400">{volunteerContributions}</div>
            <div className="text-xs text-slate-400">{language === 'np' ? 'स्वयंसेवक योगदान' : 'Volunteer'}</div>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-center flex flex-col justify-center">
            <div className="text-xs text-slate-300">{unlockedCount} / {achievements.length} {language === 'np' ? 'उपलब्धि' : 'Achievements'}</div>
            <Link href="/activity" className="mt-2 text-xs text-amber-400 font-bold">{language === 'np' ? 'गतिविधि हेर्नुहोस्' : 'View Activity Log'}</Link>
          </div>
        </div>
      </div>

      {/* My Safety */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="font-bold text-white text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-300" />{language === 'np' ? 'मेरो सुरक्षा' : 'My Safety'}</h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-center">
            <div className="font-black text-lg text-amber-400">{(typeof window !== 'undefined' && JSON.parse(localStorage.getItem('satark_safe_locations') || '[]').length) || 0}</div>
            <div className="text-xs text-slate-400">{language === 'np' ? 'सुरक्षित स्थानहरू' : 'Saved Locations'}</div>
            <Link href="/profile/saved-locations" className="mt-2 block text-xs text-amber-400">{language === 'np' ? 'प्रबन्ध गर्नुहोस्' : 'Manage'}</Link>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-center">
            <div className="font-black text-lg text-emerald-300">{(typeof window !== 'undefined' && JSON.parse(localStorage.getItem('satark_contacts') || '[]').length) || 0}</div>
            <div className="text-xs text-slate-400">{language === 'np' ? 'आपतकालीन सम्पर्क' : 'Emergency Contacts'}</div>
            <Link href="/profile/contacts" className="mt-2 block text-xs text-amber-400">{language === 'np' ? 'प्रबन्ध गर्नुहोस्' : 'Manage'}</Link>
          </div>
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-center">
            <div className="font-black text-lg text-sky-400">{(typeof window !== 'undefined' && JSON.parse(localStorage.getItem('satark_alert_prefs') || '{}').enabled ? 'On' : 'Off')}</div>
            <div className="text-xs text-slate-400">{language === 'np' ? 'अलर्ट प्राथमिकता' : 'Alert Preferences'}</div>
            <Link href="/profile/alert-preferences" className="mt-2 block text-xs text-amber-400">{language === 'np' ? 'समायोजन' : 'Manage'}</Link>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="font-bold text-white text-sm flex items-center gap-2"><Award className="w-4 h-4 text-amber-400" />{language === 'np' ? 'उपलब्धि' : 'Achievements'}</h3>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.map((a) => (
            <div key={a.id} className={`p-3 rounded-xl border ${a.unlocked ? 'bg-navy-950 border-amber-400' : 'bg-navy-950 border-slate-800'} text-center`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${a.unlocked ? 'bg-amber-400 text-slate-900' : 'bg-navy-900 text-slate-400'}`}>{a.unlocked ? '✓' : '–'}</div>
              <div className="text-xs text-slate-300 mt-2">{a.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
          <div>{unlockedCount} / {achievements.length} {language === 'np' ? 'उपलब्धि' : 'Achievements'}</div>
          <Link href="/achievements" className="text-amber-400 font-bold">View All</Link>
        </div>
      </div>

      {/* Language & Settings (kept small) */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-400" />
          <span>{t.langSetting}</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLanguage('np')}
            className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${language === 'np'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-navy-950 text-slate-300 border-slate-800'
              }`}
          >
            🇳🇵 नेपाली (Nepali)
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${language === 'en'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-navy-950 text-slate-300 border-slate-800'
              }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Emergency Preparedness Checklist */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-safe-500" />
          <span>{t.prepChecklistTitle}</span>
        </h3>

        <div className="space-y-2.5 text-xs">
          {[
            { id: 1, text: t.prep1 },
            { id: 2, text: t.prep2 },
            { id: 3, text: t.prep3 },
            { id: 4, text: t.prep4 },
          ].map((item) => {
            const isChecked = checkedList.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${isChecked
                    ? 'bg-safe-500/10 border-safe-500/40 text-white'
                    : 'bg-navy-950 border-slate-800 text-slate-400'
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center text-xs font-black ${isChecked ? 'bg-safe-500 text-slate-950' : 'border border-slate-700 bg-navy-900'
                    }`}
                >
                  {isChecked && '✓'}
                </div>
                <span className="font-medium">{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
