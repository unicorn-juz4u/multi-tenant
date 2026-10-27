import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance.js';
import { addToast } from '../ui/uiSlice.js';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params = {}, { signal, rejectWithValue }) => {
    try {
      const { page = 1, limit = 20, search = '', role = 'all' } = params;
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page.toString());
      if (limit) queryParams.append('limit', limit.toString());
      if (search) queryParams.append('search', search);
      if (role && role !== 'all') queryParams.append('role', role);

      const response = await api.get(`/users?${queryParams.toString()}`, { signal });
      return {
        items: response.data.data,
        pagination: response.data.pagination,
        filters: { page, limit, search, role },
      };
    } catch (error) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return rejectWithValue('aborted');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team members');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/users', userData);
      dispatch(
        addToast({
          type: 'success',
          message: `User '${response.data.data.name}' added to team`,
        })
      );
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add user';
      dispatch(addToast({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, changes }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${id}`, changes);
      dispatch(
        addToast({
          type: 'success',
          message: `User '${response.data.data.name}' updated successfully`,
        })
      );
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update user';
      dispatch(addToast({ type: 'error', message: msg }));
      return rejectWithValue({ id, message: msg });
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      dispatch(
        addToast({
          type: 'success',
          message: 'User removed from team',
        })
      );
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete user';
      dispatch(addToast({ type: 'error', message: msg }));
      return rejectWithValue({ id, message: msg });
    }
  }
);
