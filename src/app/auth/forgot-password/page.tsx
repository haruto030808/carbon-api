'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Leaf, Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // リセットメールを送信
    // リンクをクリックすると /auth/update-password にリダイレクトされる
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/auth/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">We'll send you a recovery link.</p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="bg-emerald-50 text-emerald-600 p-6 rounded-3xl flex flex-col items-center gap-3">
              <CheckCircle2 className="w-10 h-10" />
              <p className="font-bold text-sm">Email sent successfully!</p>
            </div>
            <p className="text-sm text-slate-500">Check your inbox and click the link to reset your password.</p>
            <Link href="/login" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all text-center">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {error && <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold text-center">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
            </button>
            
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}