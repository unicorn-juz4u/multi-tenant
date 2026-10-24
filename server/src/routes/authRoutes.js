import { Router } from 'express';
import authController from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { tenantScope } from '../middleware/tenantScope.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { registerSchema, loginSchema } from '../utils/validationSchemas.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', auth, tenantScope, authController.getMe);

export default router;
