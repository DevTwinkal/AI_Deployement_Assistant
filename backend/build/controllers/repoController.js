"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRepo = void 0;
const fileUtils_1 = require("../utils/fileUtils");
const gitService_1 = require("../services/gitService");
const analysisService_1 = require("../services/analysisService");
const fs_extra_1 = __importDefault(require("fs-extra"));
const connectRepo = async (req, res) => {
    try {
        const { repoUrl } = req.body;
        if (!repoUrl) {
            return res.status(400).json({ error: 'Repo URL is required' });
        }
        const workspaceId = await (0, fileUtils_1.createTempWorkspace)();
        console.log(`Cloning ${repoUrl} to ${workspaceId}...`);
        await (0, gitService_1.cloneRepository)(repoUrl, workspaceId);
        // Analyze structure using service
        const analysis = await (0, analysisService_1.analyzeProject)(workspaceId);
        // Get file list for UI
        const workspacePath = (0, fileUtils_1.getWorkspacePath)(workspaceId);
        const files = await fs_extra_1.default.readdir(workspacePath);
        res.json({
            success: true,
            message: 'Repository connected successfully',
            workspaceId,
            analysis, // Return full analysis object
            files: files.slice(0, 20)
        });
    }
    catch (error) {
        console.error('Error connecting repo:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.connectRepo = connectRepo;
