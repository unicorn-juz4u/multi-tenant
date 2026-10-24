import { createSelector } from '@reduxjs/toolkit';
import { usersAdapter } from './usersSlice.js';

const selectUsersState = (state) => state.users;

const adapterSelectors = usersAdapter.getSelectors(selectUsersState);

export const selectAllUsers = adapterSelectors.selectAll;
export const selectUserEntities = adapterSelectors.selectEntities;
export const selectUserIds = adapterSelectors.selectIds;
export const selectUserById = (state, id) => adapterSelectors.selectById(state, id);

export const selectUsersStatus = createSelector(
  [selectUsersState],
  (users) => users.status
);

export const selectUsersError = createSelector(
  [selectUsersState],
  (users) => users.error
);

export const selectUsersPagination = createSelector(
  [selectUsersState],
  (users) => users.pagination
);

export const selectUsersFilters = createSelector(
  [selectUsersState],
  (users) => users.filters
);

export const selectFilteredUsers = createSelector(
  [selectAllUsers, selectUsersFilters],
  (users, filters) => {
    return users.filter((user) => {
      if (filters.role && filters.role !== 'all' && user.role !== filters.role) {
        return false;
      }
      if (filters.search && filters.search.trim() !== '') {
        const query = filters.search.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(query);
        const matchesEmail = user.email.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) return false;
      }
      return true;
    });
  }
);
