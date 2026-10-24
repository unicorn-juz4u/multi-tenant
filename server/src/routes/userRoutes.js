import { Router } from 'express';
import userController from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';
import { tenantScope } from '../middleware/tenantScope.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '../utils/validationSchemas.js';

const router = Router();

// User management endpoints require admin or owner permissions and tenant scoping
router.use(auth, tenantScope, requireRole('admin', 'owner'));

router.get('/', userController.list);
router.post('/', validate(createUserSchema), userController.create);
router.get('/:id', userController.getById);
router.patch('/:id', validate(updateUserSchema), userController.update);
router.delete('/:id', userController.remove);

export default router;
