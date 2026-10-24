import { asyncHandler } from '../utils/asyncHandler.js';
import userService from '../services/userService.js';

export const list = asyncHandler(async (req, res) => {
  const result = await userService.listUsers({
    tenantId: req.tenantId,
    ...req.query,
  });

  res.status(200).json({
    success: true,
    data: result.items,
    pagination: result.pagination,
  });
});

export const getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById({
    id: req.params.id,
    tenantId: req.tenantId,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser({
    tenantId: req.tenantId,
    requester: req.user,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
});

export const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser({
    id: req.params.id,
    tenantId: req.tenantId,
    requester: req.user,
    data: req.body,
  });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

export const remove = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser({
    id: req.params.id,
    tenantId: req.tenantId,
    requester: req.user,
  });

  res.status(200).json({
    success: true,
    message: result.message,
    data: { id: result.id },
  });
});

export default {
  list,
  getById,
  create,
  update,
  remove,
};
