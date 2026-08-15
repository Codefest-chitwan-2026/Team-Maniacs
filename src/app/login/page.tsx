"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [citizenshipPhoto, setCitizenshipPhoto] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.loginWithEmailPhone(email.trim(), phone.trim(), name.trim() || undefined);
      router.push('/profile');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-extrabold">Login / Sign up</h2>
        <p className="text-sm text-slate-400 mt-1">Enter your email and phone to continue.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs text-slate-300">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-navy-950 border border-slate-800" />
          </div>

          <div>
            <label className="text-xs text-slate-300">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-navy-950 border border-slate-800" />
          </div>

          <div>
            <label className="text-xs text-slate-300">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-navy-950 border border-slate-800" />
          </div>

          <div>
            <label className="text-xs text-slate-300">Citizenship photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCitizenshipPhoto(e.target.files?.[0] ?? null)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-navy-950 p-3 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-2 file:font-bold file:text-slate-900 file:cursor-pointer"
            />
            {citizenshipPhoto && (
              <p className="mt-1 text-xs text-slate-400">Selected: {citizenshipPhoto.name}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-300">Selfie</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelfie(e.target.files?.[0] ?? null)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-navy-950 p-3 text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-2 file:font-bold file:text-slate-900 file:cursor-pointer"
            />
            {selfie && (
              <p className="mt-1 text-xs text-slate-400">Selected: {selfie.name}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold">
              {loading ? 'Signing in...' : 'Sign in / Sign up'}
            </button>
            <button type="button" onClick={() => router.push('/')} className="px-4 py-2 rounded-lg border border-slate-800">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
