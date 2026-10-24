import { Router } from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { auth } from '../middleware/auth.js';
import { tenantScope } from '../middleware/tenantScope.js';

const router = Router();

router.use(auth, tenantScope);

router.get('/stats', dashboardController.getStats);

export default router;
