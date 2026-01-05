'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Settings, Activity, Loader2, BookOpen } from 'lucide-react';
import Sidebar, { NavItem } from '@/components/dashboard/Sidebar';
import FilterBar from '@/components/dashboard/FilterBar';
import DataEntryForm from '@/components/dashboard/DataEntryForm';
import KPICards from '@/components/dashboard/KPICards';
import Charts from '@/components/dashboard/Charts';
import ActivityTable from '@/components/dashboard/ActivityTable';
import ApiKeyManager from '@/components/dashboard/ApiKeyManager';

// --- 設定 ---
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || '';

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'activities', label: 'History', icon: Activity },
  { id: 'settings', label: 'API Keys', icon: Settings },
  { id: 'docs', label: 'API Docs', icon: BookOpen },
];

export default function CarbonDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // データステート
  const [summary, setSummary] = useState<any>(null);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  
  // マスタデータ管理
  const [allFactors, setAllFactors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // ページネーション & ソート
  const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 1 });
  const [sortConfig, setSortConfig] = useState<{ key: string, order: 'asc' | 'desc' }>({
    key: 'created_at',
    order: 'desc'
  });

  // フィルター
  const [filterScope, setFilterScope] = useState(''); 
  const [filterStart, setFilterStart] = useState(''); 
  const [filterEnd, setFilterEnd] = useState('');

  // 入力フォーム用ステート
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedFactorId, setSelectedFactorId] = useState('');
  const [activityValue, setActivityValue] = useState('');
  const [targetMonth, setTargetMonth] = useState('2025-12');
  const [isCalculating, setIsCalculating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // APIキー管理
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- データ取得 ---
  const loadData = async () => {
    setLoading(true);
    // APIキーがない場合でもリクエストを送るように修正（バックエンド側でセッション認証するため）
    const headers: HeadersInit = API_KEY ? { 'x-api-key': API_KEY } : {};
    
    const params = new URLSearchParams();
    
    if (filterScope) params.append('scope', filterScope);
    if (filterStart) params.append('start_date', filterStart);
    if (filterEnd) params.append('end_date', filterEnd);
    
    params.append('page', (pagination?.page ?? 1).toString());
    params.append('sort_by', sortConfig.key);
    params.append('sort_order', sortConfig.order);

    try {
      if (currentPage === 'dashboard' || currentPage === 'activities') {
        const [resAnalytics, resFactors] = await Promise.all([
          fetch(`/api/analytics?${params.toString()}`, { headers, cache: 'no-store' }),
          fetch('/api/factors', { headers })
        ]);

        if (resAnalytics.ok) {
            const analyticsData = await resAnalytics.json();
            setSummary(analyticsData.summary);
            setMonthly(analyticsData.monthly);
            setActivities(analyticsData.history || []);
            setPagination(analyticsData.pagination);
        } else {
            console.error("Analytics API Error:", resAnalytics.status);
        }
        
        try {
          if (!resFactors.ok) {
            console.error("Factors API returned error status:", resFactors.status);
            setAllFactors([]);
            setCategories([]);
          } else {
            const factorsData = await resFactors.json();
            
            if (factorsData && typeof factorsData === 'object' && 'factors' in factorsData && 'categories' in factorsData) {
              const factorsArray = Array.isArray(factorsData.factors) ? factorsData.factors : [];
              const categoriesArray = Array.isArray(factorsData.categories) ? factorsData.categories : [];
              setAllFactors(factorsArray);
              setCategories(categoriesArray);
            } else if (Array.isArray(factorsData)) {
              setAllFactors(factorsData);
              const uniqueCategories = new Map();
              factorsData.forEach((f: any) => {
                const cat = f.emission_categories;
                if (cat && cat.id && !uniqueCategories.has(cat.id)) {
                  uniqueCategories.set(cat.id, cat);
                }
              });
              const sortedCats = Array.from(uniqueCategories.values()).sort((a: any, b: any) => 
                a.name.localeCompare(b.name)
              );
              setCategories(sortedCats);
            } else {
              setAllFactors([]);
              setCategories([]);
            }
          }
        } catch (factorsError) {
          console.error("Factors API error:", factorsError);
          setAllFactors([]);
          setCategories([]);
        }
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentPage, pagination?.page ?? 1, sortConfig]);

  // --- ロジック: カテゴリ選択時の連動 ---
  const availableFactors = useMemo(() => {
    if (!selectedCategoryId || !Array.isArray(allFactors)) return [];
    return allFactors.filter(f => f.category_id === selectedCategoryId);
  }, [selectedCategoryId, allFactors]);

  const currentCategory = useMemo(() => {
    if (!Array.isArray(categories)) return null;
    return categories.find(c => c.id === selectedCategoryId);
  }, [selectedCategoryId, categories]);

  const currentFactor = useMemo(() => {
    if (!Array.isArray(allFactors)) return null;
    return allFactors.find(f => f.id === selectedFactorId);
  }, [selectedFactorId, allFactors]);

  const handleApplyFilter = () => {
    setPagination(p => ({ ...p, page: 1 }));
    loadData();
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [key, order] = value.split('-');
    setSortConfig({ key, order: order as 'asc' | 'desc' });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (pagination?.total_pages ?? 1)) {
      setPagination(p => ({ ...p, page: newPage }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    setDeletingId(id);
    try {
        // APIキーがなくても削除リクエストを送れるように headers を調整
        const headers: HeadersInit = API_KEY ? { 'x-api-key': API_KEY } : {};
        const res = await fetch(`/api/entries?id=${id}`, { method: 'DELETE', headers });
        if (res.ok) loadData();
        else alert("Deletion failed");
    } catch (e) { alert("Error"); }
    setDeletingId(null);
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    try {
      // APIキーがなくても計算リクエストを送れるように headers を調整
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (API_KEY) headers['x-api-key'] = API_KEY;

      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          factor_id: selectedFactorId,
          activity_value: Number(activityValue),
          start_date: `${targetMonth}-01`,
          end_date: `${targetMonth}-01`,
        }),
      });
      if (res.ok) {
        setActivityValue('');
        loadData();
        alert("Entry Added Successfully");
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to add entry'}`);
      }
    } catch (e) { console.error(e); }
    setIsCalculating(false);
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: ORG_ID, name: newKeyName || 'Production Key' }),
      });
      const data = await res.json();
      setGeneratedKey(data.apiKey);
      setShowKeyModal(true);
      setNewKeyName('');
    } catch (e) { alert("Error"); }
    setIsGenerating(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-slate-900 font-sans antialiased">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} navItems={navItems} />
      <main className="flex-1 p-8 md:p-12 md:ml-64 pt-16 md:pt-8 w-full max-w-[1600px] mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              {navItems.find(n => n.id === currentPage)?.label}
            </h2>
            <p className="text-slate-400 font-medium text-sm mt-1">Carbon Lab Dashboard</p>
          </div>
          {loading && <Loader2 className="animate-spin text-emerald-500 w-6 h-6" />}
        </header>

        {(currentPage === 'dashboard' || currentPage === 'activities') && (
          <FilterBar
            filterScope={filterScope}
            setFilterScope={setFilterScope}
            filterStart={filterStart}
            setFilterStart={setFilterStart}
            filterEnd={filterEnd}
            setFilterEnd={setFilterEnd}
            handleApplyFilter={handleApplyFilter}
          />
        )}

        {currentPage === 'dashboard' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <DataEntryForm
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              selectedFactorId={selectedFactorId}
              setSelectedFactorId={setSelectedFactorId}
              activityValue={activityValue}
              setActivityValue={setActivityValue}
              targetMonth={targetMonth}
              setTargetMonth={setTargetMonth}
              isCalculating={isCalculating}
              categories={categories}
              availableFactors={availableFactors}
              currentCategory={currentCategory}
              currentFactor={currentFactor}
              handleCalculate={handleCalculate}
            />

            <KPICards summary={summary} />

            <Charts monthly={monthly} summary={summary} />
          </div>
        )}

        {currentPage === 'activities' && (
          <ActivityTable
            activities={activities}
            pagination={pagination}
            sortConfig={sortConfig}
            handleSortChange={handleSortChange}
            handlePageChange={handlePageChange}
            handleDelete={handleDelete}
            deletingId={deletingId}
          />
        )}

        {currentPage === 'settings' && (
          <ApiKeyManager
            newKeyName={newKeyName}
            setNewKeyName={setNewKeyName}
            isGenerating={isGenerating}
            handleGenerateKey={handleGenerateKey}
            showKeyModal={showKeyModal}
            setShowKeyModal={setShowKeyModal}
            generatedKey={generatedKey}
            copied={copied}
            setCopied={setCopied}
          />
        )}
      </main>
    </div>
  );
}