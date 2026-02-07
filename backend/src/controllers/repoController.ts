import { Request, Response } from 'express';
import { createTempWorkspace, getWorkspacePath } from '../utils/fileUtils';
import { cloneRepository } from '../services/gitService';
import { analyzeProject } from '../services/analysisService';
import fs from 'fs-extra';
import path from 'path';

export const connectRepo = async (req: Request, res: Response) => {
    try {
        const { repoUrl } = req.body;

        if (!repoUrl) {
            return res.status(400).json({ error: 'Repo URL is required' });
        }

        const workspaceId = await createTempWorkspace();

        console.log(`Cloning ${repoUrl} to ${workspaceId}...`);
        await cloneRepository(repoUrl, workspaceId);

        // Analyze structure
        const analysis = await analyzeProject(workspaceId);
        const workspacePath = getWorkspacePath(workspaceId);
        const files = await fs.readdir(workspacePath);

        res.json({
            success: true,
            message: 'Repository connected successfully',
            workspaceId,
            analysis,
            files: files.slice(0, 20)
        });

    } catch (error: any) {
        console.error('Error connecting repo:', error);
        res.status(500).json({ error: error.message });
    }
};
