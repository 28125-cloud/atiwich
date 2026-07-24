'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Package, BarChart3, Database, Flame, Clock, CheckCircle2, HardDrive } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) +
          ' | ' +
          now.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { href: '/', label: 'หน้าขาย POS', icon: ShoppingCart },
    { href: '/inventory', label: 'จัดการสต็อก', icon: Package },
    { href: '/history', label: 'ประวัติการขาย', icon: BarChart3 },
    { href: '/setup', label: 'ตั้งค่า DB', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 flex items-center justify-center shadow-lg shadow-red-900/40 group-hover:scale-105 transition-transform duration-200">
            <Flame className="w-6 h-6 text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-500 to-amber-200">
                NIGHTNING
              </span>
              <span className="text-xs bg-red-950 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-800/50 uppercase tracking-widest">
                Meat POS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Premium Butchery System</p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-red-950/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Info: Live Time & Database Mode */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{currentTime || '00:00:00'}</span>
          </div>

          {/* Connection Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isSupabaseConfigured
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
            }`}
          >
            {isSupabaseConfigured ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase DB</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span>Local Mode</span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-900 border-t border-slate-800 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
