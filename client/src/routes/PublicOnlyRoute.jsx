import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks.js';
import { selectIsAuthenticated, selectIsBootstrapping } from '../features/auth/selectors.js';
import { Layers } from 'lucide-react';

export const PublicOnlyRoute = () => {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const bootstrapping = useAppSelector(selectIsBootstrapping);

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="h-16 w-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 animate-pulse">
          <Layers className="h-8 w-8" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
          Verifying session...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect to requested URL or /dashboard
    const origin = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={origin} replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;
