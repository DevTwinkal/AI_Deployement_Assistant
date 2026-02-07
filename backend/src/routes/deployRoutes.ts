import { Router } from 'express';
import { triggerDeployment } from '../controllers/deployController';

const router = Router();

router.post('/', triggerDeployment);

export default router;
