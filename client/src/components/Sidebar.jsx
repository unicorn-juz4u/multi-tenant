import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks.js';
import { selectSidebarOpen } from '../features/ui/selectors.js';
import { setSidebarOpen } from '../features/ui/uiSlice.js';
import { selectIsOwner, selectIsAdminOrOwner } from '../features/auth/selectors.js';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  X,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectSidebarOpen);
  const isOwner = useAppSelector(selectIsOwner);
  const isAdminOrOwner = useAppSelector(selectIsAdminOrOwner);

  const closeSidebar = () => dispatch(setSidebarOpen(false));

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      visible: true,
    },
    {
      to: '/projects',
      label: 'Projects',
      icon: FolderKanban,
      visible: true,
    },
    {
      to: '/team',
      label: 'Team Members',
      icon: Users,
      visible: isAdminOrOwner,
      badge: 'Admin',
    },
    {
      to: '/settings',
      label: 'Tenant Settings',
      icon: Settings,
      visible: isOwner,
      badge: 'Owner',
    },
  ];

  const linkClasses = ({ isActive }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 shadow-sm'
        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64">
      {/* Brand Logo Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        <NavLink to="/dashboard" onClick={closeSidebar} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
            <Layers className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
            SaaSify
          </span>
        </NavLink>
        <button
          type="button"
          onClick={closeSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </div>
        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={linkClasses}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
      </div>

      {/* Tenant Security Tag */}
      <div className="p-4 m-4 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2.5">
        <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">Isolated Tenant</p>
          <p className="text-[11px] text-slate-400">JWT Scoped Row-Level</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-20 w-64">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeSidebar}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-64 animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
