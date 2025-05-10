import React, { useState, useEffect } from 'react';
import { getOverviewData } from '../../api'; // Import the API function
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CreditPurchaseModal from '../components/CreditPurchaseModal'; // Import the modal component for local use

export default function Overview() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    credits: 0,
    apiCalls: {
      today: 0,
      thisWeek: 0,
      total: 0,
    },
    recentCalls: [],
    usageByModel: [],
    dailyUsage: [],
  });
  const [error, setError] = useState(null); // State to handle errors
  const [refreshKey, setRefreshKey] = useState(0); // Add a key to force re-fetch on refresh
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control credit purchase modal

  // Retrieve authToken (JWT) from local storage
  const authToken = localStorage.getItem('authToken');

  // Function to open the credit purchase modal
  const openCreditModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the credit purchase modal
  const closeCreditModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!authToken) {
      console.error('No authentication token found. Redirecting to login.');
      window.location.href = '/login';
      return;
    }

    const fetchOverviewData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching overview data...'); // Debug log for fetching
        const overviewData = await getOverviewData(authToken, '7d'); // Fetch data with debug log
        console.log('Received overview data:', overviewData); // Log received data for debugging
        setUserData(overviewData); // Set data directly from response
      } catch (err) {
        console.error('Error fetching overview data:', err);
        setError(err.message || 'Failed to load overview data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();
  }, [authToken, refreshKey]); // Re-fetch if authToken or refreshKey changes

  // Format date using UTC explicitly to avoid timezone offsets
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'; // Handle null or undefined
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date'; // Handle invalid dates
    }
    return date.toLocaleDateString('en-US', {
      timeZone: 'UTC', // Force UTC timezone
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    return status === 'success' ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200';
  };

  // Prepare data for Recharts bar chart
  const prepareDailyUsageData = () => {
    if (!userData.dailyUsage || userData.dailyUsage.length === 0) return [];
    return userData.dailyUsage.map(day => ({
      date: day.date, // Use date for x-axis
      inputTokens: day.input_tokens || 0,
      outputTokens: day.output_tokens || 0,
    }));
  };

  const dailyUsageData = prepareDailyUsageData();
  const maxTokenValue = dailyUsageData.length > 0
    ? Math.max(...dailyUsageData.map(day => (day.inputTokens || 0) + (day.outputTokens || 0)))
    : 0; // Calculate max value with fallback

  // Function to refresh data manually
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1); // Increment key to trigger useEffect re-fetch
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm shadow-md">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h12.876c1.684 0 3.062-1.378 3.062-3.078V8.078c0-1.7-1.378-3.078-3.062-3.078H5.062C3.378 5 2 6.378 2 8.078v8.844c0 1.7 1.378 3.078 3.062 3.078z" />
        </svg>
        {error} Please try refreshing the page or contact support if the issue persists.
      </div>
    );
  }

  return (
    <>
      {/* Render Credit Purchase Modal locally in Overview */}
      <CreditPurchaseModal isOpen={isModalOpen} onClose={closeCreditModal} />

      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500">API Calls Today</h3>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-slate-800">{(userData.apiCalls?.today || 0).toLocaleString()}</span>
              <span className="ml-2 text-sm text-green-600 font-medium">+12% ↑</span> {/* This could be dynamic if backend provides trends */}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {(userData.apiCalls?.thisWeek || 0).toLocaleString()} this week
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500">Token Usage Today</h3>
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-slate-800">{((userData.dailyUsage?.[0]?.input_tokens || 0) + (userData.dailyUsage?.[0]?.output_tokens || 0)).toLocaleString()}</span>
              <span className="ml-2 text-sm text-red-600 font-medium">-8% ↓</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {Array.isArray(userData.dailyUsage) ? userData.dailyUsage.reduce((sum, day) => sum + ((day.input_tokens || 0) + (day.output_tokens || 0)), 0).toLocaleString() : '0'} this period
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500">Credit Balance</h3>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-slate-800">{(userData.credits || 0).toFixed(2)}</span>
            </div>
            <p className="mt-2 flex items-center">
              <button 
                onClick={openCreditModal} 
                className="text-xs bg-indigo-600 text-white py-1 px-3 rounded-full hover:bg-indigo-700 transition-colors"
              >
                Add Credits
              </button>
            </p>
          </div>
        </div>

        {/* Usage Chart & Model Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily usage chart with Recharts */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Token Usage (Last 7 Days)</h3>
            {dailyUsageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dailyUsageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                      timeZone: 'UTC', // Force UTC timezone to match data
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })} 
                  />
                  <YAxis domain={[0, maxTokenValue]} />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Bar dataKey="inputTokens" name="Input Tokens" fill="#3b82f6" />
                  <Bar dataKey="outputTokens" name="Output Tokens" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No daily usage data available.
              </div>
            )}
          </div>

          {/* Model usage */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Usage by Model</h3>
            <div className="space-y-4">
              {userData.usageByModel.map((model, index) => (
                <div key={model.model} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">{model.model}</span>
                    <span className="text-sm text-slate-500">{model.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${index % 2 === 0 ? 'from-emerald-400 to-emerald-600' : 'from-blue-400 to-blue-600'}`} // Alternate colors for simplicity
                      style={{ width: `${model.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent API Calls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent API Calls</h3>
            <button className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors">
              View All Logs
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Input Tokens</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Output Tokens</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {userData.recentCalls.map((call) => (
                  <tr key={call.log_id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {formatDate(call.timestamp)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="font-medium text-slate-800">{call.model_used.split('-B')[0]}</div>
                      {call.model_used.includes('-B') && (
                        <div className="text-xs text-slate-500">Best of {call.model_used.split('-B')[1]}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {(call.tokens_in || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {(call.tokens_out || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)} border`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-right">
                      <button className="px-3 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}