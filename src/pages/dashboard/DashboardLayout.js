import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getOverviewData } from '../../api'; // Import API function to fetch data
import CreditPurchaseModal from '../components/CreditPurchaseModal'; // Import the new modal component

export default function DashboardLayout() {
  const [elevated, setElevated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // State to hold user data, including credits
  const [refreshKey, setRefreshKey] = useState(0); // Key to trigger re-fetch on refresh
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control credit purchase modal
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to control user dropdown visibility
  const dropdownRef = useRef(null); // Ref to detect clicks outside the dropdown

  // Retrieve authToken (JWT) from local storage
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    if (!authToken) {
      console.error('No authentication token found. Redirecting to login.');
      navigate('/login', { replace: true });
      return;
    }

    const fetchUserData = async () => {
      try {
        console.log('Fetching user data...'); // Debug log
        const overviewData = await getOverviewData(authToken, '7d'); // Fetch data from backend
        console.log('Received user data:', overviewData); // Debug log for received data
        setUser({
          name: overviewData.name,
          credits: overviewData.credits,
        }); // Set only name and credits
      } catch (err) {
        console.error('Error fetching user data:', err);
        // No error state; handle gracefully with fallbacks
      }
    };

    fetchUserData();

    // Existing scroll handler for elevation
    const onScroll = () => setElevated(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);

    // Set active tab based on current route
    const path = location.pathname.split('/').pop();
    if (path && path !== 'dashboard') {
      setActiveTab(path);
    } else {
      setActiveTab('overview');
    }

    return () => window.removeEventListener('scroll', onScroll);
  }, [location, navigate, authToken, refreshKey]); // Re-fetch if refreshKey changes

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const navigateToTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${tab}`);
    }
  };

  // Function to refresh user data manually
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1); // Increment key to trigger useEffect re-fetch
  };

  // Open the credit purchase modal
  const openCreditModal = () => {
    setIsModalOpen(true);
  };

  // Close the credit purchase modal
  const closeCreditModal = () => {
    setIsModalOpen(false);
  };

  // Fallback user data if not loaded yet
  const displayName = user ? user.name : 'User'; // Fallback to 'User'
  const displayCredits = user ? user.credits.toFixed(2) : '0.00'; // Fallback to '0.00'

  // Handle sign out
  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
    setIsDropdownOpen(false); // Close the dropdown
    navigate('/'); // Navigate to home page
  };

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
      
      {/* Pill-shaped Header with Refresh Button and Buy Credits Button */}
      <header className="sticky top-4 z-50 mx-6">
        <div className={`max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 transition-all ${elevated ? 'shadow-md' : ''}`}>
          <Link to="/" className="flex items-center gap-3 font-semibold text-[17px] tracking-tight">
            <span className="inline-grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-md shadow-indigo-200">QC</span>
            <span className="hidden sm:inline-block">Quality Compute</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  aria-expanded={isDropdownOpen}
                >
                  <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                    {user ? (user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A') : 'N/A'}
                  </span>
                  <span className="hidden md:inline">{displayName}</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-slate-200 py-1">
                    {/* Removed Profile link */}
                    <Link 
                      to="/dashboard/api-keys" 
                      onClick={() => setIsDropdownOpen(false)} 
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      API Keys
                    </Link>
                    <Link 
                      to="/dashboard/settings" 
                      onClick={() => setIsDropdownOpen(false)} 
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Settings
                    </Link>
                    <div className="border-t border-slate-200 my-1"></div>
                    <button 
                      onClick={handleSignOut} 
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Render Credit Purchase Modal */}
      <CreditPurchaseModal isOpen={isModalOpen} onClose={closeCreditModal} />
      
      {/* Main Content */}
      <main className="flex-1 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar */}
            <aside className="col-span-12 lg:col-span-3">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-28">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3">
                      {user ? (user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A') : 'N/A'}
                    </div>
                    <h2 className="text-lg font-semibold">{displayName}</h2>
                    <div className="mt-2 flex items-center bg-indigo-50 py-1.5 px-4 rounded-full">
                      <span className="text-xs font-medium text-indigo-600">Credits:</span>
                      <span className="text-sm font-bold text-indigo-800">{displayCredits}</span>
                    </div>
                    <button 
                      disabled // Disable the button temporarily
                      onClick={openCreditModal} 
                      className="mt-4 w-full px-4 py-2 bg-indigo-100 hover:bg-indigo-200 transition-colors text-indigo-700 rounded-lg text-sm font-medium cursor-not-allowed opacity-50" // Added styles for disabled state
                      title="Credit purchasing is temporarily disabled while the payment system is being updated."
                    >
                      Buy Credits (Temporarily Unavailable)
                    </button>
                  </div>
                </div>
                <nav className="p-3">
                  <ul className="space-y-1">
                    <li>
                      <button 
                        onClick={() => navigateToTab('overview')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard Overview
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => navigateToTab('playground')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'playground' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01m-6.938 4h12.876c1.684 0 3.062-1.378 3.062-3.078V8.078c0-1.7-1.378-3.078-3.062-3.078H5.062C3.378 5 2 6.378 2 8.078v8.844c0 1.7 1.378 3.078 3.062 3.078z" />
                        </svg>
                        API Playground
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => navigateToTab('usage')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'usage' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Usage & Analytics
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => navigateToTab('api-keys')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'api-keys' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        API Keys
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => navigateToTab('settings')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </aside>
            
            {/* Main Dashboard Content */}
            <div className="col-span-12 lg:col-span-9">
              <Outlet />
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