import { exec } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import * as fileUtils from '../utils/fileUtils';

const execAsync = promisify(exec);

export const SANDBOX_ROOT = path.resolve(process.cwd(), 'sandbox_workspaces');
const DOCKER_IMAGE = 'ai-deployment-sandbox';
const USE_DOCKER = false; // Forced to false for now based on environment issues, can toggle later

// Ensure sandbox root exists
fs.ensureDirSync(SANDBOX_ROOT);

export class Sandbox {
    id: string;
    workspacePath: string;
    containerId: string | null = null;
    logs: string[] = [];
    isDestroyed: boolean = false;

    constructor() {
        this.id = uuidv4();
        this.workspacePath = path.join(SANDBOX_ROOT, this.id);
    }

    async init() {
        await fs.ensureDir(this.workspacePath);
        this.log(`Initialized sandbox environment: ${this.id}`);

        if (USE_DOCKER) {
            // Docker implementation placeholder
            // Would involve `docker run -d -v ${this.workspacePath}:/app ${DOCKER_IMAGE}`
            try {
                const { stdout } = await execAsync(`docker run -d --rm -v "${this.workspacePath}:/app" ${DOCKER_IMAGE}`);
                this.containerId = stdout.trim();
                this.log(`Container started: ${this.containerId}`);
            } catch (e: any) {
                this.log(`Failed to start Docker container: ${e.message}`);
                throw e;
            }
        } else {
            this.log('Running in local isolation mode (Docker unavailable)');
        }
    }

    async cloneRepo(repoUrl: string) {
        this.log(`Cloning repository: ${repoUrl}`);
        try {
            // For GitHub OAuth tokens, we might need to inject credentials into URL
            // Assuming public or pre-authenticated URL for MVP
            await execAsync(`git clone ${repoUrl} .`, { cwd: this.workspacePath });
            this.log('Repository cloned successfully');
        } catch (error: any) {
            this.log(`Error cloning repository: ${error.message}`);
            throw error;
        }
    }

    async applyPatch(filePath: string, content: string) {
        this.log(`Applying patch to file: ${filePath}`);
        const fullPath = path.join(this.workspacePath, filePath);

        try {
            // Security check: ensure path is within workspace
            if (!fullPath.startsWith(this.workspacePath)) {
                throw new Error('Security Violation: Access outside sandbox denied');
            }

            // Create backup
            if (await fs.pathExists(fullPath)) {
                await fs.copy(fullPath, `${fullPath}.bak`);
            }

            await fs.outputFile(fullPath, content);
            this.log(`File updated: ${filePath}`);
        } catch (error: any) {
            this.log(`Error patching file: ${error.message}`);
            throw error;
        }
    }

    async runBuild(command: string) {
        this.log(`Running build command: ${command}`);
        const startTime = Date.now();

        try {
            if (USE_DOCKER && this.containerId) {
                // Docker execution
                const { stdout, stderr } = await execAsync(`docker exec ${this.containerId} sh -c "${command}"`);
                this.log(stdout);
                if (stderr) this.log(`[STDERR] ${stderr}`);
            } else {
                // Local fallback execution
                const { stdout, stderr } = await execAsync(command, { cwd: this.workspacePath });
                this.log(stdout);
                if (stderr) this.log(`[STDERR] ${stderr}`);
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            this.log(`Build completed in ${duration}s`);
            return true;
        } catch (error: any) {
            this.log(`Build failed: ${error.message}`);
            if (error.stdout) this.log(error.stdout);
            if (error.stderr) this.log(`[STDERR] ${error.stderr}`);
            return false;
        }
    }

    async destroy() {
        if (this.isDestroyed) return;

        this.log('Cleaning up sandbox resources...');

        if (USE_DOCKER && this.containerId) {
            try {
                await execAsync(`docker kill ${this.containerId}`);
            } catch (e) {
                // Ignore if container already gone
            }
        }

        try {
            await fs.remove(this.workspacePath);
            this.log('Workspace deleted');
        } catch (e: any) {
            console.error(`Failed to cleanup workspace ${this.id}: ${e.message}`);
        }

        this.isDestroyed = true;
    }

    private log(message: string) {
        const timestamp = new Date().toISOString();
        const logEntry = `[SANDBOX] ${message}`;
        this.logs.push(logEntry);
        console.log(logEntry);
    }
}
