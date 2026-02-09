"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupWorkspace = exports.getWorkspacePath = exports.createTempWorkspace = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const uuid_1 = require("uuid");
const WORKSPACE_BASE = path_1.default.join(process.cwd(), 'workspaces');
// Ensure workspace directory exists
fs_extra_1.default.ensureDirSync(WORKSPACE_BASE);
const createTempWorkspace = async () => {
    const id = (0, uuid_1.v4)();
    const dirPath = path_1.default.join(WORKSPACE_BASE, id);
    await fs_extra_1.default.ensureDir(dirPath);
    return id;
};
exports.createTempWorkspace = createTempWorkspace;
const getWorkspacePath = (id) => {
    return path_1.default.join(WORKSPACE_BASE, id);
};
exports.getWorkspacePath = getWorkspacePath;
const cleanupWorkspace = async (id) => {
    const dirPath = (0, exports.getWorkspacePath)(id);
    if (await fs_extra_1.default.pathExists(dirPath)) {
        await fs_extra_1.default.remove(dirPath);
    }
};
exports.cleanupWorkspace = cleanupWorkspace;
