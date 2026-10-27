import axios from 'axios';

let inMemoryToken = null;
let storeRef = null;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setStoreReference = (store) => {
  storeRef = store;
};

export const setAccessTokenInMemory = (token) => {
  inMemoryToken = token;
};

export const getAccessTokenInMemory = () => {
  return inMemoryToken;
};

export const clearAuthSession = () => {
  inMemoryToken = null;
  failedQueue = [];
  isRefreshing = false;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Always send cookies (for refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach in-memory access token
api.interceptors.request.use(
  (config) => {
    const token = inMemoryToken;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401, single token refresh, and request queueing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints or already-retried requests
    const isAuthRoute =
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/register') ||
      originalRequest.url.includes('/auth/refresh') ||
      originalRequest.url.includes('/auth/logout');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // Queue concurrent requests while token refresh is in flight
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint directly using raw axios to avoid interceptor recursion
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken, user, tenant } = refreshResponse.data.data;
        setAccessTokenInMemory(accessToken);

        // Update Redux state if store reference exists
        if (storeRef) {
          storeRef.dispatch({
            type: 'auth/tokenRefreshed',
            payload: { accessToken, user, tenant },
          });
        }

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessTokenInMemory(null);

        // Session is expired - reset Redux store
        if (storeRef) {
          storeRef.dispatch({ type: 'auth/resetStore' });
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
