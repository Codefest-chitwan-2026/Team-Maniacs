"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { UserProfile } from '@/types';
import { Edit, Mail, Phone, MapPin, Award } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const auth = useAuth();
  const profile = auth.user;


  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
          <h2 className="text-xl font-extrabold">You are not logged in</h2>
          <p className="text-sm text-slate-400 mt-2">Please login to view your profile.</p>
          <div className="mt-4">
            <button onClick={() => router.push('/login')} className="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-bold">Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  const initials = profile.name ? profile.name.split(' ').map(s => s.charAt(0)).slice(0, 2).join('').toUpperCase() : 'U';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-3xl overflow-hidden">
            {(profile as any).avatar ? <img src={(profile as any).avatar} alt="avatar" className="w-full h-full object-cover" /> : initials}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold">{profile.name}</h1>
                <p className="text-sm text-slate-400 mt-1">{profile.role?.toUpperCase() || 'CITIZEN'}</p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => router.push('/profile/edit')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 border border-slate-800">
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Edit profile</span>
                </button>


              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-navy-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Contact</div>
                <div className="mt-2 flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-200"><Mail className="w-4 h-4 text-slate-400" /> {profile.email}</div>
                  <div className="flex items-center gap-2 text-slate-200"><Phone className="w-4 h-4 text-slate-400" /> {profile.phone}</div>
                  <div className="flex items-center gap-2 text-slate-200"><MapPin className="w-4 h-4 text-slate-400" /> {profile.location}</div>
                </div>
              </div>

              <div className="bg-navy-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Satark Points</div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-extrabold text-amber-400">{profile.satarkPoints}</div>
                    <div className="text-xs text-slate-400">Rank: {profile.rank}</div>
                  </div>
                  <div className="text-slate-300 flex items-center gap-2"><Award className="w-5 h-5" /> </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {profile && (profile as any).about && (
          <div className="mt-6 bg-navy-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300">
            {(profile as any).about}
          </div>
        )}
      </div>
    </div>
  );
}
