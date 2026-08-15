'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, AlertCircle, HeartHandshake, Trophy, User, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export default function Navigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/', label: t.navHome, icon: Home },
    { href: '/map', label: t.navMap, icon: Map },
    { href: '/report', label: t.navReport, icon: AlertCircle, highlight: true },
    { href: '/relief', label: t.navRelief, icon: HeartHandshake },
    { href: '/leadership', label: t.navLeadership, icon: Trophy },
    { href: '/profile', label: t.navProfile, icon: User },
  ];

  return (
    <>
      {/* Mobile Bottom App Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-900/95 backdrop-blur-md border-t border-navy-800 px-1 py-1 shadow-2xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const activeClass = item.highlight
              ? 'text-red-500 font-extrabold scale-105'
              : isActive
                ? 'bg-amber-400/10 text-amber-300 font-bold scale-105 shadow-lg ring-2 ring-amber-400/20'
                : 'text-slate-400 hover:text-slate-200';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-transform duration-150 ${activeClass}`}
              >
                <Icon className={`flex-shrink-0 ${item.highlight ? 'w-6 h-6 animate-pulse' : isActive ? 'w-6 h-6' : 'w-5 h-5'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop navigation is provided in the header; avoid duplicate desktop strip here */}
    </>
  );
}