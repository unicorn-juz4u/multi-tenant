import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage.jsx';
import authReducer from '../features/auth/authSlice.js';
import uiReducer from '../features/ui/uiSlice.js';
import api from '../api/axiosInstance.js';

describe('Auth Flow Integration Test', () => {
  it('renders login form, handles credentials submission and dispatches login', async () => {
    // Mock the API response
    const mockUser = {
      id: 'u1',
      name: 'Alice Acme',
      email: 'owner@acme.test',
      role: 'owner',
      tenantId: 't1',
    };
    const mockTenant = {
      id: 't1',
      name: 'Acme Corp',
      slug: 'acme-corp',
      plan: 'pro',
    };

    vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          user: mockUser,
          tenant: mockTenant,
          accessToken: 'mock_jwt_access_token_xyz',
        },
      },
    });

    const store = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
      },
      preloadedState: {
        auth: {
          user: null,
          tenant: null,
          accessToken: null,
          isAuthenticated: false,
          bootstrapping: false,
          status: 'idle',
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<div>Dashboard Landed</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Verify form elements rendered
    expect(screen.getByRole('heading', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Work Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();

    const user = userEvent.setup();
    const emailInput = screen.getByLabelText(/Work Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    // Type credentials
    await user.type(emailInput, 'owner@acme.test');
    await user.type(passwordInput, 'Test@1234');
    await user.click(submitBtn);

    // Verify state transitioned to authenticated
    await waitFor(() => {
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user.name).toBe('Alice Acme');
      expect(state.tenant.name).toBe('Acme Corp');
    });

    // Verify redirected to dashboard
    await waitFor(() => {
      expect(screen.getByText('Dashboard Landed')).toBeInTheDocument();
    });
  });
});
