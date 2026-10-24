import { createSelector } from '@reduxjs/toolkit';
import { projectsAdapter } from './projectsSlice.js';

const selectProjectsState = (state) => state.projects;

// Adapter selectors
const adapterSelectors = projectsAdapter.getSelectors(selectProjectsState);

export const selectAllProjects = adapterSelectors.selectAll;
export const selectProjectEntities = adapterSelectors.selectEntities;
export const selectProjectIds = adapterSelectors.selectIds;
export const selectTotalProjectsCount = adapterSelectors.selectTotal;
export const selectProjectById = (state, id) => adapterSelectors.selectById(state, id);

export const selectProjectsStatus = createSelector(
  [selectProjectsState],
  (projects) => projects.status
);

export const selectProjectsError = createSelector(
  [selectProjectsState],
  (projects) => projects.error
);

export const selectProjectsPagination = createSelector(
  [selectProjectsState],
  (projects) => projects.pagination
);

export const selectProjectsFilters = createSelector(
  [selectProjectsState],
  (projects) => projects.filters
);

export const selectSelectedProjectId = createSelector(
  [selectProjectsState],
  (projects) => projects.selectedProjectId
);

export const selectActiveProject = createSelector(
  [selectProjectEntities, selectSelectedProjectId],
  (entities, selectedId) => (selectedId ? entities[selectedId] || null : null)
);

// Filtered projects selector
export const selectFilteredProjects = createSelector(
  [selectAllProjects, selectProjectsFilters],
  (projects, filters) => {
    return projects.filter((project) => {
      if (filters.status && filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }
      if (filters.search && filters.search.trim() !== '') {
        const query = filters.search.toLowerCase();
        const matchesName = project.name.toLowerCase().includes(query);
        const matchesDesc = (project.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }
);
