import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance.js';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard metrics');
    }
  }
);
