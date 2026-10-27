import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import store from '../app/store.js';
import { login, logout } from '../features/auth/authThunks.js';
import Navbar from '../components/Navbar.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import ProtectedRoute from '../routes/ProtectedRoute.jsx';
import PublicOnlyRoute from '../routes/PublicOnlyRoute.jsx';
import api, { getAccessTokenInMemory } from '../api/axiosInstance.js';

describe('Logout Security & Transition Verification', () => {
  it('purges all client auth and entity data on logout and returns to login page without loader hang', async () => {
    // 1. Mock API calls
    vi.spyOn(api, 'post').mockImplementation((url) => {
      if (url === '/auth/login') {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              user: { id: 'u1', name: 'Alice Acme', email: 'owner@acme.test', role: 'owner', tenantId: 't1' },
              tenant: { id: 't1', name: 'Acme Corp', slug: 'acme-corp', plan: 'pro' },
              accessToken: 'mock_jwt_access_token_123',
            },
          },
        });
      }
      if (url === '/auth/logout') {
        return Promise.resolve({
          data: { success: true, message: 'Logged out successfully' },
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });

    // Log in first
    await store.dispatch(login({ email: 'owner@acme.test', password: 'Test@1234' }));

    // Verify authenticated state
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(getAccessTokenInMemory()).toBe('mock_jwt_access_token_123');

    // 2. Render authenticated application
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route
                path="/dashboard"
                element={
                  <div>
                    <Navbar />
                    <h1>Dashboard Content</h1>
                  </div>
                }
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();

    // 3. User clicks on user dropdown then clicks "Sign Out"
    const user = userEvent.setup();
    const dropdownButton = screen.getByRole('button', { name: /AA/i });
    await user.click(dropdownButton);

    const signOutButton = screen.getByRole('button', { name: /Sign Out/i });
    await user.click(signOutButton);

    // 4. Verify in-memory access token is completely null
    expect(getAccessTokenInMemory()).toBeNull();

    // 5. Verify Redux store is completely wiped
    const finalState = store.getState();
    expect(finalState.auth.isAuthenticated).toBe(false);
    expect(finalState.auth.user).toBeNull();
    expect(finalState.auth.tenant).toBeNull();
    expect(finalState.auth.accessToken).toBeNull();
    expect(finalState.auth.bootstrapping).toBe(false);

    // 6. Verify we land cleanly on the Sign In page, and NOT the "Initializing secure session..." loader
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Sign In/i })).toBeInTheDocument();
      expect(screen.queryByText(/Initializing secure session/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Dashboard Content/i)).not.toBeInTheDocument();
    });
  });
});
