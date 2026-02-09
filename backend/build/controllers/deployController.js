"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerDeployment = void 0;
const vercelService_1 = require("../services/vercelService");
const triggerDeployment = async (req, res) => {
    const { workspaceId, analysis } = req.body;
    if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID required' });
    }
    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const stream = await (0, vercelService_1.deployToVercel)(workspaceId, analysis);
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
exports.triggerDeployment = triggerDeployment;
