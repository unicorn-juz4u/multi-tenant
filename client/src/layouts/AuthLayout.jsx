import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layers, ShieldCheck, Database, KeyRound } from 'lucide-react';
import ToastContainer from '../components/ToastContainer.jsx';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors">
      <ToastContainer />

      {/* Left Branding Showcase (hidden on mobile, visible on tablet & desktop) */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-gradient-to-br from-brand-900 via-indigo-900 to-slate-950 p-8 lg:p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Layers className="h-6 w-6 text-brand-300" />
          </div>
          <div>
            <span className="block text-xl font-bold tracking-tight">SaaSify Enterprise</span>
            <p className="text-xs text-brand-200">Multi-Tenant Cloud Platform</p>
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 space-y-6 my-auto py-12">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-200 border border-brand-400/30">
              <ShieldCheck className="h-3.5 w-3.5" /> Row-Level Tenant Isolation
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
              Production architecture built for scale and security.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every request enforces tenant scoping strictly server-side through cryptographically verified JWTs and Mongoose query helpers. Zero data leakage across tenants.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <KeyRound className="h-5 w-5 text-brand-300 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-white">Dual JWT & Silent Refresh</p>
                <p className="text-slate-400">15-min in-memory access token + 7-day httpOnly cookie rotation</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Database className="h-5 w-5 text-indigo-300 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-white">Redux Single Source of Truth</p>
                <p className="text-slate-400">Normalized entity adapters & root reducer session reset</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} SaaSify Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Container */}
      <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile brand header (shown only on mobile) */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-slate-100">
              SaaSify
            </span>
          </div>

          {/* Form Outlet */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-elevated p-6 sm:p-8 animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
