// src/pages/ApiReference.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

export default function ApiReference() {
  const [elevated, setElevated] = useState(false);
  const [activeTab, setActiveTab] = useState('introduction');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const curlCmd = `curl -X POST https://qualitycompute.henosis.us/api/generate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "o4-mini-B10",
    "input": "Generate a poem about space.",
    "include_candidates": false,
    "judge_model": "o4-mini",
    "max_tokens": 500,
  }'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const apiEndpoints = [
    {
      id: 'generate',
      name: 'Generate',
      description: 'Generate text with best-of-N inference',
      method: 'POST',
      endpoint: '/api/generate'
    }
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
        .tab-active {
          border-color: #6366f1;
          box-shadow: 0 1px 0 0 #6366f1;
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
            <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-600">
              <Link to="/api-reference" className="text-indigo-600 hover:text-indigo-800 transition-colors">API Reference</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
              <Link to="/register" className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text inline-block">API Reference</h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Comprehensive documentation for the Quality Compute API with best-of-N inference capabilities.
            </p>
          </div>

          {/* Main API Documentation */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-28">
                <h3 className="text-lg font-semibold mb-4">Contents</h3>
                <nav className="space-y-1">
                  <a
                    href="#introduction"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('introduction');
                      scrollToSection('introduction');
                    }}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'introduction' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    Introduction
                  </a>
                  <a
                    href="#authentication"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('authentication');
                      scrollToSection('authentication');
                    }}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'authentication' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    Authentication
                  </a>
                  <a
                    href="#endpoints"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('endpoints');
                      scrollToSection('endpoints');
                    }}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'endpoints' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    Endpoints
                  </a>
                  <div className="pl-4 mt-2 space-y-1">
                    {apiEndpoints.map(endpoint => (
                      <a
                        key={endpoint.id}
                        href={`#${endpoint.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveTab(endpoint.id);
                          scrollToSection(endpoint.id);
                        }}
                        className={`block px-3 py-2 rounded-lg text-sm ${activeTab === endpoint.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        {endpoint.name}
                      </a>
                    ))}
                  </div>
                  <a
                    href="#models"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('models');
                      scrollToSection('models');
                    }}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'models' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    Supported Models
                  </a>
                  <a
                    href="#error-handling"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('error-handling');
                      scrollToSection('error-handling');
                    }}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'error-handling' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    Error Handling
                  </a>
                </nav>
              </div>
            </div>

            {/* Main Documentation Content */}
            <div className="lg:col-span-3 space-y-12">
              {/* Introduction Section */}
              <section id="introduction" className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Introduction</h2>
                  <p className="text-slate-600 mb-6">
                    The Quality Compute API provides a simple way to get high-quality outputs from large language models using best-of-N inference.
                    Our API generates multiple responses and selects the best one automatically, dramatically improving quality.
                  </p>
                  <h3 className="text-lg font-semibold mb-3">Base URL</h3>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 font-mono text-sm mb-6">
                    https://qualitycompute.henosis.us
                  </div>
                  <h3 className="text-lg font-semibold mb-3">Quick Example</h3>
                  <div className="bg-slate-800 rounded-lg overflow-hidden mb-4">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-red-400"></span>
                          <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                          <span className="w-3 h-3 rounded-full bg-green-400"></span>
                        </div>
                        <span className="text-sm font-medium text-slate-200">cURL Example</span>
                      </div>
                      <button
                        onClick={copyCurl}
                        className="text-xs bg-slate-600 px-3 py-1 rounded-md hover:bg-slate-500 transition-colors text-white"
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-4 overflow-auto text-sm font-mono text-slate-300">
                      <code className="block whitespace-pre">
                        {curlCmd}
                      </code>
                    </pre>
                  </div>
                  <p className="text-slate-600">
                    This example uses best-of-10 inference with the "o4-mini" model. The API will generate 10 responses, select the best one, and return it.
                  </p>
                </div>
              </section>

              {/* Authentication Section */}
              <section id="authentication" className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Authentication</h2>
                  <p className="text-slate-600 mb-6">
                    All API requests require authentication using an API key, included in the Authorization header as a Bearer token.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 font-mono text-sm mb-6">
                    Authorization: Bearer YOUR_API_KEY
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">
                        Keep your API key secure and don't share it publicly. You can generate your API key through the user dashboard after registration and verification.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Endpoints Section */}
              <section id="endpoints" className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Endpoints</h2>
                  <p className="text-slate-600 mb-6">
                    The Quality Compute API provides endpoints for text generation. This documentation focuses on the available endpoint.
                  </p>

                  {/* Generate Endpoint */}
                  <div id="generate" className="border border-slate-200 rounded-lg mb-8">
                    <div className="flex items-center p-4 border-b border-slate-200 bg-slate-50">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium mr-3">POST</span>
                      <span className="font-mono text-sm">/api/generate</span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">Generate Text</h3>
                      <p className="text-slate-600 mb-4">
                        Generate text using best-of-N inference with your chosen model. Authentication via a Bearer token with your API key is required.
                      </p>
                      <h4 className="text-sm font-semibold mb-2">Request Parameters</h4>
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Parameter</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Required</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200 text-sm">
                            <tr>
                              <td className="px-4 py-3 font-mono">model</td>
                              <td className="px-4 py-3">string</td>
                              <td className="px-4 py-3">Yes</td>
                              <td className="px-4 py-3">Model ID with optional -B suffix for best-of-N (e.g., "o4-mini-B10"). If no number specified after -B, defaults to 8 candidates.</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-mono">input</td>
                              <td className="px-4 py-3">string or array</td>
                              <td className="px-4 py-3">Yes</td>
                              {/* FIX: Escaped curly braces below */}
                              <td className="px-4 py-3">The prompt text or an array of message objects (e.g., [&lbrace;"role": "user", "content": "Hello"&rbrace;]).</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-mono">include_candidates</td>
                              <td className="px-4 py-3">boolean</td>
                              <td className="px-4 py-3">No</td>
                              <td className="px-4 py-3">If true, includes all candidate responses in the output; otherwise, only the best response is returned.</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-mono">judge_model</td>
                              <td className="px-4 py-3">string</td>
                              <td className="px-4 py-3">No</td>
                              <td className="px-4 py-3">Custom model for selecting the best response in best-of-N; defaults to the base model if not specified.</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-mono">temperature</td>
                              <td className="px-4 py-3">float</td>
                              <td className="px-4 py-3">No</td>
                              <td className="px-4 py-3">Controls randomness; higher values increase creativity (range 0.0 to 1.0). Passed to provider API.</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-mono">max_tokens</td>
                              <td className="px-4 py-3">integer</td>
                              <td className="px-4 py-3">No</td>
                              <td className="px-4 py-3">Maximum number of tokens in the output. May be mapped from max_output_tokens in some providers.</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-mono">top_p</td>
                              <td className="px-4 py-3">float</td>
                              <td className="px-4 py-3">No</td>
                              <td className="px-4 py-3">Nucleus sampling; controls diversity (range 0.0 to 1.0). Passed to provider API.</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-mono">top_k</td>
                              <td className="px-4 py-3">integer</td>
                              <td className="px-4 py-3">No</td>
                              <td className="px-4 py-3">Limits the number of top tokens considered. Passed to provider API.</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-mono">presence_penalty</td>
                              <td className="px-4 py-3">float</td>
                              <td className="px-4 py-3">No</td>
                              <td className="px-4 py-3">Penalizes tokens based on presence in input. Passed to provider API.</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-mono">frequency_penalty</td>
                              <td className="px-4 py-3">float</td>
                              <td className="px-4 py-3">No</td>
                              <td className="px-4 py-3">Penalizes frequent tokens in output. Passed to provider API.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3 mb-4">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-slate-700">
                            <strong>Passthrough Parameters:</strong> Parameters like temperature, max_tokens, top_p, etc., are forwarded to the underlying provider API with necessary adjustments. Refer to the specific provider's documentation for exact behavior.
                          </p>
                          <p className="text-sm text-slate-700 mt-2">
                            <strong>Limitations:</strong> Streaming is not supported for this endpoint and will return a 400 error. Best-of-N is controlled via the model suffix (e.g., -B10).
                          </p>
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold mb-2">Response</h4>
                      <pre className="bg-slate-50 p-4 rounded-lg overflow-auto text-sm font-mono text-slate-600 mb-4">
{`{
  "selected_text": "The generated text from the best candidate",
  "candidates_count": 10,
  "candidate_responses": ["Response 1", "Response 2", ...], // Only if include_candidates is true
  "evaluator": "o4-mini", // Judge model used or "N/A"
  "usage": {
    "input_tokens": 50,
    "output_tokens": 200,
    "reasoning_tokens": 30,
    "total_tokens": 280
  }
}`}
                      </pre>
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-slate-700">
                            <strong>Usage Tracking:</strong> The response includes detailed token usage, aggregated for best-of-N calls, to help with cost estimation and monitoring.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Supported Models Section */}
              <section id="models" className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Supported Models</h2>
                  <p className="text-slate-600 mb-6">
                    Quality Compute supports models from major providers. Use these in the 'model' parameter for the /generate endpoint.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">🟢</span>
                        <h3 className="text-lg font-semibold">OpenAI</h3>
                      </div>
                      <ul className="pl-10 list-disc text-sm text-slate-600 space-y-1">
                        <li>gpt-4o</li>
                        <li>gpt-4-turbo</li>
                        <li>gpt-4.1</li>
                        <li>gpt-4.1-mini</li>
                        <li>gpt-4.1-nano</li>
                        <li>chatgpt-4o-latest</li>
                        <li>o4-mini</li>
                        <li>o3</li>
                        <li>o1-pro</li>
                      </ul>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">🔵</span>
                        <h3 className="text-lg font-semibold">Google</h3>
                      </div>
                      <ul className="pl-10 list-disc text-sm text-slate-600 space-y-1">
                        <li>gemini-2.5-pro-preview-03-25</li>
                        <li>gemini-2.5-flash</li>
                        <li>
                          gemini-2.5-flash (thinking)
                          <ul className="pl-4 list-circle">
                            <li>accessed by adding the thinking_budget parameter</li>
                          </ul>
                        </li>
                        <li>gemini-2.0-flash-lite-preview</li>
                        <li>gemini-1.5-flash-8b</li>
                      </ul>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">🟠</span>
                        <h3 className="text-lg font-semibold">xAI</h3>
                      </div>
                      <ul className="pl-10 list-disc text-sm text-slate-600 space-y-1">
                        <li>grok-3-beta</li>
                        <li>grok-3-mini-beta</li>
                        <li>grok-3-fast-beta</li>
                        <li>grok-3-mini-fast-beta</li>
                      </ul>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">🟣</span>
                        <h3 className="text-lg font-semibold">Anthropic</h3>
                      </div>
                      <ul className="pl-10 list-disc text-sm text-slate-600 space-y-1">
                        <li>claude-3-opus-20240229</li>
                        <li>claude-3-sonnet</li>
                        <li>claude-3-haiku-20240307</li>
                        <li>claude-3-7-sonnet-20250219</li>
                        <li>claude-3-7-sonnet-thinking</li>
                        <li>claude-3-5-sonnet-20241022</li>
                        <li>claude-3-5-haiku-20241022</li>
                      </ul>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">🔴</span>
                        <h3 className="text-lg font-semibold">DeepSeek</h3>
                      </div>
                      <ul className="pl-10 list-disc text-sm text-slate-600 space-y-1">
                        <li>deepseek-chat</li>
                        <li>deepseek-reasoner</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">
                        To use best-of-N inference, append -B[N] to any model name, where [N] is the number of candidates (e.g., "gpt-4o-B5"). If no number is specified, it defaults to 8. A suffix of -B1 or no suffix results in a single call.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Error Handling Section */}
              <section id="error-handling" className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Error Handling</h2>
                  <p className="text-slate-600 mb-6">
                    The API uses conventional HTTP response codes to indicate the success or failure of an API request. Specific error messages provide detailed information.
                  </p>
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200 text-sm">
                        <tr>
                          <td className="px-4 py-3 font-mono text-slate-700">200</td>
                          <td className="px-4 py-3 text-green-600 font-medium">OK</td>
                          <td className="px-4 py-3">The request was successful</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-slate-700">400</td>
                          <td className="px-4 py-3 text-yellow-600 font-medium">Bad Request</td>
                          <td className="px-4 py-3">Invalid input, missing parameters, or unsupported features like streaming</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-slate-700">401</td>
                          <td className="px-4 py-3 text-red-600 font-medium">Unauthorized</td>
                          <td className="px-4 py-3">Invalid or missing API key</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-slate-700">404</td>
                          <td className="px-4 py-3 text-red-600 font-medium">Not Found</td>
                          <td className="px-4 py-3">Endpoint or resource not found</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-slate-700">429</td>
                          <td className="px-4 py-3 text-red-600 font-medium">Too Many Requests</td>
                          <td className="px-4 py-3">Rate limit exceeded</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-mono text-slate-700">500</td>
                          <td className="px-4 py-3 text-red-600 font-medium">Server Error</td>
                          <td className="px-4 py-3">Internal server error or provider API failure</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <h3 className="text-lg font-semibold mb-3">Error Response Format</h3>
                  <pre className="bg-slate-50 p-4 rounded-lg overflow-auto text-sm font-mono text-slate-600">
{`{
  "error": "Error message describing what went wrong"
}`}
                  </pre>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500 border-t border-slate-200 bg-white/50 mt-12">
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