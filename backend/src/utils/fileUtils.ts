import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

const WORKSPACE_BASE = path.join(process.cwd(), 'workspaces');

// Ensure workspace directory exists
fs.ensureDirSync(WORKSPACE_BASE);

export const createTempWorkspace = async (): Promise<string> => {
    const id = uuidv4();
    const dirPath = path.join(WORKSPACE_BASE, id);
    await fs.ensureDir(dirPath);
    return id;
};

export const getWorkspacePath = (id: string): string => {
    return path.join(WORKSPACE_BASE, id);
};

export const cleanupWorkspace = async (id: string): Promise<void> => {
    const dirPath = getWorkspacePath(id);
    if (await fs.pathExists(dirPath)) {
        await fs.remove(dirPath);
    }
};
