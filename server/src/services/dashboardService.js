import { Project } from '../models/Project.js';
import { User } from '../models/User.js';

export const getDashboardStats = async (tenantId, userId) => {
  const [
    totalProjects,
    planningProjects,
    activeProjects,
    completedProjects,
    onHoldProjects,
    archivedProjects,
    myProjectsCount,
    totalUsers,
    activeUsers,
    recentProjects,
  ] = await Promise.all([
    Project.countDocuments({ tenantId }),
    Project.countDocuments({ tenantId, status: 'planning' }),
    Project.countDocuments({ tenantId, status: 'active' }),
    Project.countDocuments({ tenantId, status: 'completed' }),
    Project.countDocuments({ tenantId, status: 'on_hold' }),
    Project.countDocuments({ tenantId, status: 'archived' }),
    Project.countDocuments({ tenantId, createdBy: userId }),
    User.countDocuments({ tenantId }),
    User.countDocuments({ tenantId, isActive: true }),
    Project.find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name email role')
      .lean(),
  ]);

  return {
    projects: {
      total: totalProjects,
      byStatus: {
        planning: planningProjects,
        active: activeProjects,
        completed: completedProjects,
        on_hold: onHoldProjects,
        archived: archivedProjects,
      },
      myProjectsCount,
    },
    users: {
      total: totalUsers,
      active: activeUsers,
    },
    recentProjects: recentProjects.map((p) => ({
      ...p,
      id: p._id.toString(),
      tenantId: p.tenantId.toString(),
    })),
  };
};

export default {
  getDashboardStats,
};
