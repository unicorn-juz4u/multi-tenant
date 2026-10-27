import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance.js';
import { addToast } from '../ui/uiSlice.js';

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params = {}, { signal, rejectWithValue }) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status = 'all',
        sort = 'createdAt',
        order = 'desc',
      } = params;

      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page.toString());
      if (limit) queryParams.append('limit', limit.toString());
      if (search) queryParams.append('search', search);
      if (status && status !== 'all') queryParams.append('status', status);
      if (sort) queryParams.append('sort', sort);
      if (order) queryParams.append('order', order);

      const response = await api.get(`/projects?${queryParams.toString()}`, { signal });
      return {
        items: response.data.data,
        pagination: response.data.pagination,
        filters: { page, limit, search, status, sort, order },
      };
    } catch (error) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return rejectWithValue('aborted');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/projects', projectData);
      dispatch(
        addToast({
          type: 'success',
          message: `Project '${response.data.data.name}' created successfully`,
        })
      );
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create project';
      dispatch(addToast({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, changes }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/projects/${id}`, changes);
      dispatch(
        addToast({
          type: 'success',
          message: `Project '${response.data.data.name}' updated successfully`,
        })
      );
      return response.data.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update project';
      dispatch(addToast({ type: 'error', message: msg }));
      return rejectWithValue({ id, message: msg });
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}`);
      dispatch(
        addToast({
          type: 'success',
          message: 'Project deleted successfully',
        })
      );
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete project';
      dispatch(addToast({ type: 'error', message: msg }));
      return rejectWithValue({ id, message: msg });
    }
  }
);
