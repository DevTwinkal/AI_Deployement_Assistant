"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeProject = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const fileUtils_1 = require("../utils/fileUtils");
const analyzeProject = async (workspaceId) => {
    const workspacePath = (0, fileUtils_1.getWorkspacePath)(workspaceId);
    return await performAnalysis(workspacePath);
};
exports.analyzeProject = analyzeProject;
const performAnalysis = async (projectPath) => {
    // Defaults
    const analysis = {
        language: 'Unknown',
        framework: 'Unknown',
        installCommand: '',
        buildCommand: '',
        outputDirectory: '.',
        envVars: []
    };
    // Check for Node.js
    if (await fs_extra_1.default.pathExists(path_1.default.join(projectPath, 'package.json'))) {
        analysis.language = 'Node.js';
        analysis.installCommand = 'npm install';
        try {
            const pkg = await fs_extra_1.default.readJson(path_1.default.join(projectPath, 'package.json'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            const scripts = pkg.scripts || {};
            // Framework Detection
            if (deps.next) {
                analysis.framework = 'Next.js';
                analysis.buildCommand = 'npm run build';
                analysis.outputDirectory = '.next';
            }
            else if (deps['react-scripts']) {
                analysis.framework = 'Create React App';
                analysis.buildCommand = 'npm run build';
                analysis.outputDirectory = 'build';
            }
            else if (deps.vite) {
                analysis.framework = 'Vite';
                analysis.buildCommand = 'npm run build';
                analysis.outputDirectory = 'dist';
            }
            else if (deps.express) {
                analysis.framework = 'Express';
                analysis.buildCommand = ''; // Often no build for basic express
                analysis.outputDirectory = '.';
            }
            // Heuristic for build command if generic node
            if (!analysis.buildCommand && scripts.build) {
                analysis.buildCommand = 'npm run build';
            }
            return analysis;
        }
        catch (e) {
            console.error("Failed to parse package.json", e);
        }
    }
    // Check for Python
    else if (await fs_extra_1.default.pathExists(path_1.default.join(projectPath, 'requirements.txt'))) {
        analysis.language = 'Python';
        analysis.installCommand = 'pip install -r requirements.txt';
        const reqs = await fs_extra_1.default.readFile(path_1.default.join(projectPath, 'requirements.txt'), 'utf-8');
        if (reqs.includes('flask')) {
            analysis.framework = 'Flask';
        }
        else if (reqs.includes('django')) {
            analysis.framework = 'Django';
        }
        else if (reqs.includes('fastapi')) {
            analysis.framework = 'FastAPI';
        }
        return analysis;
    }
    // If nothing found at root, check subdirectories
    const subdirs = ['frontend', 'web', 'client', 'app', 'src'];
    for (const subdir of subdirs) {
        const subPath = path_1.default.join(projectPath, subdir);
        if (await fs_extra_1.default.pathExists(subPath) && (await fs_extra_1.default.stat(subPath)).isDirectory()) {
            const subAnalysis = await performAnalysis(subPath);
            if (subAnalysis.framework !== 'Unknown') {
                // If found in subdirectory, we need to adjust commands to run from root or tell Vercel
                // For Vercel API, it's easier to just return the analysis and we'll handle directory context in the deployment service
                // But for now, let's mark it as found and maybe prefix commands
                subAnalysis.installCommand = `cd ${subdir} && ${subAnalysis.installCommand}`;
                if (subAnalysis.buildCommand)
                    subAnalysis.buildCommand = `cd ${subdir} && ${subAnalysis.buildCommand}`;
                subAnalysis.outputDirectory = path_1.default.join(subdir, subAnalysis.outputDirectory).replace(/\\/g, '/');
                return subAnalysis;
            }
        }
    }
    return analysis;
};
