import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import projectsReducer from '../features/projects/projectsSlice.js';
import usersReducer from '../features/users/usersSlice.js';
import tenantReducer from '../features/tenant/tenantSlice.js';
import dashboardReducer from '../features/dashboard/dashboardSlice.js';
import uiReducer from '../features/ui/uiSlice.js';
import { setStoreReference } from '../api/axiosInstance.js';

const appReducer = combineReducers({
  auth: authReducer,
  projects: projectsReducer,
  users: usersReducer,
  tenant: tenantReducer,
  dashboard: dashboardReducer,
  ui: uiReducer,
});

/**
 * Root Reducer Reset Pattern:
 * On logout or store reset, wipe all tenant and entity state completely.
 * Preserves user theme preference so UI doesn't suddenly flash.
 */
const rootReducer = (state, action) => {
  if (action.type === 'auth/logout/fulfilled' || action.type === 'auth/resetStore') {
    const currentTheme = state?.ui?.theme;
    state = undefined;
    if (currentTheme) {
      state = {
        ui: {
          theme: currentTheme,
          toasts: [],
          sidebarOpen: false,
        },
      };
    }
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Provide store reference to axios interceptor
setStoreReference(store);

export default store;
