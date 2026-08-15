"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SatarkStore } from '@/lib/db/store';
import { UserProfile } from '@/types';

type AuthContextValue = {
  user: UserProfile | null;
  loginWithEmailPhone: (email: string, phone: string, name?: string) => Promise<UserProfile>;
  updateProfile: (p: UserProfile) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    SatarkStore.initStore();
    const p = SatarkStore.getUserProfile();
    setUser(p);
  }, []);

  const loginWithEmailPhone = async (email: string, phone: string, name?: string) => {
    // For dev: if existing profile email or phone matches, use it; otherwise create a new profile
    SatarkStore.initStore();
    const existing = SatarkStore.getUserProfile();

    let profile: UserProfile | null = null;

    if (existing && (existing.email === email || existing.phone === phone)) {
      profile = { ...existing, email: email || existing.email, phone: phone || existing.phone, name: name || existing.name };
    } else {
      profile = {
        id: `USR-${Math.floor(100000 + Math.random() * 900000)}`,
        name: name || 'New User',
        email: email || '',
        phone: phone || '',
        location: 'Unknown',
        language: 'np',
        role: 'citizen',
        satarkPoints: 0,
        rank: 'Newcomer',
        isVolunteer: false,
      };
    }

    SatarkStore.setUserProfile(profile);
    try { localStorage.setItem('satark_token', profile.id); } catch { }
    setUser(profile);
    // Sync profile to Supabase (server) to ensure role and DB record exist
    try {
      fetch('/api/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: profile.id, name: profile.name, email: profile.email, phone: profile.phone }),
      });
    } catch (e) { }
    return profile;
  };



  const updateProfile = (p: UserProfile) => {
    SatarkStore.setUserProfile(p);
    setUser(p);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithEmailPhone, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthProvider;
