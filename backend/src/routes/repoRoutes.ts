import { Router } from 'express';
import { connectRepo } from '../controllers/repoController';
import { getRepos } from '../controllers/authController';

const router = Router();
router.get('/', getRepos);
router.post('/connect', connectRepo);

export default router;
