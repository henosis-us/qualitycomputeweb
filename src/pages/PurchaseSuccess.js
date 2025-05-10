// src/pages/PurchaseSuccess.js (or your preferred path)
import React, { useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

export default function PurchaseSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      console.log('Stripe Checkout Session ID (Success):', sessionId);
      // Here you could:
      // 1. Optionally make an API call to your backend to fetch session details
      //    if you want to display more specific info (e.g., credits purchased).
      //    However, fulfillment (adding credits) should be handled by your webhook.
      // 2. Clear any client-side state related to the purchase (e.g., cart items if it were an e-commerce site).
      // 3. Trigger a data refresh for user credits if needed, though a page reload or
      //    navigating back to the dashboard and its `useEffect` should handle this.
    } else {
      // If no session_id, maybe redirect to dashboard or show a generic message
      console.warn('No session_id found on success page. This might indicate an issue.');
      // Optionally redirect: navigate('/dashboard');
    }
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6 text-center">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl max-w-lg w-full">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Payment Successful!</h1>
        <p className="text-slate-600 mb-8 text-lg">
          Thank you for your purchase. Your credits should be added to your account shortly.
          You will receive an email confirmation once the transaction is fully processed.
        </p>
        {sessionId && (
          <p className="text-xs text-slate-400 mb-8">
            Transaction ID: {sessionId}
          </p>
        )}
        <Link
          to="/dashboard"
          className="w-full sm:w-auto inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          Go to Dashboard
        </Link>
      </div>
      <p className="mt-8 text-sm text-slate-500">
        If your credits don't appear within a few minutes, please <Link to="/contact" className="text-indigo-600 hover:underline">contact support</Link>.
      </p>
    </div>
  );
}