import { createSelector } from '@reduxjs/toolkit';

const selectDashboardState = (state) => state.dashboard;

export const selectDashboardStats = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.stats
);

export const selectDashboardStatus = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.status
);

export const selectDashboardError = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.error
);

export const selectProjectCounters = createSelector(
  [selectDashboardStats],
  (stats) => stats.projects
);

export const selectUserCounters = createSelector(
  [selectDashboardStats],
  (stats) => stats.users
);

export const selectRecentProjects = createSelector(
  [selectDashboardStats],
  (stats) => stats.recentProjects || []
);
