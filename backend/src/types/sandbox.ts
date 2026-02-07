export class SandboxError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'SandboxError';
    }
}

export interface DeploymentConfig {
    repoUrl: string;
    branch?: string;
    buildCommand: string;
    outputDir: string;
    env?: Record<string, string>;
}

export interface SandboxResult {
    success: boolean;
    logs: string[];
    artifactPath?: string;
    error?: string;
}
