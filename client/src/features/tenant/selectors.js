import { createSelector } from '@reduxjs/toolkit';

const selectTenantState = (state) => state.tenant;

export const selectTenantData = createSelector(
  [selectTenantState],
  (tenant) => tenant.current
);

export const selectTenantStatus = createSelector(
  [selectTenantState],
  (tenant) => tenant.status
);

export const selectTenantError = createSelector(
  [selectTenantState],
  (tenant) => tenant.error
);
