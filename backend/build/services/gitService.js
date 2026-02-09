"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileStructure = exports.cloneRepository = void 0;
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const fileUtils_1 = require("../utils/fileUtils");
const execPromise = util_1.default.promisify(child_process_1.exec);
const cloneRepository = async (repoUrl, workspaceId) => {
    const workspacePath = (0, fileUtils_1.getWorkspacePath)(workspaceId);
    console.log(`Cloning ${repoUrl} into ${workspacePath}`);
    // Use git clone directly
    // Note: We clone into the directory specifically
    await execPromise(`git clone "${repoUrl}" .`, { cwd: workspacePath });
};
exports.cloneRepository = cloneRepository;
const getFileStructure = async (workspaceId, dir = '') => {
    const workspacePath = (0, fileUtils_1.getWorkspacePath)(workspaceId);
    // Placeholder for now
    return [];
};
exports.getFileStructure = getFileStructure;
