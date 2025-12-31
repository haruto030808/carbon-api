'use client';

import React from 'react';
import { Leaf, ArrowLeft, Key, Terminal, Code2, PlayCircle, Globe, Calendar, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  
  // コードブロックの中身を定数として定義（これでReactのパースエラーを防ぎます）
  const factorsResponse = `[
  {
    "id": "c532-44a1-...",
    "name": "関西電力",
    "unit": "kWh",
    "co2_factor": 0.297,
    "emission_categories": {
       "name": "電気 (Electricity)",
       "scope_type": "scope2"
    }
  },
  ...
]`;

  const curlExample = `curl -X POST https://your-domain.com/api/calculate \\
  -H "x-api-key: sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "factor_id": "c532-xxxx-xxxx",
    "activity_value": 1500,
    "start_date": "2025-12-01"
  }'`;

  const pythonExample = `import requests

url = "https://your-domain.com/api/calculate"

headers = {
    "Content-Type": "application/json",
    "x-api-key": "sk_live_..."
}

payload = {
    "factor_id": "c532-...", 
    "activity_value": 1500,
    "start_date": "2025-12-01"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

  const jsExample = `const url = "https://your-domain.com/api/calculate";

const sendData = async () => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "sk_live_..."
    },
    body: JSON.stringify({
      factor_id: "c532-...",
      activity_value: 1500,
      start_date: "2025-12-01"
    })
  });

  const data = await response.json();
  console.log(data);
};

