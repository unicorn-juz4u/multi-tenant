import { asyncHandler } from '../utils/asyncHandler.js';
import dashboardService from '../services/dashboardService.js';

export const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.tenantId, req.user.id);

  res.status(200).json({
    success: true,
    data: stats,
  });
});

export default {
  getStats,
};
