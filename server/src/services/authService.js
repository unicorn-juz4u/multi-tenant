import crypto from 'crypto';
import { Tenant } from '../models/Tenant.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { generateAccessToken } from '../utils/tokens.js';
import tokenService from './tokenService.js';

export const registerTenantAndOwner = async ({ tenantName, name, email, password }) => {
  // Generate a URL-friendly slug from tenantName
  let baseSlug = tenantName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  if (!baseSlug) baseSlug = 'tenant';

  let slug = baseSlug;
  let collision = await Tenant.findOne({ slug });
  if (collision) {
    slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
  }

  // Create Tenant
  const tenant = await Tenant.create({
    name: tenantName.trim(),
    slug,
    plan: 'free',
  });

  // Hash password with bcrypt cost 12
  const passwordHash = await User.hashPassword(password);

  // Check if email already exists in this tenant (compound unique index)
  const existingUser = await User.findOne({ tenantId: tenant._id, email: email.toLowerCase() });
  if (existingUser) {
    throw ApiError.conflict('A user with this email already exists in this organization');
  }

  // Create Owner user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role: 'owner',
    tenantId: tenant._id,
    isActive: true,
  });

  // Create session and tokens
  const { accessToken, refreshToken } = await tokenService.createSession(user);

  return {
    user: user.toJSON(),
    tenant: tenant.toJSON(),
    accessToken,
    refreshToken,
  };
};

export const login = async ({ email, password }) => {
  // Generic error message to prevent user enumeration
  const invalidCredentialsError = ApiError.unauthorized('Invalid credentials');

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  if (!user || !user.isActive) {
    throw invalidCredentialsError;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw invalidCredentialsError;
  }

  const tenant = await Tenant.findById(user.tenantId);
  if (!tenant) {
    throw invalidCredentialsError;
  }

  const { accessToken, refreshToken } = await tokenService.createSession(user);

  return {
    user: user.toJSON(),
    tenant: tenant.toJSON(),
    accessToken,
    refreshToken,
  };
};

export const refreshSession = async (rawRefreshToken) => {
  const { userId, tenantId, newRefreshToken } = await tokenService.rotateRefreshToken(rawRefreshToken);

  const user = await User.findOne({ _id: userId, tenantId }).lean();
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid or inactive user session');
  }

  const tenant = await Tenant.findById(tenantId).lean();
  if (!tenant) {
    throw ApiError.unauthorized('Tenant not found');
  }

  const newAccessToken = generateAccessToken({
    sub: user._id.toString(),
    tenantId: user.tenantId.toString(),
    role: user.role,
    email: user.email,
  });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId.toString(),
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
    tenant: {
      id: tenant._id.toString(),
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      createdAt: tenant.createdAt,
    },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (rawRefreshToken) => {
  await tokenService.revokeRefreshToken(rawRefreshToken);
};

export const getCurrentUserAndTenant = async (userId, tenantId) => {
  const user = await User.findOne({ _id: userId, tenantId });
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw ApiError.notFound('Tenant not found');
  }

  return {
    user: user.toJSON(),
    tenant: tenant.toJSON(),
  };
};

export default {
  registerTenantAndOwner,
  login,
  refreshSession,
  logout,
  getCurrentUserAndTenant,
};
