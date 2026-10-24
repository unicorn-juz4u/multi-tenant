import { createSlice } from '@reduxjs/toolkit';
import { fetchDashboardStats } from './dashboardThunks.js';

const initialState = {
  stats: {
    projects: {
      total: 0,
      byStatus: {
        planning: 0,
        active: 0,
        completed: 0,
        on_hold: 0,
        archived: 0,
      },
      myProjectsCount: 0,
    },
    users: {
      total: 0,
      active: 0,
    },
    recentProjects: [],
  },
  status: 'idle',
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to load stats';
      });
  },
});

export default dashboardSlice.reducer;
