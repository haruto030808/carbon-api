'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Leaf, Loader2, Lock, Mail, ArrowRight, Github, Chrome, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // モード切替用 (trueなら新規登録、falseならログイン)
  const [isSignUp, setIsSignUp] = useState(false);
  
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      // --- 新規登録処理 ---
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Confirmation link sent to your email.');
      }
    } else {
      // --- ログイン処理 ---
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    }
    setLoading(false);
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Carbon Workspace</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            {isSignUp ? 'Create a new account' : 'Sign in to your account'}
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleOAuthLogin('google')}
            className="w-full py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <Chrome className="w-5 h-5 text-red-500" /> 
            <span>{isSignUp ? 'Sign up' : 'Sign in'} with Google</span>
          </button>
          <button
            onClick={() => handleOAuthLogin('github')}
            className="w-full py-4 bg-[#24292F] text-white rounded-2xl font-bold hover:bg-[#24292F]/90 transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <Github className="w-5 h-5" />
            <span>{isSignUp ? 'Sign up' : 'Sign in'} with GitHub</span>
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-300 font-bold tracking-widest">Or continue with email</span></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900 text-sm"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900 transition-all font-bold text-slate-900 text-sm"
                placeholder="Password"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold text-center">{error}</div>}
          {message && <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 text-sm font-bold text-center">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              isSignUp ? <>Create Account <UserPlus className="w-5 h-5" /></> : <>Sign In <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          {/* モード切替ボタン */}
          <p className="text-xs font-bold text-slate-400">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }} 
              className="text-slate-900 cursor-pointer hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>

          {/* パスワードリセット (ログイン時のみ表示) */}
          {!isSignUp && (
            <p className="text-xs font-bold text-slate-400">
              Forgot password?{' '}
              <Link href="/auth/forgot-password" className="text-slate-900 cursor-pointer hover:underline">
                Reset here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}