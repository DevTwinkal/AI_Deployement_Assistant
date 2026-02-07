import fs from 'fs-extra';
import path from 'path';
import { getWorkspacePath } from '../utils/fileUtils';

export interface ProjectAnalysis {
    language: string;
    framework: string;
    installCommand: string;
    buildCommand: string;
    outputDirectory: string;
    envVars: string[];
}

export const analyzeProject = async (workspaceId: string): Promise<ProjectAnalysis> => {
    const workspacePath = getWorkspacePath(workspaceId);

    // Defaults
    const analysis: ProjectAnalysis = {
        language: 'Unknown',
        framework: 'Unknown',
        installCommand: '',
        buildCommand: '',
        outputDirectory: '.',
        envVars: []
    };

    // Check for Node.js
    if (await fs.pathExists(path.join(workspacePath, 'package.json'))) {
        analysis.language = 'Node.js';
        analysis.installCommand = 'npm install';

        try {
            const pkg = await fs.readJson(path.join(workspacePath, 'package.json'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            const scripts = pkg.scripts || {};

            // Framework Detection
            if (deps.next) {
                analysis.framework = 'Next.js';
                analysis.buildCommand = 'npm run build';
                analysis.outputDirectory = '.next';
            } else if (deps['react-scripts']) {
                analysis.framework = 'Create React App';
                analysis.buildCommand = 'npm run build';
                analysis.outputDirectory = 'build';
            } else if (deps.vite) {
                analysis.framework = 'Vite';
                analysis.buildCommand = 'npm run build';
                analysis.outputDirectory = 'dist';
            } else if (deps.express) {
                analysis.framework = 'Express';
                analysis.buildCommand = ''; // Often no build for basic express
                analysis.outputDirectory = '.';
            }

            // Heuristic for build command if generic node
            if (!analysis.buildCommand && scripts.build) {
                analysis.buildCommand = 'npm run build';
            }

        } catch (e) {
            console.error("Failed to parse package.json", e);
        }
    }
    // Check for Python
    else if (await fs.pathExists(path.join(workspacePath, 'requirements.txt'))) {
        analysis.language = 'Python';
        analysis.installCommand = 'pip install -r requirements.txt';

        const reqs = await fs.readFile(path.join(workspacePath, 'requirements.txt'), 'utf-8');

        if (reqs.includes('flask')) {
            analysis.framework = 'Flask';
        } else if (reqs.includes('django')) {
            analysis.framework = 'Django';
        } else if (reqs.includes('fastapi')) {
            analysis.framework = 'FastAPI';
        }
    }

    // Check for Docker
    if (await fs.pathExists(path.join(workspacePath, 'Dockerfile'))) {
        // Docker overrides others for deployment usually, but we'll just note it for now
        // analysis.framework = 'Docker'; 
    }

    return analysis;
};
