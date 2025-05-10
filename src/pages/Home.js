// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [elevated, setElevated] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const curlCmd = `curl -X POST https://qualitycompute.henosis.us/api/generate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "grok-3-mini-B8",
    "input": "Generate a poem about space.",
    "include_candidates": false
  }'`;

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const providers = [
    { name: "OpenAI", logo: "🟢" },
    { name: "Google", logo: "🔵" },
    { name: "xAI", logo: "🟠" },
    { name: "DeepSeek", logo: "🟣" },
    { name: "Anthropic", logo: "🟤" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <style jsx global>{`
        body { font-family: 'Inter', sans-serif; }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glowing-border {
          position: relative;
        }
        .glowing-border::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #6366f1, #8b5cf6, #d946ef, #6366f1);
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
          border-radius: 1rem;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .glowing-border:hover::before {
          opacity: 1;
        }
        .feature-card {
          transition: all 0.3s ease;
        }
        .feature-card.active {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>

      {/* Pill-shaped Header */}
      <header className="sticky top-4 z-50 mx-6">
        <div className={`max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 transition-all ${elevated ? 'shadow-md' : ''}`}>
            <Link to="/" className="flex items-center gap-3 font-semibold text-[17px] tracking-tight">
            <span className="inline-grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-md shadow-indigo-200">QC</span>
            <span className="hidden sm:inline-block">Quality Compute</span>
            </Link>
            <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
                <Link to="/api-reference" className="hidden md:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Docs</Link>
                <Link to="/login" className="hidden md:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
                <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">Get API Key</Link>
            </div>
            </div>
        </div>
        </header>

      {/* Main Content */}
      <main className="flex-1 py-20 px-6 w-full">
        {/* Hero Section */}
        <section className="pt-12 pb-16">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
            {/* Left Column - Content */}
            <div className="space-y-8 flex flex-col justify-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Parallel Compute</span> API
                </h1>
                <p className="mt-4 text-lg text-slate-600">
                  An easy to use API with customizible best of N to get the best performance out of modern frontier models.
                </p>
              </div>
              {/* CTA Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={copyCurl}
                  className="px-6 py-3 rounded-lg bg-white border border-slate-200 font-medium hover:bg-slate-50 transition-colors shadow-sm"
                >
                  {copied ? 'Copied!' : 'Copy cURL'}
                </button>
                <Link
                  to="/api-reference"
                  className="px-6 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Documentation
                </Link>
              </div>
            </div>
            {/* Right Column - Terminal */}
            <div className="flex items-center">
              <div className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-lg bg-white">
                <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                      <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">Terminal</span>
                  </div>
                  <button
                    onClick={copyCurl}
                    className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-6 overflow-auto text-sm font-mono max-h-[400px]">
                  <code className="block whitespace-pre text-slate-700">
                    <span className="text-purple-600">curl</span> -X POST <span className="text-blue-600">https://qualitycompute.henosis.us/api/generate</span> \<br />
                    &nbsp;&nbsp;-H <span className="text-green-600">"Content-Type: application/json"</span> \<br />
                    &nbsp;&nbsp;-H <span className="text-green-600">"Authorization: Bearer YOUR_API_KEY"</span> \<br />
                    &nbsp;&nbsp;-d <span className="text-yellow-600">'</span>{'{'}<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-600">"model"</span>: <span className="text-green-600">"o4-mini-B10"</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-600">"input"</span>: <span className="text-green-600">"Generate a poem about space."</span>,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-600">"include_candidates"</span>: <span className="text-blue-600">false</span><br />
                    &nbsp;&nbsp;{'}'}<span className="text-yellow-600">'</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - Redesigned */}
        <section id="how-it-works" className="py-20 mb-16">
          <div className="max-w-7xl mx-auto px-6">
            {/* Visualization Section */}
            <div className="bg-gradient-to-r from-slate-800 to-indigo-900 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="text-white space-y-6">
                    <h3 className="text-2xl font-bold">See the difference</h3>
                    <p className="text-slate-300">
                      Traditional APIs give you a single output. Quality Compute generates multiple candidates
                      and intelligently selects the best one, dramatically improving output quality.
                    </p>
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm">1</div>
                        <span className="text-slate-200">2-5x improvement in output quality</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm">2</div>
                        <span className="text-slate-200">Simple pricing: just 10%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm">3</div>
                        <span className="text-slate-200">Works with all major AI providers</span>
                      </div>
                    </div>
                    <Link to="/register" className="inline-block mt-4 px-6 py-3 bg-white text-indigo-900 font-medium rounded-lg hover:bg-indigo-100 transition-colors">
                    Get started today
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-lg"></div>
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-white/30"></div>
                          <div className="w-3 h-3 rounded-full bg-white/30"></div>
                          <div className="w-3 h-3 rounded-full bg-white/30"></div>
                        </div>
                        <div className="text-xs text-white/70 px-2 py-1 rounded-full bg-white/10">Quality Compute</div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 rounded bg-white/5 border border-white/10">
                          <p className="text-indigo-200 text-sm">Candidate 1</p>
                          <p className="text-white/70 text-xs mt-1">Good answer but lacks detail...</p>
                        </div>
                        <div className="p-3 rounded bg-indigo-500/30 border border-indigo-300/30 shadow-lg">
                          <div className="flex items-center mb-1">
                            <p className="text-indigo-100 text-sm font-medium">Candidate 2 - Selected</p>
                            <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Best Quality</span>
                          </div>
                          <p className="text-white/90 text-xs">Exceptional response with detailed analysis and clear explanations...</p>
                        </div>
                        <div className="p-3 rounded bg-white/5 border border-white/10">
                          <p className="text-indigo-200 text-sm">Candidate 3</p>
                          <p className="text-white/70 text-xs mt-1">Accurate but too verbose...</p>
                        </div>
                      </div>
                      <div className="mt-4 text-right">
                        <span className="text-xs text-indigo-200">Best candidate automatically selected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing and Providers Section */}
        <section id="pricing" className="max-w-7xl mx-auto py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
            {/* Pricing Card */}
            <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 -mt-16 -mr-16 bg-gradient-to-bl from-indigo-100 to-transparent rounded-full opacity-70"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Simple Pricing</h3>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline mb-6">
                    <span className="text-5xl font-bold">10%</span>
                    <span className="text-xl text-slate-600 ml-2">of model costs</span>
                  </div>
                  <p className="text-slate-600 mb-6">
                    We only charge a small fee on credit purchase. No commitments or hidden costs.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="text-sm text-slate-600 mb-2">Example cost breakdown:</div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>GPT-4.1 spend:</span>
                      <span className="font-medium">$6.00</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Quality Compute fee:</span>
                      <span className="font-medium">$0.60</span>
                    </div>
                    <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-medium">
                      <span>Total:</span>
                      <span>$6.60</span>
                    </div>
                  </div>
                </div>
                <Link to="/register" className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-md">
                  Get Your API Key
                </Link>
              </div>
            </div>

            {/* Providers Card */}
            <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 -mt-16 -mr-16 bg-gradient-to-bl from-purple-100 to-transparent rounded-full opacity-70"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Supported Models</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  Access the best models from leading providers through a single, consistent API.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                {providers.map((provider, index) => (
                    <div
                    key={provider.name}
                    className={`flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200 border border-slate-200 ${
                        providers.length % 2 !== 0 && index === providers.length - 1
                        ? 'col-span-2 justify-self-center max-w-md'
                        : ''
                    }`}
                    >
                    <span className="text-xl">{provider.logo}</span>
                    <div>
                        <span className="font-medium block">{provider.name}</span>
                        <span className="text-xs text-slate-500">All models supported</span>
                    </div>
                    </div>
                ))}
                </div>
                <Link to="/api-reference" className="inline-flex items-center justify-center w-full px-6 py-3 bg-white border border-indigo-600 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors">
                  View All Supported Models
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Subtle Footer */}
      <footer className="py-6 text-center text-sm text-slate-500 border-t border-slate-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>© {new Date().getFullYear()} Quality Compute</div>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}