import { Router } from 'express';
import { connectRepo } from '../controllers/repoController';

const router = Router();

router.post('/connect', connectRepo);

export default router;
