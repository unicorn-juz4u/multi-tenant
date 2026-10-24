import { Project } from '../models/Project.js';
import { ApiError } from '../utils/ApiError.js';

export const listProjects = async ({ tenantId, page = 1, limit = 10, search = '', status = 'all', sort = 'createdAt', order = 'desc' }) => {
  const query = { tenantId };

  if (status && status !== 'all') {
    query.status = status;
  }

  if (search && search.trim() !== '') {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  const sortDirection = order === 'asc' ? 1 : -1;
  const sortOptions = { [sort]: sortDirection };

  const skip = (page - 1) * limit;

  const [items, totalItems] = await Promise.all([
    Project.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email role')
      .lean(),
    Project.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    items: items.map((item) => ({
      ...item,
      id: item._id.toString(),
      tenantId: item.tenantId.toString(),
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

export const getProjectById = async ({ id, tenantId }) => {
  const project = await Project.findOne({ _id: id, tenantId })
    .populate('createdBy', 'name email role')
    .lean();

  if (!project) {
    // 404, not 403, to avoid leaking existence of cross-tenant resources
    throw ApiError.notFound('Project not found');
  }

  return {
    ...project,
    id: project._id.toString(),
    tenantId: project.tenantId.toString(),
  };
};

export const createProject = async ({ name, description, status, tenantId, createdBy }) => {
  const project = await Project.create({
    name,
    description: description || '',
    status: status || 'active',
    tenantId,
    createdBy,
  });

  const populated = await Project.findById(project._id)
    .populate('createdBy', 'name email role')
    .lean();

  return {
    ...populated,
    id: populated._id.toString(),
    tenantId: populated.tenantId.toString(),
  };
};

export const updateProject = async ({ id, tenantId, user, data }) => {
  // First verify project exists in tenant (returns 404 if not found)
  const existingProject = await Project.findOne({ _id: id, tenantId });
  if (!existingProject) {
    throw ApiError.notFound('Project not found');
  }

  // Permission check: members can only update their own projects
  if (user.role === 'member' && existingProject.createdBy.toString() !== user.id) {
    throw ApiError.forbidden('Members can only update projects they created');
  }

  if (data.name !== undefined) existingProject.name = data.name;
  if (data.description !== undefined) existingProject.description = data.description;
  if (data.status !== undefined) existingProject.status = data.status;

  await existingProject.save();

  const updated = await Project.findById(existingProject._id)
    .populate('createdBy', 'name email role')
    .lean();

  return {
    ...updated,
    id: updated._id.toString(),
    tenantId: updated.tenantId.toString(),
  };
};

export const deleteProject = async ({ id, tenantId, user }) => {
  const existingProject = await Project.findOne({ _id: id, tenantId });
  if (!existingProject) {
    throw ApiError.notFound('Project not found');
  }

  // Members cannot delete projects (only admin or owner)
  if (user.role === 'member') {
    throw ApiError.forbidden('Only administrators or owners can delete projects');
  }

  await Project.deleteOne({ _id: id, tenantId });
  return { id, message: 'Project deleted successfully' };
};

export default {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
