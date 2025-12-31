'use client';

import React from 'react';
import { Loader2, AlertTriangle, X, Check, Copy } from 'lucide-react';

interface ApiKeyManagerProps {
  newKeyName: string;
  setNewKeyName: (value: string) => void;
  isGenerating: boolean;
  handleGenerateKey: (e: React.FormEvent) => void;
  showKeyModal: boolean;
  setShowKeyModal: (value: boolean) => void;
  generatedKey: string | null;
  copied: boolean;
  setCopied: (value: boolean) => void;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">{children}</h3>
);

export default function ApiKeyManager({
  newKeyName,
  setNewKeyName,
  isGenerating,
  handleGenerateKey,
  showKeyModal,
  setShowKeyModal,
  generatedKey,
  copied,
  setCopied,
}: ApiKeyManagerProps) {
  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
    }
  };

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <SectionTitle>Developer Controls</SectionTitle>
        <div className="bg-white rounded-[32px] border border-slate-100 p-10 shadow-sm max-w-2xl">
          <h3 className="text-xl font-bold mb-2">Generate New API Key</h3>
          <p className="text-slate-500 text-sm mb-8 font-medium">
            Create a key to access the Carbon Engine from your own applications.
          </p>
          <form onSubmit={handleGenerateKey} className="space-y-4">
            <input 
              type="text" 
              placeholder="Key Name" 
              value={newKeyName} 
              onChange={(e) => setNewKeyName(e.target.value)} 
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900" 
              required 
            />
            <button 
              type="submit" 
              disabled={isGenerating} 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
            >
              {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : "Generate API Key"}
            </button>
          </form>
        </div>
      </div>
      
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full animate-in zoom-in duration-200 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="p-3 bg-amber-50 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <button 
                onClick={() => setShowKeyModal(false)} 
                className="text-slate-300 hover:text-slate-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <h3 className="text-xl font-black">API Key Generated</h3>
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
              <code className="text-[10px] font-mono break-all text-slate-900">{generatedKey}</code>
              <button 
                onClick={handleCopy} 
                className="ml-2 p-2 hover:bg-white rounded-lg transition-all"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
            <button 
              onClick={() => setShowKeyModal(false)} 
              className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-bold"
            >
              I have saved it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

