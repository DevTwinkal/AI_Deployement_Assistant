import { exec } from 'child_process';
import util from 'util';
import { getWorkspacePath } from '../utils/fileUtils';
import path from 'path';

const execPromise = util.promisify(exec);

export const cloneRepository = async (repoUrl: string, workspaceId: string): Promise<void> => {
    const workspacePath = getWorkspacePath(workspaceId);
    console.log(`Cloning ${repoUrl} into ${workspacePath}`);
    // Use git clone directly
    // Note: We clone into the directory specifically
    await execPromise(`git clone "${repoUrl}" .`, { cwd: workspacePath });
};

export const getFileStructure = async (workspaceId: string, dir: string = ''): Promise<any> => {
    const workspacePath = getWorkspacePath(workspaceId);
    // Placeholder for now
    return [];
};
