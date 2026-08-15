 'use client';

import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';

export function NavLinks() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/map', label: 'Live Map', icon: 'map' },
    { href: '/report', label: 'Report', icon: 'alert', highlight: true },
    { href: '/relief', label: 'Relief & Volunteers', icon: 'relief' },
    { href: '/leadership', label: 'Leadership', icon: 'trophy' },
    { href: '/profile', label: 'Profile', icon: 'user' },
  ];

  return (
    <div className="flex items-center space-x-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const activeClass = item.highlight
          ? 'text-red-500 font-extrabold scale-105'
          : isActive
            ? 'bg-amber-400/10 text-amber-300 font-bold scale-105 shadow-lg ring-2 ring-amber-400/20'
            : 'text-slate-300 hover:text-slate-200';

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-transform duration-150 ${activeClass}`}
          >
            {item.icon === 'home' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mb-0.5"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
            )}
            {item.icon === 'map' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mb-0.5"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"></path><path d="M15 5.764v15"></path><path d="M9 3.236v15"></path></svg>
            )}
            {item.icon === 'alert' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 mb-0.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
            )}
            {item.icon === 'relief' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mb-0.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"></path><path d="m18 15-2-2"></path><path d="m15 18-2-2"></path></svg>
            )}
            {item.icon === 'trophy' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mb-0.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
            )}
            {item.icon === 'user' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mb-0.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            )}
            <span className="text-[11px] mt-0.5 tracking-tight font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function TopNavbar() {
  const pathname = usePathname();
  const isActive = pathname === '/admin';

  return (
    <div className="hidden md:block bg-navy-900 border-b border-navy-800 py-2">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs">
        <NavLinks />

        <Link
          href="/admin"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-transform duration-150 border bg-navy-800 ${isActive ? 'bg-amber-400 text-navy-900 shadow-md scale-105 ring-2 ring-amber-300' : 'text-slate-300 hover:text-white'} border-slate-700`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check w-4 h-4 text-amber-400"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
          <span>Admin Panel</span>
        </Link>
      </div>
    </div>
  );
}