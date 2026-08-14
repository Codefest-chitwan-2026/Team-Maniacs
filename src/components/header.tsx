'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Globe, AlertTriangle, Bell, Sun, Moon, LogOut, LogIn, User, Settings, HelpCircle, List } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import SOSModal from './sos-modal';
import { NavLinks } from './top-navbar';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('theme');
    const initial = saved === 'light' ? 'light' : 'dark';
    setTheme(initial);
    if (initial === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
    try { window.localStorage.setItem('theme', next); } catch { }
  };

  const handleAuthToggle = () => {
    setIsAuthenticated((s) => !s);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="bg-navy-900 border-b border-navy-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <img
                src="/satark.svg"
                alt="Satark Nepal"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // fallback to bundled svg if satark.svg fails to load
                  (e.currentTarget as HTMLImageElement).src = '/logo-fallback.svg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base md:text-lg tracking-tight text-white">Satark Nepal</span>
              </div>
            </div>
          </Link>

          {/* Center navigation links (desktop) */}
          <div className="hidden md:flex flex-1 justify-center px-6">
            <NavLinks />
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* SOS Whistle Quick Trigger */}
            <button
              onClick={() => setIsSosOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md shadow-red-600/40 animate-pulse-emergency"
            >
              <AlertTriangle className="w-4 h-4 fill-white" />
              <span>SOS</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'np' ? 'en' : 'np')}
              className="flex items-center gap-1 bg-navy-800 hover:bg-navy-700 border border-slate-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'np' ? ' English' : ' नेपाली'}</span>
            </button>

            {/* Settings Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((s) => !s)}
                aria-expanded={menuOpen}
                className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800 transition"
                title="Account & settings"
              >
                <Settings className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-navy-900 border border-navy-800 rounded-lg shadow-xl text-sm z-50">
                  <div className="p-2">
                    <button onClick={toggleTheme} className="w-full flex items-center gap-2 px-3 py-2 useful-btn">
                      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
                    </button>

                    <hr className="my-1 border-navy-800" />

                    <Link href="/profile/edit" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-navy-800">
                      <User className="w-4 h-4 text-slate-300" />
                      <span>Edit profile</span>
                    </Link>

                    <Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-navy-800">
                      <List className="w-4 h-4 text-slate-300" />
                      <span>Account centre</span>
                    </Link>

                    <Link href="/help" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 help-btn">
                      <HelpCircle className="w-4 h-4 text-white" />
                      <span>Help & policy</span>
                    </Link>

                    <Link href="/activity" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-navy-800">
                      <List className="w-4 h-4 text-slate-300" />
                      <span>Activity log</span>
                    </Link>

                    <hr className="my-1 border-navy-800" />

                    <button onClick={handleAuthToggle} className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-navy-800">
                      {isAuthenticated ? <LogOut className="w-4 h-4 text-slate-300" /> : <LogIn className="w-4 h-4 text-slate-300" />}
                      <span>{isAuthenticated ? 'Logout' : 'Login'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <SOSModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </>
  );
}