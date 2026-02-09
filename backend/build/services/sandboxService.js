"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sandbox = exports.SANDBOX_ROOT = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const uuid_1 = require("uuid");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
exports.SANDBOX_ROOT = path_1.default.resolve(process.cwd(), 'sandbox_workspaces');
const DOCKER_IMAGE = 'ai-deployment-sandbox';
const USE_DOCKER = false; // Forced to false for now based on environment issues, can toggle later
// Ensure sandbox root exists
fs_extra_1.default.ensureDirSync(exports.SANDBOX_ROOT);
class Sandbox {
    id;
    workspacePath;
    containerId = null;
    logs = [];
    isDestroyed = false;
    constructor() {
        this.id = (0, uuid_1.v4)();
        this.workspacePath = path_1.default.join(exports.SANDBOX_ROOT, this.id);
    }
    async init() {
        await fs_extra_1.default.ensureDir(this.workspacePath);
        this.log(`Initialized sandbox environment: ${this.id}`);
        if (USE_DOCKER) {
            // Docker implementation placeholder
            // Would involve `docker run -d -v ${this.workspacePath}:/app ${DOCKER_IMAGE}`
            try {
                const { stdout } = await execAsync(`docker run -d --rm -v "${this.workspacePath}:/app" ${DOCKER_IMAGE}`);
                this.containerId = stdout.trim();
                this.log(`Container started: ${this.containerId}`);
            }
            catch (e) {
                this.log(`Failed to start Docker container: ${e.message}`);
                throw e;
            }
        }
        else {
            this.log('Running in local isolation mode (Docker unavailable)');
        }
    }
    async cloneRepo(repoUrl) {
        this.log(`Cloning repository: ${repoUrl}`);
        try {
            // For GitHub OAuth tokens, we might need to inject credentials into URL
            // Assuming public or pre-authenticated URL for MVP
            await execAsync(`git clone ${repoUrl} .`, { cwd: this.workspacePath });
            this.log('Repository cloned successfully');
        }
        catch (error) {
            this.log(`Error cloning repository: ${error.message}`);
            throw error;
        }
    }
    async applyPatch(filePath, content) {
        this.log(`Applying patch to file: ${filePath}`);
        const fullPath = path_1.default.join(this.workspacePath, filePath);
        try {
            // Security check: ensure path is within workspace
            if (!fullPath.startsWith(this.workspacePath)) {
                throw new Error('Security Violation: Access outside sandbox denied');
            }
            // Create backup
            if (await fs_extra_1.default.pathExists(fullPath)) {
                await fs_extra_1.default.copy(fullPath, `${fullPath}.bak`);
            }
            await fs_extra_1.default.outputFile(fullPath, content);
            this.log(`File updated: ${filePath}`);
        }
        catch (error) {
            this.log(`Error patching file: ${error.message}`);
            throw error;
        }
    }
    async runBuild(command) {
        this.log(`Running build command: ${command}`);
        const startTime = Date.now();
        try {
            if (USE_DOCKER && this.containerId) {
                // Docker execution
                const { stdout, stderr } = await execAsync(`docker exec ${this.containerId} sh -c "${command}"`);
                this.log(stdout);
                if (stderr)
                    this.log(`[STDERR] ${stderr}`);
            }
            else {
                // Local fallback execution
                const { stdout, stderr } = await execAsync(command, { cwd: this.workspacePath });
                this.log(stdout);
                if (stderr)
                    this.log(`[STDERR] ${stderr}`);
            }
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            this.log(`Build completed in ${duration}s`);
            return true;
        }
        catch (error) {
            this.log(`Build failed: ${error.message}`);
            if (error.stdout)
                this.log(error.stdout);
            if (error.stderr)
                this.log(`[STDERR] ${error.stderr}`);
            return false;
        }
    }
    async destroy() {
        if (this.isDestroyed)
            return;
        this.log('Cleaning up sandbox resources...');
        if (USE_DOCKER && this.containerId) {
            try {
                await execAsync(`docker kill ${this.containerId}`);
            }
            catch (e) {
                // Ignore if container already gone
            }
        }
        try {
            await fs_extra_1.default.remove(this.workspacePath);
            this.log('Workspace deleted');
        }
        catch (e) {
            console.error(`Failed to cleanup workspace ${this.id}: ${e.message}`);
        }
        this.isDestroyed = true;
    }
    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[SANDBOX] ${message}`;
        this.logs.push(logEntry);
        console.log(logEntry);
    }
}
exports.Sandbox = Sandbox;
