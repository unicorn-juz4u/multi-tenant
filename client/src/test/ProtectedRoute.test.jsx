import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute.jsx';
import authReducer from '../features/auth/authSlice.js';

const renderWithAuth = (authState, initialEntry = '/dashboard') => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: authState,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<div>Login Page Mock</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Protected Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('ProtectedRoute Guard', () => {
  it('renders full-screen loader during bootstrap phase without flashing login page', () => {
    renderWithAuth({
      user: null,
      tenant: null,
      accessToken: null,
      isAuthenticated: false,
      bootstrapping: true, // Bootstrapping in progress
      status: 'idle',
      error: null,
    });

    expect(screen.getByText(/Initializing secure session/i)).toBeInTheDocument();
    expect(screen.queryByText(/Login Page Mock/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Protected Dashboard Content/i)).not.toBeInTheDocument();
  });

  it('redirects to /login when user is unauthenticated', () => {
    renderWithAuth({
      user: null,
      tenant: null,
      accessToken: null,
      isAuthenticated: false,
      bootstrapping: false,
      status: 'idle',
      error: null,
    });

    expect(screen.getByText(/Login Page Mock/i)).toBeInTheDocument();
    expect(screen.queryByText(/Protected Dashboard Content/i)).not.toBeInTheDocument();
  });

  it('renders protected child routes when authenticated', () => {
    renderWithAuth({
      user: { id: '1', name: 'Alice', role: 'owner' },
      tenant: { id: 't1', name: 'Acme' },
      accessToken: 'token_valid',
      isAuthenticated: true,
      bootstrapping: false,
      status: 'succeeded',
      error: null,
    });

    expect(screen.getByText(/Protected Dashboard Content/i)).toBeInTheDocument();
    expect(screen.queryByText(/Login Page Mock/i)).not.toBeInTheDocument();
  });
});
