import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/Button.jsx';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 animate-fade-in">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-6 shadow-sm">
        <FileQuestion className="h-8 w-8" />
      </div>

      <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 mb-2">
        404 Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
        Page Not Found
      </h1>

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-md">
        The page you are looking for doesn't exist, has been removed, or was never created.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" icon={Home}>
            Go to Dashboard
          </Button>
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
