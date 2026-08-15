"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!resp.ok) {
        const j = await resp.json();
        setError(j?.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Optionally seed an admin profile locally for display inside admin UI
      try {
        localStorage.setItem('satark_admin_profile', JSON.stringify({
          id: 'ADMIN-1',
          name: 'Satark Admin',
          email,
          role: 'admin',
          satarkPoints: 0,
          phone: '',
          location: 'Remote',
          language: 'en',
          rank: 'Guardian',
          isVolunteer: false,
        }));
      } catch (e) {}

      router.push('/admin');
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-extrabold">Admin Sign in</h2>
        <p className="text-sm text-slate-400 mt-1">Sign in with your admin credentials.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs text-slate-300">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-navy-950 border border-slate-800" />
          </div>

          <div>
            <label className="text-xs text-slate-300">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full mt-1 p-3 rounded-xl bg-navy-950 border border-slate-800" />
          </div>

          {error ? <div className="text-sm text-red-400">{error}</div> : null}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <button type="button" onClick={() => router.push('/')} className="px-4 py-2 rounded-lg border border-slate-800">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
