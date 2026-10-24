import { ApiError } from '../utils/ApiError.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`Forbidden: Access requires one of the following roles: [${allowedRoles.join(', ')}]`)
      );
    }

    next();
  };
};

export default requireRole;
