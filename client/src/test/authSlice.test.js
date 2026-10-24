import { describe, it, expect } from 'vitest';
import authReducer, {
  tokenRefreshed,
  resetStore,
  clearAuthError,
} from '../features/auth/authSlice.js';
import { login, logout, bootstrapAuth } from '../features/auth/authThunks.js';

describe('authSlice reducer', () => {
  const initialState = {
    user: null,
    tenant: null,
    accessToken: null,
    isAuthenticated: false,
    bootstrapping: true,
    status: 'idle',
    error: null,
  };

  it('should return the initial state on unknown action', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle tokenRefreshed', () => {
    const payload = {
      accessToken: 'mock_access_token_123',
      user: { id: 'u1', name: 'Alice', email: 'alice@acme.test', role: 'owner' },
      tenant: { id: 't1', name: 'Acme Corp', slug: 'acme-corp' },
    };

    const nextState = authReducer(initialState, tokenRefreshed(payload));
    expect(nextState.accessToken).toBe('mock_access_token_123');
    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.user.name).toBe('Alice');
    expect(nextState.tenant.name).toBe('Acme Corp');
  });

  it('should handle resetStore', () => {
    const activeState = {
      user: { id: 'u1', name: 'Alice' },
      tenant: { id: 't1', name: 'Acme' },
      accessToken: 'token',
      isAuthenticated: true,
      bootstrapping: false,
      status: 'succeeded',
      error: null,
    };

    const nextState = authReducer(activeState, resetStore());
    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
    expect(nextState.tenant).toBeNull();
    expect(nextState.accessToken).toBeNull();
  });

  it('should handle login.fulfilled', () => {
    const payload = {
      accessToken: 'token_abc',
      user: { id: 'u1', name: 'Bob', role: 'member' },
      tenant: { id: 't2', name: 'Globex' },
    };

    const action = { type: login.fulfilled.type, payload };
    const nextState = authReducer(initialState, action);

    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.status).toBe('succeeded');
    expect(nextState.accessToken).toBe('token_abc');
    expect(nextState.user.role).toBe('member');
  });

  it('should handle logout.fulfilled', () => {
    const activeState = {
      user: { id: 'u1', name: 'Alice' },
      tenant: { id: 't1' },
      accessToken: 'token',
      isAuthenticated: true,
      bootstrapping: false,
      status: 'succeeded',
      error: null,
    };

    const action = { type: logout.fulfilled.type };
    const nextState = authReducer(activeState, action);

    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
    expect(nextState.accessToken).toBeNull();
  });

  it('should handle bootstrapAuth.fulfilled', () => {
    const payload = {
      accessToken: 'bootstrap_token',
      user: { id: 'u1', name: 'Alice' },
      tenant: { id: 't1' },
    };

    const action = { type: bootstrapAuth.fulfilled.type, payload };
    const nextState = authReducer(initialState, action);

    expect(nextState.bootstrapping).toBe(false);
    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.accessToken).toBe('bootstrap_token');
  });

  it('should handle bootstrapAuth.rejected', () => {
    const action = { type: bootstrapAuth.rejected.type };
    const nextState = authReducer(initialState, action);

    expect(nextState.bootstrapping).toBe(false);
    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
  });
});
