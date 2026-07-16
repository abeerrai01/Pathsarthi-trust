import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useInternAuth } from '../contexts/InternAuthContext';

const InternProtectedRoute = ({ children }) => {
  const { internUser, internProfile, loading, accessRevoked } = useInternAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-violet-400 mb-4"></div>
        <p className="text-violet-200 font-medium tracking-wide">Verifying access...</p>
      </div>
    );
  }

  if (accessRevoked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-950 via-rose-900 to-slate-900 text-white px-4">
        <div className="bg-white/10 backdrop-blur-md border border-red-400/30 rounded-2xl p-10 max-w-md text-center shadow-2xl">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-red-300 mb-3">Access Revoked</h2>
          <p className="text-red-200 mb-6">
            Your internship portal access has been revoked by the admin team. 
            Please contact PathSarthi Trust for further information.
          </p>
          <a
            href="/internship"
            className="inline-block bg-red-500 hover:bg-red-400 text-white font-bold px-6 py-3 rounded-full transition-all duration-200"
          >
            Go Back to Internship Page
          </a>
        </div>
      </div>
    );
  }

  if (!internUser || !internProfile) {
    return <Navigate to="/intern-login" replace />;
  }

  return children;
};

export default InternProtectedRoute;
