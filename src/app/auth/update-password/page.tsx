'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Leaf, Loader2, Lock, CheckCircle2 } from 'lucide-react';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
  );

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // ログイン済みユーザーのパスワードを更新
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // 更新完了したらダッシュボードへ
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-xl shadow-slate-200 border border-slate-100 p-10 animate-in fade-in zoom-in duration-500">
        
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-300">
            <Leaf className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Set New Password</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Enter your new secure password.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}