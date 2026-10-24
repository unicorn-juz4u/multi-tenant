import { createSlice } from '@reduxjs/toolkit';
import { fetchTenant, updateTenant } from './tenantThunks.js';

const initialState = {
  current: null,
  status: 'idle',
  error: null,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    clearTenantError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchTenant
    builder
      .addCase(fetchTenant.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTenant.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchTenant.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch tenant';
      });

    // updateTenant
    builder
      .addCase(updateTenant.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateTenant.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(updateTenant.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to update tenant';
      });
  },
});

export const { clearTenantError } = tenantSlice.actions;
export default tenantSlice.reducer;
