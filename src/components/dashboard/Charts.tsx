'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell 
} from 'recharts';

interface MonthlyData {
  month: string;
  scope1: number;
  scope2: number;
}

interface Summary {
  scope1?: number;
  scope2?: number;
}

interface ChartsProps {
  monthly: MonthlyData[];
  summary: Summary | null;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">{children}</h3>
);

export default function Charts({ monthly, summary }: ChartsProps) {
  const pieData = [
    { name: 'Scope 1', value: summary?.scope1 || 0 },
    { name: 'Scope 2', value: summary?.scope2 || 0 }
  ];

  const COLORS = ['#10B981', '#3B82F6'];

  const LegendItem = ({ color, label }: { color: string; label: string }) => (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
      <span className="text-xs font-bold text-slate-700">{label}</span>
    </div>
  );

  return (
    <section>
      <SectionTitle>Analytics</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm text-slate-900">Monthly Trends</h3>
            <div className="flex items-center gap-4">
              <LegendItem color="#10B981" label="Scope 1" />
              <LegendItem color="#3B82F6" label="Scope 2" />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 11 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 11 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }} 
                  contentStyle={{
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Bar dataKey="scope1" stackId="a" fill="#10B981" barSize={32} name="Scope 1" />
                <Bar dataKey="scope2" stackId="a" fill="#3B82F6" barSize={32} radius={[6, 6, 0, 0]} name="Scope 2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8 w-full">
            <h3 className="font-bold text-sm text-slate-900">Scope Breakdown</h3>
            <div className="flex flex-col gap-2">
              <LegendItem color="#10B981" label="Scope 1" />
              <LegendItem color="#3B82F6" label="Scope 2" />
            </div>
          </div>
          <div className="h-[200px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  innerRadius={60} 
                  outerRadius={80} 
                  dataKey="value" 
                  stroke="none" 
                  paddingAngle={5}
                  startAngle={90}
                  endAngle={-270}
                  label={(props) => {
                    const name = props.name ?? '';
                    const percent = props.percent ?? 0;
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

