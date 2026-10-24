import { RefreshToken } from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/tokens.js';
import { ApiError } from '../utils/ApiError.js';

export const createSession = async (user) => {
  const payload = {
    sub: user._id.toString(),
    tenantId: user.tenantId.toString(),
    role: user.role,
    email: user.email,
  };

  const accessToken = generateAccessToken(payload);
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await RefreshToken.create({
    userId: user._id,
    tenantId: user.tenantId,
    tokenHash,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
  };
};

export const rotateRefreshToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) {
    throw ApiError.unauthorized('Refresh token is required');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const existingToken = await RefreshToken.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!existingToken) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  // Revoke the used refresh token immediately (rotation)
  await RefreshToken.findByIdAndDelete(existingToken._id);

  // Issue new pair
  const newRawRefreshToken = generateRefreshToken();
  const newTokenHash = hashToken(newRawRefreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    userId: existingToken.userId,
    tenantId: existingToken.tenantId,
    tokenHash: newTokenHash,
    expiresAt,
  });

  return {
    userId: existingToken.userId,
    tenantId: existingToken.tenantId,
    newRefreshToken: newRawRefreshToken,
  };
};

export const revokeRefreshToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  await RefreshToken.deleteOne({ tokenHash });
};

export const revokeAllUserTokens = async (userId, tenantId) => {
  await RefreshToken.deleteMany({ userId, tenantId });
};

export default {
  createSession,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
