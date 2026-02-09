import axios from 'axios';
import { ProjectAnalysis } from './analysisService';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import path from 'path';
import { getWorkspacePath } from '../utils/fileUtils';

const VERCEL_API_URL = 'https://api.vercel.com';

export class DeploymentStream extends EventEmitter {
    constructor() {
        super();
    }

    log(message: string) {
        this.emit('log', message);
    }

    success(url: string) {
        this.emit('success', url);
    }

    error(err: string) {
        this.emit('error', err);
    }
}

interface VercelFile {
    file: string;
    data: string;
    encoding?: 'base64';
}

export const deployToVercel = async (workspaceId: string, analysis: ProjectAnalysis): Promise<DeploymentStream> => {
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

const createDeployment = async (stream: DeploymentStream, workspaceId: string, analysis: ProjectAnalysis, token: string) => {
    try {
        stream.log("Initializing Vercel deployment...");

        const workspacePath = getWorkspacePath(workspaceId);
        stream.log(`Reading workspace content from ${workspaceId}...`);

        let files = await getAllFiles(workspacePath, workspacePath);

        // Check if vercel.json already exists in the project root
        const configPath = analysis.rootDirectory ? `${analysis.rootDirectory}/vercel.json` : 'vercel.json';
        const hasVercelConfig = files.some(f => f.file === configPath);

        // ... frameworkPreset logic ...
        // Determine framework preset
        let frameworkPreset: string | undefined = undefined;
        if (analysis.framework === 'Next.js') frameworkPreset = 'nextjs';
        else if (analysis.framework === 'Create React App') frameworkPreset = 'create-react-app';
        else if (analysis.framework === 'Vite') frameworkPreset = 'vite';
        else if (analysis.framework === 'Angular') frameworkPreset = 'angular';
        else if (analysis.framework === 'Vue') frameworkPreset = 'vuejs';
        else if (analysis.framework === 'Svelte') frameworkPreset = 'sveltekit'; // SvelteKit is the common preset
        else if (analysis.framework === 'Nuxt') frameworkPreset = 'nuxtjs';

        // Add default vercel.json for SPAs to handle client-side routing
        const spaFrameworks = ['Vite', 'Create React App', 'Vue', 'Angular', 'Svelte'];
        if (!hasVercelConfig && spaFrameworks.includes(analysis.framework)) {
            stream.log(`Adding default vercel.json for SPA routing at ${configPath}...`);

            const spaConfig = {
                rewrites: [{ source: "/(.*)", destination: "/index.html" }]
            };

            files.push({
                file: configPath,
                data: JSON.stringify(spaConfig, null, 2)
            });
        }

        stream.log(`Prepared ${files.length} files for upload.`);
        stream.log(`Project Analysis: ${analysis.framework} in ${analysis.rootDirectory || 'root'}`);
        stream.log(`Build Command: ${analysis.buildCommand || 'default'}`);
        stream.log(`Output Directory: ${analysis.outputDirectory || 'default'}`);

        const payload = {
            name: `ai-deploy-${workspaceId.substring(0, 8)}`,
            files,
            projectSettings: {
                framework: frameworkPreset,
                buildCommand: analysis.buildCommand || undefined,
                outputDirectory: analysis.outputDirectory || undefined,
                installCommand: analysis.installCommand || undefined,
                rootDirectory: analysis.rootDirectory || undefined
            },
            target: 'production'
        };

        stream.log("Sending deployment request to Vercel API...");

        const response = await axios.post(`${VERCEL_API_URL}/v13/deployments?skipAutoDetectionConfirmation=1`, payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const deploymentId = response.data.id;
        stream.log(`Deployment created: ${deploymentId}`);
        stream.log(`Inspect at: ${response.data.inspectorUrl}`);

        await pollDeployment(stream, deploymentId, token);

    } catch (error: any) {
        if (error.response) {
            console.error("Vercel API Error:", error.response.data);
            stream.error(`Vercel API Error: ${error.response.data.error?.message || error.message}`);
        } else {
            console.error("System Error:", error);
            stream.error(error.message);
        }
    }
};

const pollDeployment = async (stream: DeploymentStream, deploymentId: string, token: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes approx

    const check = async () => {
        if (attempts >= maxAttempts) {
            stream.error("Deployment timed out.");
            return;
        }

        try {
            const response = await axios.get(`${VERCEL_API_URL}/v13/deployments/${deploymentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { readyState, url, bootupBuildFeature } = response.data;
            stream.log(`Status: ${readyState}`);

            if (readyState === 'READY') {
                stream.log("Deployment Successful!");
                stream.success(`https://${url}`);
                return;
            } else if (readyState === 'ERROR' || readyState === 'CANCELED') {
                stream.error("Deployment failed on Vercel side.");
                return;
            } else {
                // BUILDING, INITIALIZING, ANALYZING
                attempts++;
                setTimeout(check, 2000);
            }
        } catch (error: any) {
            stream.error("Failed to poll deployment status");
        }
    };

    check();
};


const getAllFiles = async (dirPath: string, rootPath: string): Promise<VercelFile[]> => {
    let results: VercelFile[] = [];
    const list = await fs.readdir(dirPath);

    for (const file of list) {
        // Ignore node_modules, .git, etc
        if (file === 'node_modules' || file === '.git' || file === '.env' || file === '.next' || file === 'dist' || file === 'build') continue;

        const filePath = path.join(dirPath, file);
        const stat = await fs.stat(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(await getAllFiles(filePath, rootPath));
        } else {
            try {
                const relativePath = path.relative(rootPath, filePath).replace(/\\/g, '/');

                // Read as buffer to handle binary files
                const buffer = await fs.readFile(filePath);

                // Decide if we should use base64 (for binary) or utf8
                // For safety and simplicity, sending everything as base64 is robust
                results.push({
                    file: relativePath,
                    data: buffer.toString('base64'),
                    encoding: 'base64'
                });
            } catch (err) {
                console.warn(`Skipping file ${file}:`, err);
            }
        }
    }
    return results;
};

// --- SIMULATION (Fallback) ---
const simulateDeployment = (stream: DeploymentStream, analysis: ProjectAnalysis) => {
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
