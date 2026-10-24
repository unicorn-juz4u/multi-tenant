import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks.js';
import { selectIsAuthenticated, selectIsBootstrapping } from '../features/auth/selectors.js';
import { Layers } from 'lucide-react';

export const ProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const bootstrapping = useAppSelector(selectIsBootstrapping);

  // Full-screen loader while silent refresh / auth bootstrapping resolves
  if (bootstrapping) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 animate-pulse">
            <Layers className="h-8 w-8" />
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
          Initializing secure session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve intended URL so user is redirected back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
