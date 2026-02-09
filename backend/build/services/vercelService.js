"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployToVercel = exports.DeploymentStream = void 0;
const axios_1 = __importDefault(require("axios"));
const events_1 = require("events");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const fileUtils_1 = require("../utils/fileUtils");
const VERCEL_API_URL = 'https://api.vercel.com';
class DeploymentStream extends events_1.EventEmitter {
    constructor() {
        super();
    }
    log(message) {
        this.emit('log', message);
    }
    success(url) {
        this.emit('success', url);
    }
    error(err) {
        this.emit('error', err);
    }
}
exports.DeploymentStream = DeploymentStream;
const deployToVercel = async (workspaceId, analysis) => {
    const stream = new DeploymentStream();
    const token = process.env.VERCEL_TOKEN;
    if (!token) {
        stream.log("No VERCEL_TOKEN found. Falling back to simulation mode.");
        simulateDeployment(stream, analysis);
        return stream;
    }
    // Call the real deployment function async so we return the stream immediately
    createDeployment(stream, workspaceId, analysis, token).catch(err => {
        console.error("Deployment Error:", err);
        stream.error(err.message || 'Deployment failed');
    });
    return stream;
};
exports.deployToVercel = deployToVercel;
const createDeployment = async (stream, workspaceId, analysis, token) => {
    try {
        stream.log("Initializing Vercel deployment...");
        const workspacePath = (0, fileUtils_1.getWorkspacePath)(workspaceId);
        stream.log(`Reading workspace content from ${workspaceId}...`);
        let files = await getAllFiles(workspacePath, workspacePath);
        // Check if vercel.json already exists
        const hasVercelConfig = files.some(f => f.file === 'vercel.json');
        // Determine framework preset
        let frameworkPreset = undefined;
        if (analysis.framework === 'Next.js')
            frameworkPreset = 'nextjs';
        else if (analysis.framework === 'Create React App')
            frameworkPreset = 'create-react-app';
        else if (analysis.framework === 'Vite')
            frameworkPreset = 'vite';
        // Add default vercel.json for SPAs to handle client-side routing
        if (!hasVercelConfig && (analysis.framework === 'Vite' || analysis.framework === 'Create React App')) {
            stream.log("Adding default vercel.json for SPA routing...");
            // If the project is in a subdirectory, the rewrite destination needs to point to the index.html location
            // However, usually Vercel build command outputs to outputDirectory, 
            // and the rewrite should be relative to the deployment root.
            // For SPAs, Vercel's documentation recommends:
            const spaConfig = {
                rewrites: [{ source: "/(.*)", destination: "/index.html" }]
            };
            files.push({
                file: 'vercel.json',
                data: JSON.stringify(spaConfig, null, 2)
            });
        }
        stream.log(`Prepared ${files.length} files for upload.`);
        const payload = {
            name: `ai-deploy-${workspaceId.substring(0, 8)}`,
            files,
            projectSettings: {
                framework: frameworkPreset,
                buildCommand: analysis.buildCommand || undefined,
                outputDirectory: analysis.outputDirectory || undefined,
                installCommand: analysis.installCommand || undefined
            },
            target: 'production'
        };
        stream.log("Sending deployment request to Vercel API...");
        const response = await axios_1.default.post(`${VERCEL_API_URL}/v13/deployments?skipAutoDetectionConfirmation=1`, payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const deploymentId = response.data.id;
        stream.log(`Deployment created: ${deploymentId}`);
        stream.log(`Inspect at: ${response.data.inspectorUrl}`);
        await pollDeployment(stream, deploymentId, token);
    }
    catch (error) {
        if (error.response) {
            console.error("Vercel API Error:", error.response.data);
            stream.error(`Vercel API Error: ${error.response.data.error?.message || error.message}`);
        }
        else {
            console.error("System Error:", error);
            stream.error(error.message);
        }
    }
};
const pollDeployment = async (stream, deploymentId, token) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes approx
    const check = async () => {
        if (attempts >= maxAttempts) {
            stream.error("Deployment timed out.");
            return;
        }
        try {
            const response = await axios_1.default.get(`${VERCEL_API_URL}/v13/deployments/${deploymentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { readyState, url, bootupBuildFeature } = response.data;
            stream.log(`Status: ${readyState}`);
            if (readyState === 'READY') {
                stream.log("Deployment Successful!");
                stream.success(`https://${url}`);
                return;
            }
            else if (readyState === 'ERROR' || readyState === 'CANCELED') {
                stream.error("Deployment failed on Vercel side.");
                return;
            }
            else {
                // BUILDING, INITIALIZING, ANALYZING
                attempts++;
                setTimeout(check, 2000);
            }
        }
        catch (error) {
            stream.error("Failed to poll deployment status");
        }
    };
    check();
};
const getAllFiles = async (dirPath, rootPath) => {
    let results = [];
    const list = await fs_extra_1.default.readdir(dirPath);
    for (const file of list) {
        // Ignore node_modules, .git, etc
        if (file === 'node_modules' || file === '.git' || file === '.env' || file === '.next' || file === 'dist' || file === 'build')
            continue;
        const filePath = path_1.default.join(dirPath, file);
        const stat = await fs_extra_1.default.stat(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(await getAllFiles(filePath, rootPath));
        }
        else {
            try {
                const relativePath = path_1.default.relative(rootPath, filePath).replace(/\\/g, '/');
                // Read as buffer to handle binary files
                const buffer = await fs_extra_1.default.readFile(filePath);
                // Decide if we should use base64 (for binary) or utf8
                // For safety and simplicity, sending everything as base64 is robust
                results.push({
                    file: relativePath,
                    data: buffer.toString('base64'),
                    encoding: 'base64'
                });
            }
            catch (err) {
                console.warn(`Skipping file ${file}:`, err);
            }
        }
    }
    return results;
};
// --- SIMULATION (Fallback) ---
const simulateDeployment = (stream, analysis) => {
    const steps = [
        { msg: 'Initializing build container...', delay: 1000 },
        { msg: 'Cloning repository from secure workspace...', delay: 1500 },
        { msg: `Detected ${analysis.framework} framework. Applying configuration...`, delay: 2000 },
        { msg: 'Installing dependencies...', delay: 800 },
        { msg: '> npm install', delay: 500 },
        { msg: 'added 142 packages in 4s', delay: 2500 },
        { msg: `Running build command: ${analysis.buildCommand}...`, delay: 1000 },
        { msg: '> vite build', delay: 600 },
        { msg: 'vite v5.0.0 building for production...', delay: 2000 },
        { msg: 'rendering chunks...', delay: 1500 },
        { msg: 'computing gzip size...', delay: 800 },
        { msg: 'dist/index.html   0.45 kB', delay: 200 },
        { msg: 'dist/assets/index.js 145.20 kB', delay: 200 },
        { msg: 'Build completed successfully.', delay: 1000 },
        { msg: 'Uploading artifacts to Vercel Edge Network...', delay: 1500 },
        { msg: 'Finalizing deployment...', delay: 1000 }
    ];
    let cumulativeDelay = 0;
    steps.forEach(step => {
        cumulativeDelay += step.delay;
        setTimeout(() => stream.log(step.msg), cumulativeDelay);
    });
    setTimeout(() => {
        stream.success(`https://${analysis.framework.toLowerCase().replace(/\s/g, '')}-app-demo.vercel.app`);
    }, cumulativeDelay + 1000);
};
