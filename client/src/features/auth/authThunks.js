import { createAsyncThunk } from '@reduxjs/toolkit';
import api, { setAccessTokenInMemory } from '../../api/axiosInstance.js';
import { addToast } from '../ui/uiSlice.js';

export const bootstrapAuth = createAsyncThunk(
  'auth/bootstrap',
  async (_, { rejectWithValue }) => {
    try {
      // 1. Attempt silent token refresh via httpOnly cookie
      const refreshRes = await api.post('/auth/refresh');
      const { accessToken, user, tenant } = refreshRes.data.data;
      setAccessTokenInMemory(accessToken);

      return { user, tenant, accessToken };
    } catch {
      setAccessTokenInMemory(null);
      return rejectWithValue(null);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, tenant, accessToken } = response.data.data;
      setAccessTokenInMemory(accessToken);

      dispatch(
        addToast({
          type: 'success',
          message: `Welcome back, ${user.name}!`,
        })
      );

      return { user, tenant, accessToken };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      dispatch(addToast({ type: 'error', message }));
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ tenantName, name, email, password }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', { tenantName, name, email, password });
      const { user, tenant, accessToken } = response.data.data;
      setAccessTokenInMemory(accessToken);

      dispatch(
        addToast({
          type: 'success',
          message: `Organization '${tenant.name}' registered successfully!`,
        })
      );

      return { user, tenant, accessToken };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      const errors = error.response?.data?.errors;
      dispatch(addToast({ type: 'error', message }));
      return rejectWithValue({ message, errors });
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Clear client state even if network call fails
    } finally {
      setAccessTokenInMemory(null);
      dispatch(addToast({ type: 'info', message: 'You have been logged out.' }));
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);
