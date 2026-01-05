'use client';

import React, { useState, useEffect } from 'react';
import { Leaf, LogOut, LayoutDashboard, Settings, Activity, Menu, X } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  navItems: NavItem[];
}

export default function Sidebar({ currentPage, setCurrentPage, navItems }: SidebarProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
  );
  
  useEffect(() => { 
    supabase.auth.getUser().then(({ data }) => setUser(data.user)); 
  }, []);

  const handleNavClick = (item: NavItem) => {
    if (item.id === 'docs') {
      router.push('/docs');
    } else {
      setCurrentPage(item.id);
    }
    setMobileMenuOpen(false);
  };

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="font-black text-lg tracking-tight text-slate-900 uppercase">CARBON</span>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => handleNavClick(item)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentPage === item.id 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-bold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="pt-6 border-t border-slate-50">
        {user && (
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs uppercase">
              {user.email?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user.email?.split('@')[0]}</p>
              <p className="text-[10px] text-slate-400 font-medium">Standard Plan</p>
            </div>
          </div>
        )}
        <button 
          onClick={async () => { 
            await supabase.auth.signOut(); 
            router.push('/login'); 
          }} 
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-500 transition-colors group"
        >
          <LogOut className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
          <span className="font-bold text-xs tracking-widest uppercase">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-slate-200"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6 text-slate-900" />
        ) : (
          <Menu className="w-6 h-6 text-slate-900" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="w-64 bg-white border-r border-slate-100 min-h-screen p-6 flex flex-col fixed left-0 top-0 h-full z-10 hidden md:flex">
        <NavContent />
      </div>

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 p-6 flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <NavContent />
      </div>
    </>
  );
}

