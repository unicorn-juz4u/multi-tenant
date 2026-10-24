import { Router } from 'express';
import projectController from '../controllers/projectController.js';
import { auth } from '../middleware/auth.js';
import { tenantScope } from '../middleware/tenantScope.js';
import { validate } from '../middleware/validate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
} from '../utils/validationSchemas.js';

const router = Router();

// All project routes require valid authentication and strict tenant scoping
router.use(auth, tenantScope);

router.get('/', validate(projectQuerySchema), projectController.list);
router.post('/', validate(createProjectSchema), projectController.create);
router.get('/:id', projectController.getById);
router.patch('/:id', validate(updateProjectSchema), projectController.update);
router.delete('/:id', projectController.remove);

export default router;
