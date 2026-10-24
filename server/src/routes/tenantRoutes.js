import { Router } from 'express';
import tenantController from '../controllers/tenantController.js';
import { auth } from '../middleware/auth.js';
import { tenantScope } from '../middleware/tenantScope.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { updateTenantSchema } from '../utils/validationSchemas.js';

const router = Router();

router.use(auth, tenantScope);

router.get('/', tenantController.getTenant);
router.patch('/', requireRole('owner'), validate(updateTenantSchema), tenantController.updateTenant);

export default router;
