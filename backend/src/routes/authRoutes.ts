import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

router.get('/github', (req, res, next) => {
    // Explicitly handle request/response
    authController.login(req, res);
});
router.get('/github/callback', (req, res, next) => {
    authController.callback(req, res);
});
router.get('/logout', (req, res, next) => {
    authController.logout(req, res);
});
router.get('/me', (req, res, next) => {
    authController.getMe(req, res);
});
router.get('/repos', (req, res, next) => {
    authController.getRepos(req, res);
});

export default router;
