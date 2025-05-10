// src/pages/EmailVerificationPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyEmailCode } from '../api'; // Assuming you'll create this API function

export default function EmailVerificationPage() {
  const [elevated, setElevated] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  // Extract userId and email from location state passed from Register page
  const { userId, email } = location.state || {};

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!userId) {
      // If userId is not available (e.g., direct navigation), redirect to login or register
      setError('User information not found. Please register or login.');
      // Optionally redirect after a delay or provide a button
      // setTimeout(() => navigate('/register'), 3000);
    }
  }, [userId, navigate]);

  const handleChange = (e) => {
    setCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('Cannot verify email without user information. Please try registering again.');
      return;
    }
    if (!code.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await verifyEmailCode(userId, code); // API call
      setSuccessMessage(response.message + ' Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000); // Redirect after 3 seconds
    } catch (err) {
      setError(err.message || 'Failed to verify email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <style jsx global>{`
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Pill-shaped Header */}
      <header className={`sticky top-4 z-50 mx-6 ${elevated ? 'shadow-lg' : ''}`}>
        <div className={`max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 transition-all ${elevated ? 'shadow-sm' : ''}`}>
          <Link to="/" className="flex items-center gap-3 font-semibold text-[17px] tracking-tight">
            <span className="inline-grid place-items-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-md shadow-indigo-200">QC</span>
            <span className="hidden sm:inline-block">Quality Compute</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
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
                <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
                {email ? (
                  <p className="text-slate-500">
                    A verification code has been sent to <span className="font-medium">{email}</span>.
                    Please enter it below.
                  </p>
                ) : (
                  <p className="text-slate-500">Please enter the verification code sent to your email.</p>
                )}
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {successMessage}
                </div>
              )}

              {!successMessage && userId && ( // Only show form if not successful and userId is present
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={code}
                      onChange={handleChange}
                      required
                      maxLength={6} // Assuming a 6-digit code
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter 6-digit code"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !userId}
                    className={`w-full py-3 px-6 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:from-indigo-700 hover:to-purple-700 transition-colors ${isLoading || !userId ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                  </button>
                </form>
              )}

              <div className="mt-8 text-center text-sm text-slate-600">
                {/* Optionally add a "Resend Code" link here later */}
                Go back to <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Login</Link>
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