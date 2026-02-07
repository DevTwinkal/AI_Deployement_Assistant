import express from 'express';
import { Sandbox } from '../services/sandboxService';

const router: express.Router = express.Router();

router.post('/start', async (req: express.Request, res: express.Response): Promise<any> => {
    // Explicitly cast req.body to any to avoid TS errors for now
    const { repoUrl } = req.body as any;

    if (!repoUrl) {
        return res.status(400).json({ error: 'Repo URL is required' });
    }

    try {
        const sandbox = new Sandbox();
        await sandbox.init();

        // Background process: clone and build
        // In a real app, we'd use a job queue
        (async () => {
            try {
                await sandbox.cloneRepo(repoUrl);
                // Mock build for now
                await sandbox.runBuild('echo "Sandbox initialized successfully"');
            } catch (e: any) {
                console.error(`Sandbox Error: ${e.message}`);
            } finally {
                // For now, auto-destroy to keep it clean
                // In future, keep alive for user interaction
                await sandbox.destroy();
            }
        })();

        res.json({
            sandboxId: sandbox.id,
            status: 'initializing',
            message: 'Sandbox is being prepared'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
