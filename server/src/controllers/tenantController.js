import { asyncHandler } from '../utils/asyncHandler.js';
import tenantService from '../services/tenantService.js';

export const getTenant = asyncHandler(async (req, res) => {
  const tenant = await tenantService.getTenantDetails(req.tenantId);

  res.status(200).json({
    success: true,
    data: tenant,
  });
});

export const updateTenant = asyncHandler(async (req, res) => {
  const updatedTenant = await tenantService.updateTenantDetails(req.tenantId, req.body);

  res.status(200).json({
    success: true,
    message: 'Tenant settings updated successfully',
    data: updatedTenant,
  });
});

export default {
  getTenant,
  updateTenant,
};
