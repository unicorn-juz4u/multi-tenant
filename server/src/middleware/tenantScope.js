import { ApiError } from '../utils/ApiError.js';

export const tenantScope = (req, res, next) => {
  if (!req.user || !req.user.tenantId) {
    return next(ApiError.unauthorized('Tenant context missing from verified token'));
  }

  // Strictly bind tenantId from authenticated JWT
  req.tenantId = req.user.tenantId;

  // Sanitize input: Client should never be able to spoof or override tenantId
  if (req.body && typeof req.body === 'object') {
    delete req.body.tenantId;
  }
  if (req.query && typeof req.query === 'object') {
    delete req.query.tenantId;
  }
  if (req.params && typeof req.params === 'object') {
    delete req.params.tenantId;
  }

  next();
};

export default tenantScope;
