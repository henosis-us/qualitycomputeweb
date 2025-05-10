// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Use useNavigate for React Router navigation
import { loginUser } from '../api'; // Import the loginUser function from api.js

export default function Login() {
  const [elevated, setElevated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Call the real backend API using loginUser from api.js
      const data = await loginUser(formData.email, formData.password);
      // On success, store the JWT token, user data, and user ID in localStorage
      localStorage.setItem('authToken', data.token); // Store token securely
      localStorage.setItem('userData', JSON.stringify(data.user)); // Store user data as JSON
      localStorage.setItem('userId', data.user.user_id); // Store user ID
      console.log('Login successful, stored data:', data.user);
      // Navigate to dashboard using React Router for seamless transition
      navigate('/dashboard', { replace: true }); // Use replace to avoid back navigation to login
    } catch (err) {
      // Handle API errors and set error message
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
      `}</style>
      
      {/* Pill-shaped Header */}
      <header className={`sticky top-4 z-50 mx-6 ${elevated ? 'shadow-lg' : ''}`}>
        <div className={`max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 transition-all ${elevated ? 'shadow-sm' : ''}`}>
          <Link to="/" className="flex items-center gap-3 font-semibold text-[17px] tracking-tight">
            <span className="inline-grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-md shadow-indigo-200">QC</span>
            <span className="hidden sm:inline-block">Quality Compute</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/register" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Register</Link>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 py-20 px-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
              </div>
              
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                    <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800">Forgot password?</Link>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:from-indigo-700 hover:to-purple-700 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
              
              <div className="mt-8 text-center text-sm text-slate-600">
                Don't have an account? <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-medium">Sign up</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
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