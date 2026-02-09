"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SandboxError = void 0;
class SandboxError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'SandboxError';
    }
}
exports.SandboxError = SandboxError;
