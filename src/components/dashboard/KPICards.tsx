'use client';

import React from 'react';

interface Summary {
  total?: number;
  scope1?: number;
  scope2?: number;
}

interface KPICardsProps {
  summary: Summary | null;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">{children}</h3>
);

export default function KPICards({ summary }: KPICardsProps) {
  const kpis = [
    { label: 'Total CO2', value: summary?.total, color: 'text-slate-900' },
    { label: 'Scope 1', value: summary?.scope1, color: 'text-emerald-600' },
    { label: 'Scope 2', value: summary?.scope2, color: 'text-blue-600' }
  ];

  return (
    <section>
      <SectionTitle>Key Metrics</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <div 
            key={i} 
            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm h-40 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black tracking-tighter ${kpi.color}`}>
                {kpi.value?.toLocaleString() || '0.0'}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">kg-CO2</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

