"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SatarkStore } from '@/lib/db/store';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const p = SatarkStore.getUserProfile();
    setProfile(p);
    if (p) {
      setName(p.name || '');
      setEmail(p.email || '');
      setPhone(p.phone || '');
      setLocation(p.location || '');
      // support legacy extra fields
      setAbout((p as any).about || '');
      setAvatar((p as any).avatar || null);
    }
    setLoading(false);
  }, []);

  const handleFile = async (file?: File | null) => {
    if (!file) return null;
    return new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const updated = {
      ...(profile || {}),
      name,
      email,
      phone,
      location,
      about,
      avatar,
    };
    SatarkStore.setUserProfile(updated);
    setLoading(false);
    router.push('/profile');
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-extrabold">Edit Profile</h2>
        <p className="text-sm text-slate-400 mt-1">Update your profile information.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <label className="text-xs text-slate-300">Avatar</label>
            <div className="sm:col-span-2 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-2xl overflow-hidden">
                {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : (profile?.name?.charAt(0) || 'U')}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const data = await handleFile(f);
                  if (data) setAvatar(data);
                }}
                className="text-sm"
              />
            </div>
          </div>

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
            <label className="text-xs text-slate-300">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-navy-950 border border-slate-800" />
          </div>

          <div>
            <label className="text-xs text-slate-300">About / Bio</label>
            <textarea value={about} onChange={(e) => setAbout(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-navy-950 border border-slate-800" rows={4} />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold">Save profile</button>
            <button type="button" onClick={() => router.push('/profile')} className="px-4 py-2 rounded-lg border border-slate-800">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
