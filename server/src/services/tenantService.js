import { Tenant } from '../models/Tenant.js';
import { ApiError } from '../utils/ApiError.js';

export const getTenantDetails = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId).lean();
  if (!tenant) {
    throw ApiError.notFound('Tenant not found');
  }

  return {
    ...tenant,
    id: tenant._id.toString(),
  };
};

export const updateTenantDetails = async (tenantId, { name, plan }) => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw ApiError.notFound('Tenant not found');
  }

  if (name !== undefined) tenant.name = name.trim();
  if (plan !== undefined) tenant.plan = plan;

  await tenant.save();

  return {
    ...tenant.toJSON(),
    id: tenant._id.toString(),
  };
};

export default {
  getTenantDetails,
  updateTenantDetails,
};
