import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { fetchUsers, createUser, updateUser, deleteUser } from './usersThunks.js';

export const usersAdapter = createEntityAdapter({
  selectId: (user) => user.id,
  sortComparer: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
});

const initialState = usersAdapter.getInitialState({
  status: 'idle',
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    page: 1,
    limit: 20,
    search: '',
    role: 'all',
  },
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsersFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchUsers
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        usersAdapter.setAll(state, action.payload.items);
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        if (action.meta?.aborted || action.payload === 'aborted') {
          return;
        }
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch users';
      });

    // createUser
    builder.addCase(createUser.fulfilled, (state, action) => {
      usersAdapter.addOne(state, action.payload);
      state.pagination.totalItems += 1;
    });

    // updateUser
    builder.addCase(updateUser.fulfilled, (state, action) => {
      usersAdapter.upsertOne(state, action.payload);
    });

    // deleteUser
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      usersAdapter.removeOne(state, action.payload);
      state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
    });
  },
});

export const { setUsersFilters, clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
