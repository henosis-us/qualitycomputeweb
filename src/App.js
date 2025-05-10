import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ApiReference from './pages/ApiReference';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import ApiPlayground from './pages/dashboard/ApiPlayground';
import UsageAnalytics from './pages/dashboard/UsageAnalytics';
import ApiKeys from './pages/dashboard/ApiKeys';
import Settings from './pages/dashboard/Settings';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Import the new Forgot Password page
import ResetPasswordPage from './pages/ResetPasswordPage'; // Import the new Reset Password page

// Load Stripe promise with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Elements stripe={stripePromise}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* New route for Forgot Password */}
          <Route path="/reset-password/:resetToken" element={<ResetPasswordPage />} /> {/* New route for Reset Password with token */}
          <Route path="/api-reference" element={<ApiReference />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="overview" element={<Overview />} />
            <Route path="playground" element={<ApiPlayground />} />
            <Route path="usage" element={<UsageAnalytics />} />
            <Route path="api-keys" element={<ApiKeys />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </Elements>
  );
}

export default App;