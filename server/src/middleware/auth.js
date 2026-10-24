import { verifyAccessToken } from '../utils/tokens.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Authentication required: No bearer token provided'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.sub || !decoded.tenantId) {
      return next(ApiError.unauthorized('Invalid or expired access token'));
    }

    // Verify user exists and is active
    const user = await User.findById(decoded.sub).lean();
    if (!user) {
      return next(ApiError.unauthorized('User not found'));
    }

    if (!user.isActive) {
      return next(ApiError.forbidden('User account has been deactivated'));
    }

    // Attach authenticated user details
    req.user = {
      id: user._id.toString(),
      tenantId: user.tenantId.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default auth;
