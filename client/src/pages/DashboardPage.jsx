import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks.js';
import { fetchDashboardStats } from '../features/dashboard/dashboardThunks.js';
import {
  selectDashboardStats,
  selectDashboardStatus,
  selectDashboardError,
} from '../features/dashboard/selectors.js';
import { selectCurrentUser, selectCurrentTenant } from '../features/auth/selectors.js';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { formatDate } from '../utils/formatters.js';
import {
  FolderKanban,
  CheckCircle,
  Clock,
  Users,
  Plus,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Activity,
} from 'lucide-react';

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectDashboardStats);
  const status = useAppSelector(selectDashboardStatus);
  const error = useAppSelector(selectDashboardError);
  const user = useAppSelector(selectCurrentUser);
  const tenant = useAppSelector(selectCurrentTenant);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const isLoading = status === 'loading' && stats.projects.total === 0;

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome, {user?.name}
            </h1>
            <Badge type="role" value={user?.role} />
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Overview for <span className="font-semibold text-slate-800 dark:text-slate-200">{tenant?.name}</span> organization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/projects">
            <Button variant="primary" icon={Plus}>
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Projects */}
        <Card className="relative overflow-hidden" hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Projects
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {stats.projects.total}
                </p>
              )}
            </div>
            <div className="h-12 w-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <FolderKanban className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500 mr-1" />
            <span>Tenant Isolated Data</span>
          </div>
        </Card>

        {/* Active Projects */}
        <Card className="relative overflow-hidden" hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Projects
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {stats.projects.byStatus?.active || 0}
                </p>
              )}
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 mr-1">
              {stats.projects.total ? Math.round(((stats.projects.byStatus?.active || 0) / stats.projects.total) * 100) : 0}%
            </span>
            <span>of total projects active</span>
          </div>
        </Card>

        {/* My Created Projects */}
        <Card className="relative overflow-hidden" hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                My Projects
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {stats.projects.myProjectsCount || 0}
                </p>
              )}
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span>Authored by your account</span>
          </div>
        </Card>

        {/* Team Members */}
        <Card className="relative overflow-hidden" hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Team Size
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {stats.users.total}
                </p>
              )}
            </div>
            <div className="h-12 w-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-sky-600 dark:text-sky-400 mr-1">
              {stats.users.active} Active
            </span>
            <span>users in tenant</span>
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Status Breakdown & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card title="Projects by Status" subtitle="Tenant-wide breakdown" className="lg:col-span-1">
          <div className="space-y-3.5">
            {[
              { key: 'active', label: 'Active', count: stats.projects.byStatus?.active || 0, color: 'bg-emerald-500' },
              { key: 'planning', label: 'Planning', count: stats.projects.byStatus?.planning || 0, color: 'bg-amber-500' },
              { key: 'completed', label: 'Completed', count: stats.projects.byStatus?.completed || 0, color: 'bg-blue-500' },
              { key: 'on_hold', label: 'On Hold', count: stats.projects.byStatus?.on_hold || 0, color: 'bg-purple-500' },
              { key: 'archived', label: 'Archived', count: stats.projects.byStatus?.archived || 0, color: 'bg-slate-400' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{item.count}</span>
                  <span className="text-[11px] text-slate-400">
                    ({stats.projects.total ? Math.round((item.count / stats.projects.total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Projects List */}
        <Card
          title="Recent Projects"
          subtitle="Latest updates in your tenant organization"
          className="lg:col-span-2"
          action={
            <Link
              to="/projects"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" count={3} />
            </div>
          ) : stats.recentProjects?.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
              No projects created yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recentProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-850/30 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/projects/${proj.id}`}
                      className="font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 truncate block"
                    >
                      {proj.name}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {proj.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge type="status" value={proj.status} />
                    <span className="text-xs text-slate-400">{formatDate(proj.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
