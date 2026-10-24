import { asyncHandler } from '../utils/asyncHandler.js';
import projectService from '../services/projectService.js';

export const list = asyncHandler(async (req, res) => {
  const result = await projectService.listProjects({
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
  const project = await projectService.getProjectById({
    id: req.params.id,
    tenantId: req.tenantId,
  });

  res.status(200).json({
    success: true,
    data: project,
  });
});

export const create = asyncHandler(async (req, res) => {
  const project = await projectService.createProject({
    ...req.body,
    tenantId: req.tenantId,
    createdBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  });
});

export const update = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject({
    id: req.params.id,
    tenantId: req.tenantId,
    user: req.user,
    data: req.body,
  });

  res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    data: project,
  });
});

export const remove = asyncHandler(async (req, res) => {
  const result = await projectService.deleteProject({
    id: req.params.id,
    tenantId: req.tenantId,
    user: req.user,
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
