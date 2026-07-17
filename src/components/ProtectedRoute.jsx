import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="text-center text-zinc-400 mt-20">Loading profile...</div>;
  }

  if (!isAuthenticated) {
    // Redirect them to the auth screen cleanly via React Router
    return <Navigate to="/auth" replace />;
  }

  return children;
}