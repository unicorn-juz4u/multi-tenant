import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';

export const listUsers = async ({ tenantId, page = 1, limit = 20, search = '', role = 'all' }) => {
  const query = { tenantId };

  if (role && role !== 'all') {
    query.role = role;
  }

  if (search && search.trim() !== '') {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { email: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, totalItems] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    items: users.map((u) => ({
      ...u,
      id: u._id.toString(),
      tenantId: u.tenantId.toString(),
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalPages,
      totalItems,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

export const getUserById = async ({ id, tenantId }) => {
  const user = await User.findOne({ _id: id, tenantId }).lean();
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return {
    ...user,
    id: user._id.toString(),
    tenantId: user.tenantId.toString(),
  };
};

export const createUser = async ({ tenantId, name, email, password, role, requester }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists within this tenant
  const existing = await User.findOne({ tenantId, email: normalizedEmail });
  if (existing) {
    throw ApiError.conflict('A user with this email already exists in this organization');
  }

  // Admins cannot create owners
  if (role === 'owner' && requester.role !== 'owner') {
    throw ApiError.forbidden('Only owners can assign owner role');
  }

  const passwordHash = await User.hashPassword(password);

  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: role || 'member',
    tenantId,
    isActive: true,
  });

  return {
    ...newUser.toJSON(),
    id: newUser._id.toString(),
    tenantId: newUser.tenantId.toString(),
  };
};

export const updateUser = async ({ id, tenantId, data, requester }) => {
  const user = await User.findOne({ _id: id, tenantId });
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Security checks:
  // Cannot modify owner unless requester is the owner
  if (user.role === 'owner' && requester.role !== 'owner') {
    throw ApiError.forbidden('Only the owner can modify owner account details');
  }

  // Admins cannot elevate anyone to owner
  if (data.role === 'owner' && requester.role !== 'owner') {
    throw ApiError.forbidden('Only owners can transfer or grant owner role');
  }

  if (data.name !== undefined) user.name = data.name.trim();
  if (data.role !== undefined) user.role = data.role;
  if (data.isActive !== undefined) {
    // Cannot deactivate owner
    if (user.role === 'owner' && data.isActive === false) {
      throw ApiError.badRequest('Tenant owner account cannot be deactivated');
    }
    user.isActive = data.isActive;
  }

  await user.save();

  // If user is deactivated, revoke their refresh tokens
  if (user.isActive === false) {
    await RefreshToken.deleteMany({ userId: user._id, tenantId });
  }

  return {
    ...user.toJSON(),
    id: user._id.toString(),
    tenantId: user.tenantId.toString(),
  };
};

export const deleteUser = async ({ id, tenantId, requester }) => {
  const user = await User.findOne({ _id: id, tenantId });
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Cannot delete tenant owner
  if (user.role === 'owner') {
    throw ApiError.badRequest('The tenant owner account cannot be deleted');
  }

  // Admin cannot delete other admins
  if (requester.role === 'admin' && user.role === 'admin') {
    throw ApiError.forbidden('Admins cannot delete other administrators');
  }

  // Revoke all tokens
  await RefreshToken.deleteMany({ userId: user._id, tenantId });
  await User.deleteOne({ _id: id, tenantId });

  return { id, message: 'User deleted successfully' };
};

export default {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
