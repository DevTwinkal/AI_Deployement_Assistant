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
const performAnalysis = async (projectPath, depth = 0) => {
    // Limits depth to avoid infinite recursion or searching too deep
    if (depth > 3)
        return {
            language: 'Unknown',
            framework: 'Unknown',
            installCommand: '',
            buildCommand: '',
            outputDirectory: '.',
            envVars: []
        };
    // Defaults
    let analysis = {
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
        // Detect package manager
        if (await fs_extra_1.default.pathExists(path_1.default.join(projectPath, 'yarn.lock'))) {
            analysis.packageManager = 'yarn';
            analysis.installCommand = 'yarn install';
        }
        else if (await fs_extra_1.default.pathExists(path_1.default.join(projectPath, 'pnpm-lock.yaml'))) {
            analysis.packageManager = 'pnpm';
            analysis.installCommand = 'pnpm install';
        }
        else {
            analysis.packageManager = 'npm';
            analysis.installCommand = 'npm install';
        }
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
            else if (deps['@angular/core']) {
                analysis.framework = 'Angular';
                analysis.buildCommand = 'npm run build';
                analysis.outputDirectory = 'dist';
            }
            else if (deps.vue || deps['@vue/cli-service']) {
                analysis.framework = 'Vue';
                analysis.buildCommand = scripts.build ? 'npm run build' : '';
                analysis.outputDirectory = 'dist';
            }
            else if (deps.svelte || deps['@sveltejs/kit']) {
                analysis.framework = 'Svelte';
                analysis.buildCommand = scripts.build ? 'npm run build' : '';
                analysis.outputDirectory = deps['@sveltejs/kit'] ? '.svelte-kit' : 'dist';
            }
            else if (deps.nuxt) {
                analysis.framework = 'Nuxt';
                analysis.buildCommand = 'npm run build';
                analysis.outputDirectory = '.output';
            }
            else if (deps.express) {
                analysis.framework = 'Express';
                analysis.buildCommand = '';
                analysis.outputDirectory = '.';
            }
            // Heuristic for build command if generic node
            if (!analysis.buildCommand && scripts.build) {
                analysis.buildCommand = 'npm run build';
            }
            // If we found a solid framework, return it immediately
            if (analysis.framework !== 'Unknown' && analysis.framework !== 'Express') {
                return analysis;
            }
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
        const lowerReqs = reqs.toLowerCase();
        if (lowerReqs.includes('flask')) {
            analysis.framework = 'Flask';
        }
        else if (lowerReqs.includes('django')) {
            analysis.framework = 'Django';
        }
        else if (lowerReqs.includes('fastapi')) {
            analysis.framework = 'FastAPI';
        }
        // Return if it's a specific python framework
        if (analysis.framework !== 'Unknown')
            return analysis;
    }
    // Search in subdirectories if we haven't found a strong framework yet
    const subdirs = ['frontend', 'web', 'client', 'app', 'src', 'ui', 'website'];
    for (const subdir of subdirs) {
        const subPath = path_1.default.join(projectPath, subdir);
        if (await fs_extra_1.default.pathExists(subPath) && (await fs_extra_1.default.stat(subPath)).isDirectory()) {
            const subAnalysis = await performAnalysis(subPath, depth + 1);
            if (subAnalysis.framework !== 'Unknown' && subAnalysis.framework !== 'Express') {
                // Set root directory relative to the current projectPath
                subAnalysis.rootDirectory = depth === 0 ? subdir : path_1.default.join(path_1.default.dirname(subAnalysis.rootDirectory || ''), subdir).replace(/\\/g, '/');
                return subAnalysis;
            }
            // If it's the first depth and we didn't find a framework, but we found something (like Express), 
            // maybe keep it as a fallback if nothing better is found in other subdirs.
            if (depth === 0 && subAnalysis.language !== 'Unknown') {
                analysis = {
                    ...subAnalysis,
                    rootDirectory: subdir
                };
            }
        }
    }
    return analysis;
};
