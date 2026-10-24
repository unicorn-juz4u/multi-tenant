import { createSelector } from '@reduxjs/toolkit';

export const selectAuth = (state) => state.auth;

export const selectCurrentUser = createSelector(
  [selectAuth],
  (auth) => auth.user
);

export const selectCurrentTenant = createSelector(
  [selectAuth],
  (auth) => auth.tenant
);

export const selectUserRole = createSelector(
  [selectCurrentUser],
  (user) => user?.role || null
);

export const selectIsAuthenticated = createSelector(
  [selectAuth],
  (auth) => auth.isAuthenticated
);

export const selectIsBootstrapping = createSelector(
  [selectAuth],
  (auth) => auth.bootstrapping
);

export const selectAuthStatus = createSelector(
  [selectAuth],
  (auth) => auth.status
);

export const selectAuthError = createSelector(
  [selectAuth],
  (auth) => auth.error
);

export const selectIsOwner = createSelector(
  [selectUserRole],
  (role) => role === 'owner'
);

export const selectIsAdminOrOwner = createSelector(
  [selectUserRole],
  (role) => role === 'admin' || role === 'owner'
);
