import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance.js';
import { addToast } from '../ui/uiSlice.js';

export const fetchTenant = createAsyncThunk(
  'tenant/fetchTenant',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tenant');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenant details');
    }
  }
);

export const updateTenant = createAsyncThunk(
  'tenant/updateTenant',
  async (tenantData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch('/tenant', tenantData);
      dispatch(
        addToast({
          type: 'success',
          message: 'Organization settings updated successfully',
        })
      );
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update tenant settings';
      dispatch(addToast({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);
