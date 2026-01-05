'use client';

import React from 'react';
import { Loader2, Plus, Zap, Droplet, Flame } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  scope_type: string;
}

interface Factor {
  id: string;
  name: string;
  unit: string;
  category_id: string;
}

interface DataEntryFormProps {
  selectedCategoryId: string;
  setSelectedCategoryId: (value: string) => void;
  selectedFactorId: string;
  setSelectedFactorId: (value: string) => void;
  activityValue: string;
  setActivityValue: (value: string) => void;
  targetMonth: string;
  setTargetMonth: (value: string) => void;
  isCalculating: boolean;
  categories: Category[];
  availableFactors: Factor[];
  currentCategory: Category | null;
  currentFactor: Factor | null;
  handleCalculate: (e: React.FormEvent) => void;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">{children}</h3>
);

const CategoryIcon = ({ name }: { name: string }) => {
  if (!name) return null;
  if (name.includes('電気')) return <Zap className="w-4 h-4 text-yellow-500" />;
  if (name.includes('燃料')) return <Droplet className="w-4 h-4 text-orange-500" />;
  return <Flame className="w-4 h-4 text-red-500" />;
};

export default function DataEntryForm({
  selectedCategoryId,
  setSelectedCategoryId,
  selectedFactorId,
  setSelectedFactorId,
  activityValue,
  setActivityValue,
  targetMonth,
  setTargetMonth,
  isCalculating,
  categories,
  availableFactors,
  currentCategory,
  currentFactor,
  handleCalculate,
}: DataEntryFormProps) {
  return (
    <section>
      <SectionTitle>Data Entry</SectionTitle>
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase tracking-widest ml-1">Month</label>
            <input 
              type="month" 
              value={targetMonth} 
              onChange={(e) => setTargetMonth(e.target.value)} 
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none font-bold text-sm hover:bg-slate-50 transition-colors" 
            />
          </div>

          <div className="md:col-span-3">
            <div className="flex justify-between mb-2 ml-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Category</label>
              {currentCategory && (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${
                  currentCategory.scope_type === 'scope1' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {currentCategory.scope_type === 'scope1' ? 'Scope 1' : 'Scope 2'}
                </span>
              )}
            </div>
            <div className="relative">
              <select 
                value={selectedCategoryId} 
                onChange={(e) => { 
                  setSelectedCategoryId(e.target.value); 
                  setSelectedFactorId(''); 
                }} 
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none font-bold text-sm cursor-pointer hover:bg-slate-100 transition-colors appearance-none"
              >
                <option value="">Select Category...</option>
                {Array.isArray(categories) && categories.length > 0 ? (
                  categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                ) : (
                  <option value="" disabled>No categories available</option>
                )}
              </select>
              {currentCategory && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <CategoryIcon name={currentCategory.name} />
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase tracking-widest ml-1">Contract / Type</label>
            <select 
              value={selectedFactorId} 
              onChange={(e) => setSelectedFactorId(e.target.value)} 
              disabled={!selectedCategoryId}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none font-bold text-sm cursor-pointer hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Detail...</option>
              {availableFactors.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase tracking-widest ml-1">Usage</label>
            <div className="relative">
              <input 
                type="number" 
                value={activityValue} 
                onChange={(e) => setActivityValue(e.target.value)} 
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none font-bold text-sm hover:bg-slate-50 transition-colors" 
                placeholder="0.00" 
              />
              {currentFactor && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">
                  {currentFactor.unit}
                </span>
              )}
            </div>
          </div>

          <div className="md:col-span-12 lg:col-span-2 lg:col-start-11"></div>
          <div className="md:col-span-12 mt-4">
            <button 
              type="submit" 
              disabled={isCalculating || !selectedFactorId || !activityValue} 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-slate-200 disabled:opacity-50 disabled:shadow-none"
            >
              {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} 
              Add Entry
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

