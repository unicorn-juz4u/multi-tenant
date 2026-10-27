import { createSlice } from '@reduxjs/toolkit';
import { bootstrapAuth, login, register, logout, fetchMe } from './authThunks.js';

const initialState = {
  user: null,
  tenant: null,
  accessToken: null,
  isAuthenticated: false,
  bootstrapping: false, // Default to false so any state reset never hangs in loading
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    tokenRefreshed: (state, action) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.user) state.user = action.payload.user;
      if (action.payload.tenant) state.tenant = action.payload.tenant;
      state.isAuthenticated = true;
      state.bootstrapping = false;
    },
    resetStore: () => {
      return { ...initialState, bootstrapping: false };
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // bootstrapAuth
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.bootstrapping = true;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.bootstrapping = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tenant = action.payload.tenant;
        state.accessToken = action.payload.accessToken;
        state.status = 'succeeded';
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.bootstrapping = false;
        state.isAuthenticated = false;
        state.user = null;
        state.tenant = null;
        state.accessToken = null;
        state.status = 'idle';
      });

    // login
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tenant = action.payload.tenant;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
      });

    // register
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tenant = action.payload.tenant;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Registration failed';
      });

    // logout
    builder
      .addCase(logout.pending, (state) => {
        state.user = null;
        state.tenant = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.bootstrapping = false;
        state.status = 'idle';
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.tenant = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.bootstrapping = false;
        state.status = 'idle';
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.tenant = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.bootstrapping = false;
        state.status = 'idle';
        state.error = null;
      });

    // fetchMe
    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.tenant = action.payload.tenant;
    });
  },
});

export const { tokenRefreshed, resetStore, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
