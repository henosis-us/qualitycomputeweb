// src/pages/PurchaseCancelled.js (or your preferred path)
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PurchaseCancelled() {
  const navigate = useNavigate();

  useEffect(() => {
    // You can optionally show a brief message or use a toast notification
    // before redirecting, but for simplicity, we redirect immediately.
    console.log('Payment cancelled. Redirecting to dashboard.');
    // Optional: Display a toast message here indicating cancellation
    // alert('Your payment was cancelled.'); // Simple alert example

    // Redirect to the main dashboard page
    // Using replace: true so the cancel page isn't in the browser history.
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  // Render a loading state or null while redirecting
  // This content will likely only flash briefly, if at all.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6 text-center">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl max-w-lg w-full">
            <h1 className="text-2xl font-semibold text-slate-700">Redirecting...</h1>
            <p className="text-slate-500 mt-2">Your payment was cancelled. You are being returned to the dashboard.</p>
            {/* Optional: Add a spinner here */}
        </div>
    </div>
  );
}