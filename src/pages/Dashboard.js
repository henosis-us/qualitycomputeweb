// src/pages/Dashboard.js
import React from 'react';
import { Navigate } from 'react-router-dom';

// This file now just redirects to the main dashboard/overview
export default function Dashboard() {
  return <Navigate to="/dashboard/overview" replace />;
}