sendData();`;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-emerald-100">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">Carbon API Docs</span>
          </div>
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full">
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Side Menu */}
          <aside className="hidden lg:block lg:col-span-1 space-y-8 sticky top-28 h-fit">
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Getting Started</h4>
              <ul className="space-y-2 text-sm font-medium text-slate-600">
                <li><a href="#base-url" className="hover:text-emerald-600 transition-colors">Base URL</a></li>
                <li><a href="#auth" className="hover:text-emerald-600 transition-colors">Authentication</a></li>
                <li><a href="#formats" className="hover:text-emerald-600 transition-colors">Data Formats</a></li>
                <li><a href="#code-examples" className="hover:text-emerald-600 transition-colors flex items-center gap-2"><Code2 className="w-3 h-3" /> Code Examples</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Endpoints</h4>
              <ul className="space-y-2 text-sm font-medium text-slate-600">
                <li><a href="#get-factors" className="hover:text-emerald-600 transition-colors">GET /factors</a></li>
                <li><a href="#post-calculate" className="hover:text-emerald-600 transition-colors">POST /calculate</a></li>
                <li><a href="#get-analytics" className="hover:text-emerald-600 transition-colors">GET /analytics</a></li>
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <article className="lg:col-span-3 space-y-16">
            
            <section>
              <h1 className="text-4xl font-black mb-6 text-slate-900">Developer Documentation</h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Carbon APIは、企業の活動データ（電気・燃料など）を送信するだけで、
                複雑なGHG（温室効果ガス）排出量を自動計算し、クラウドデータベースに蓄積・分析できるRESTful APIです。
              </p>
            </section>

            {/* Base URL */}
            <section id="base-url" className="scroll-mt-28">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-500" /> Base URL
              </h2>
              <p className="text-slate-600 mb-4 text-sm">
                すべてのエンドポイントは、以下のURLを基準とします。
              </p>
              <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl font-mono text-sm text-slate-700">
                https://your-app-domain.com/api
              </div>
            </section>

            {/* Authentication */}
            <section id="auth" className="scroll-mt-28">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Key className="w-6 h-6 text-emerald-500" /> Authentication & Headers
              </h2>
              <p className="text-slate-600 mb-6 text-sm">
                APIを利用するには、以下のHTTPヘッダーをリクエストに含める必要があります。
              </p>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-700">Header Key</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Value / Description</th>
                      <th className="px-4 py-3 font-bold text-slate-700">Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr>
                      <td className="px-4 py-3 font-mono text-emerald-600 font-bold">x-api-key</td>
                      <td className="px-4 py-3 text-slate-600">
                        ダッシュボードで発行したAPIキー。<br/>
                        <span className="text-xs text-slate-400">例: sk_live_abc123...</span>
                      </td>
                      <td className="px-4 py-3 text-red-500 font-bold text-xs">YES</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-slate-700">Content-Type</td>
                      <td className="px-4 py-3 text-slate-600">
                        <code>application/json</code> 指定。<br/>
                        <span className="text-xs text-slate-400">POSTリクエスト送信時に必須。</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs font-bold">POST時のみ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Data Formats */}
            <section id="formats" className="scroll-mt-28">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-orange-500" /> Data Formats
              </h2>
              <p className="text-slate-600 mb-4 text-sm">
                送信するデータは以下のフォーマットに従ってください。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-2">Date (日付)</h3>
                  <p className="text-xs text-slate-500 mb-2">ISO 8601形式 (ハイフン区切り)</p>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <code className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">2025-12-31</code>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <X className="w-4 h-4 text-red-500" />
                    <code className="text-xs text-slate-400 line-through">2025/12/31</code>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-2">ID (識別子)</h3>
                  <p className="text-xs text-slate-500 mb-2">UUID形式の文字列</p>
                  <code className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded block truncate">
                    "c532-44a1-889b-..."
                  </code>
                </div>
              </div>
            </section>

            {/* Code Examples */}
            <section id="code-examples" className="scroll-mt-28">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-blue-500" /> Code Examples
              </h2>
              <div className="space-y-8">
                {/* Python */}
                <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl shadow-slate-200">
                  <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Python</span>
                    </div>
                  </div>
                  <pre className="p-6 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                    {pythonExample}
                  </pre>
                </div>
                {/* JS */}
                <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl shadow-slate-200">
                  <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">JavaScript</span>
                    </div>
                  </div>
                  <pre className="p-6 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                    {jsExample}
                  </pre>
                </div>
              </div>
            </section>

            <hr className="border-slate-200" />

            {/* Endpoints */}
            <section className="space-y-16">
              
              {/* GET /factors */}
              <div id="get-factors" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-black uppercase tracking-wider">GET</span>
                  <code className="text-2xl font-bold text-slate-900">/factors</code>
                </div>
                <p className="text-slate-600 mb-6">
                  計算に使用可能な「電力会社」や「燃料」のマスタリストを取得します。
                  <strong className="text-slate-900 bg-yellow-100 px-1">計算を行う前に、必ずこのAPIで `id` を特定してください。</strong>
                </p>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">Response Example</div>
                  <pre className="p-4 text-xs font-mono text-slate-700 overflow-x-auto">{factorsResponse}</pre>
                </div>
              </div>

              {/* POST /calculate */}
              <div id="post-calculate" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black uppercase tracking-wider">POST</span>
                  <code className="text-2xl font-bold text-slate-900">/calculate</code>
                </div>
                <p className="text-slate-600 mb-6">
                  特定のソース（電力会社など）と使用量を送信し、CO2排出量を計算して保存します。
                </p>
                
                {/* Parameters Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-bold text-slate-700">Key</th>
                        <th className="px-4 py-3 font-bold text-slate-700">Type</th>
                        <th className="px-4 py-3 font-bold text-slate-700">Required</th>
                        <th className="px-4 py-3 font-bold text-slate-700">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      <tr>
                        <td className="px-4 py-3 font-mono text-slate-700">factor_id</td>
                        <td className="px-4 py-3 text-slate-500">string</td>
                        <td className="px-4 py-3 text-red-500 font-bold text-xs">YES</td>
                        <td className="px-4 py-3"><code>/factors</code> で取得したID</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-slate-700">activity_value</td>
                        <td className="px-4 py-3 text-slate-500">number</td>
                        <td className="px-4 py-3 text-red-500 font-bold text-xs">YES</td>
                        <td className="px-4 py-3">使用量（kWh, Lなど）</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-slate-700">start_date</td>
                        <td className="px-4 py-3 text-slate-500">string</td>
                        <td className="px-4 py-3 text-red-500 font-bold text-xs">YES</td>
                        <td className="px-4 py-3">YYYY-MM-DD</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl shadow-slate-200">
                  <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Curl Example</span>
                  </div>
                  <pre className="p-6 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">{curlExample}</pre>
                </div>
              </div>

              {/* GET /analytics */}
              <div id="get-analytics" className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-black uppercase tracking-wider">GET</span>
                  <code className="text-2xl font-bold text-slate-900">/analytics</code>
                </div>
                <p className="text-slate-600 mb-6">登録済みデータの集計結果と履歴リストを取得します。</p>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-bold text-slate-700">Param</th>
                        <th className="px-4 py-3 font-bold text-slate-700">Description</th>
                        <th className="px-4 py-3 font-bold text-slate-700">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-4 py-3 font-mono text-slate-700">scope</td>
                        <td className="px-4 py-3 text-slate-600">データの絞り込み</td>
                        <td className="px-4 py-3 font-mono text-slate-500">?scope=scope1</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-slate-700">start_date</td>
                        <td className="px-4 py-3 text-slate-600">期間開始日 (YYYY-MM-DD)</td>
                        <td className="px-4 py-3 font-mono text-slate-500">?start_date=2025-01-01</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </section>

            <footer className="pt-20 pb-8 border-t border-slate-200 text-center text-slate-400 text-sm">
              <p>&copy; 2025 Kyoto Lab Carbon Project. All rights reserved.</p>
            </footer>

          </article>
        </div>
      </main>
    </div>
  );
}