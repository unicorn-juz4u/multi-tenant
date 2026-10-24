import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import {
  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
} from './projectsThunks.js';

export const projectsAdapter = createEntityAdapter({
  selectId: (project) => project.id,
  sortComparer: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
});

const initialState = projectsAdapter.getInitialState({
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    page: 1,
    limit: 10,
    search: '',
    status: 'all',
    sort: 'createdAt',
    order: 'desc',
  },
  selectedProjectId: null,
  // Rollback stores for optimistic updates
  _optimisticBackups: {},
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setSelectedProjectId: (state, action) => {
      state.selectedProjectId = action.payload;
    },
    setProjectsFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearProjectsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchProjects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Set all items in normalized adapter
        projectsAdapter.setAll(state, action.payload.items);
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch projects';
      });

    // fetchProjectById
    builder
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        projectsAdapter.upsertOne(state, action.payload);
      });

    // createProject
    builder
      .addCase(createProject.fulfilled, (state, action) => {
        projectsAdapter.addOne(state, action.payload);
        state.pagination.totalItems += 1;
      });

    // updateProject (optimistic update with rollback)
    builder
      .addCase(updateProject.pending, (state, action) => {
        const { id, changes } = action.meta.arg;
        const existing = state.entities[id];
        if (existing) {
          state._optimisticBackups[id] = { ...existing };
          projectsAdapter.updateOne(state, { id, changes });
        }
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const id = action.payload.id;
        delete state._optimisticBackups[id];
        projectsAdapter.upsertOne(state, action.payload);
      })
      .addCase(updateProject.rejected, (state, action) => {
        const id = action.meta.arg.id;
        const backup = state._optimisticBackups[id];
        if (backup) {
          projectsAdapter.upsertOne(state, backup);
          delete state._optimisticBackups[id];
        }
        state.error = action.payload?.message || 'Failed to update project';
      });

    // deleteProject (optimistic delete with rollback)
    builder
      .addCase(deleteProject.pending, (state, action) => {
        const id = action.meta.arg;
        const existing = state.entities[id];
        if (existing) {
          state._optimisticBackups[id] = { ...existing };
          projectsAdapter.removeOne(state, id);
          state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        delete state._optimisticBackups[action.payload];
      })
      .addCase(deleteProject.rejected, (state, action) => {
        const id = action.meta.arg;
        const backup = state._optimisticBackups[id];
        if (backup) {
          projectsAdapter.addOne(state, backup);
          state.pagination.totalItems += 1;
          delete state._optimisticBackups[id];
        }
        state.error = action.payload?.message || 'Failed to delete project';
      });
  },
});

export const { setSelectedProjectId, setProjectsFilters, clearProjectsError } = projectsSlice.actions;
export default projectsSlice.reducer;
