'use client';

import React from 'react';
import { Filter, Search } from 'lucide-react';

interface FilterBarProps {
  filterScope: string;
  setFilterScope: (value: string) => void;
  filterStart: string;
  setFilterStart: (value: string) => void;
  filterEnd: string;
  setFilterEnd: (value: string) => void;
  handleApplyFilter: () => void;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">{children}</h3>
);

export default function FilterBar({
  filterScope,
  setFilterScope,
  filterStart,
  setFilterStart,
  filterEnd,
  setFilterEnd,
  handleApplyFilter,
}: FilterBarProps) {
  const handleReset = () => {
    setFilterScope('');
    setFilterStart('');
    setFilterEnd('');
    setTimeout(() => handleApplyFilter(), 0);
  };

  return (
    <div className="mb-10">
      <SectionTitle>Data Filter</SectionTitle>
      <div className="flex flex-wrap items-center gap-4 bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={filterScope} 
            onChange={(e) => setFilterScope(e.target.value)} 
            className="text-xs font-bold bg-slate-50 border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <option value="">All Scopes</option>
            <option value="scope1">Scope 1</option>
            <option value="scope2">Scope 2</option>
          </select>
        </div>
        <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block"></div>
        <div className="flex items-center gap-3 px-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">From</span>
          <input 
            type="date" 
            value={filterStart} 
            onChange={(e) => setFilterStart(e.target.value)} 
            className="text-xs font-bold bg-slate-50 border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900 hover:bg-slate-100 transition-colors" 
          />
          <span className="text-slate-300">→</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">To</span>
          <input 
            type="date" 
            value={filterEnd} 
            onChange={(e) => setFilterEnd(e.target.value)} 
            className="text-xs font-bold bg-slate-50 border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900 hover:bg-slate-100 transition-colors" 
          />
        </div>
        <button 
          onClick={handleApplyFilter} 
          className="ml-auto flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-200 active:scale-95"
        >
          <Search className="w-3 h-3" /> Apply Filter
        </button>
        <button 
          onClick={handleReset} 
          className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest underline underline-offset-4 ml-2"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

