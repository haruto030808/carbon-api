'use client';

import React from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Trash2, Loader2 } from 'lucide-react';

interface Activity {
  id: string;
  created_at: string;
  start_date: string;
  emission_factors?: {
    name: string;
  };
  co2_emissions: number;
}

interface Pagination {
  page: number;
  total: number;
  total_pages: number;
}

interface SortConfig {
  key: string;
  order: 'asc' | 'desc';
}

interface ActivityTableProps {
  activities: Activity[];
  pagination: Pagination;
  sortConfig: SortConfig;
  handleSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handlePageChange: (newPage: number) => void;
  handleDelete: (id: string) => void;
  deletingId: string | null;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">{children}</h3>
);

export default function ActivityTable({
  activities,
  pagination,
  sortConfig,
  handleSortChange,
  handlePageChange,
  handleDelete,
  deletingId,
}: ActivityTableProps) {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <SectionTitle>Activity Log</SectionTitle>
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select 
            onChange={handleSortChange}
            value={`${sortConfig.key}-${sortConfig.order}`}
            className="text-xs font-bold bg-slate-50 border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
          >
            <option value="created_at-desc">Entry Date: Newest</option>
            <option value="created_at-asc">Entry Date: Oldest</option>
            <option value="start_date-desc">Target Month: Newest</option>
            <option value="start_date-asc">Target Month: Oldest</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[20%]">Entry Date</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[20%]">Target Month</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[30%]">Source</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-[20%]">CO2</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-[10%]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {activities && activities.length > 0 ? (
              activities.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6 text-xs font-bold text-slate-400">
                    {item.created_at ? item.created_at.substring(0, 10) : '-'}
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-slate-900">
                    {item.start_date ? item.start_date.substring(0, 7) : '-'}
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-700">
                    {item.emission_factors?.name || '-'}
                  </td>
                  <td className="px-8 py-6 text-right font-black text-slate-900">
                    {item.co2_emissions != null ? item.co2_emissions.toFixed(1) : '-'} <span className="text-[10px] text-slate-500 font-bold ml-1">kg</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      disabled={deletingId === item.id} 
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center">
                  <p className="text-sm font-bold text-slate-400">No activities found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="p-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePageChange((pagination?.page ?? 1) - 1)} 
              disabled={(pagination?.page ?? 1) <= 1} 
              className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button 
              onClick={() => handlePageChange((pagination?.page ?? 1) + 1)} 
              disabled={(pagination?.page ?? 1) >= (pagination?.total_pages ?? 1)} 
              className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Page {pagination?.page ?? 1} of {pagination?.total_pages ?? 1}
          </span>
        </div>
      </div>
    </div>
  );
}

