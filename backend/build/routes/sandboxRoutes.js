"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sandboxService_1 = require("../services/sandboxService");
const router = express_1.default.Router();
router.post('/start', async (req, res) => {
    // Explicitly cast req.body to any to avoid TS errors for now
    const { repoUrl } = req.body;
    if (!repoUrl) {
        return res.status(400).json({ error: 'Repo URL is required' });
    }
    try {
        const sandbox = new sandboxService_1.Sandbox();
        await sandbox.init();
        // Background process: clone and build
        // In a real app, we'd use a job queue
        (async () => {
            try {
                await sandbox.cloneRepo(repoUrl);
                // Mock build for now
                await sandbox.runBuild('echo "Sandbox initialized successfully"');
            }
            catch (e) {
                console.error(`Sandbox Error: ${e.message}`);
            }
            finally {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
