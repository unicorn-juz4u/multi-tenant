import { asyncHandler } from '../utils/asyncHandler.js';
import { getRefreshCookieOptions, getClearCookieOptions } from '../utils/tokens.js';
import authService from '../services/authService.js';
import { ApiError } from '../utils/ApiError.js';

export const register = asyncHandler(async (req, res) => {
  const { tenantName, name, email, password } = req.body;
  const result = await authService.registerTenantAndOwner({
    tenantName,
    name,
    email,
    password,
  });

  res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

  res.status(201).json({
    success: true,
    message: 'Tenant and account created successfully',
    data: {
      user: result.user,
      tenant: result.tenant,
      accessToken: result.accessToken,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      tenant: result.tenant,
      accessToken: result.accessToken,
    },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) {
    throw ApiError.unauthorized('Refresh token missing from cookies');
  }

  const result = await authService.refreshSession(rawRefreshToken);

  res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      user: result.user,
      tenant: result.tenant,
      accessToken: result.accessToken,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (rawRefreshToken) {
    await authService.logout(rawRefreshToken);
  }

  res.clearCookie('refreshToken', getClearCookieOptions());
  res.clearCookie('refreshToken', { ...getClearCookieOptions(), path: '/' });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getCurrentUserAndTenant(req.user.id, req.tenantId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export default {
  register,
  login,
  refresh,
  logout,
  getMe,
};
