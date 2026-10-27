import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/Button.jsx';
import SEO from '../components/SEO.jsx';
import { useAppSelector } from '../app/hooks.js';
import { selectUserRole } from '../features/auth/selectors.js';

export const ForbiddenPage = ({ requiredRoles = [] }) => {
  const currentRole = useAppSelector(selectUserRole);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
      <SEO
        title="403 Access Denied"
        description="Access forbidden. You do not have permissions to view this resource."
        robots="noindex, nofollow"
      />

      <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 shadow-sm">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 mb-2">
        403 Forbidden
      </span>

      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
        Access Denied
      </h1>

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-md">
        You do not have sufficient permissions to view this resource. Your current role is{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{currentRole || 'unknown'}</span>
        {requiredRoles.length > 0 && (
          <span>, but this area requires: [{requiredRoles.join(', ')}].</span>
        )}
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" icon={Home}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
