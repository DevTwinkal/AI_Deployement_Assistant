import { Request, Response } from 'express';
import { deployToVercel } from '../services/vercelService';

export const triggerDeployment = async (req: Request, res: Response) => {
    const { workspaceId, analysis } = req.body;

    if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID required' });
    }

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await deployToVercel(workspaceId, analysis);

    stream.on('log', (msg) => {
        res.write(`data: ${JSON.stringify({ type: 'log', message: msg })}\n\n`);
    });

    stream.on('success', (url) => {
        res.write(`data: ${JSON.stringify({ type: 'success', url })}\n\n`);
        res.end();
    });

    stream.on('error', (err) => {
        res.write(`data: ${JSON.stringify({ type: 'error', message: err })}\n\n`);
        res.end();
    });
};
