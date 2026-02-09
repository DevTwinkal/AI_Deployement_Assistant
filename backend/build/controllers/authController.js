"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepos = exports.getMe = exports.logout = exports.callback = exports.login = void 0;
const githubService = __importStar(require("../services/githubService"));
// Extend session to include token
require("express-session");
const login = (req, res) => {
    const url = githubService.getAuthUrl();
    console.log('Redirecting to GitHub Auth:', url);
    res.redirect(url);
};
exports.login = login;
const callback = async (req, res) => {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Missing code' });
    }
    try {
        const tokenData = await githubService.getAccessToken(code);
        if (tokenData.error) {
            console.error('GitHub Access Token Error:', tokenData.error_description);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=github_auth_failed`);
        }
        req.session.token = tokenData.access_token;
        // Fetch user details immediately to store in session (optional but good for debugging)
        const user = await githubService.getUser(tokenData.access_token);
        req.session.user = user;
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=session_error`);
            }
            // Dynamic redirect to keep origin consistent with where the user came from
            const origin = req.get('origin') || req.get('referer');
            let frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
            if (origin) {
                try {
                    const url = new URL(origin);
                    frontendBase = `${url.protocol}//${url.host}`;
                }
                catch (e) {
                    // Ignore invalid urls
                }
            }
            res.redirect(`${frontendBase}/dashboard`);
        });
    }
    catch (error) {
        console.error('Auth Callback Error:', error.message);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_callback_failed`);
    }
};
exports.callback = callback;
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout Error:', err);
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.clearCookie('connect.sid'); // clear session cookie
        res.json({ message: 'Logged out successfully' });
    });
};
exports.logout = logout;
const getMe = async (req, res) => {
    if (!req.session.token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        // If we cached user in session, return it, otherwise fetch
        if (req.session.user) {
            return res.json(req.session.user);
        }
        const user = await githubService.getUser(req.session.token);
        req.session.user = user; // Cache it
        res.json(user);
    }
    catch (error) {
        console.error('Get User Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
exports.getMe = getMe;
const getRepos = async (req, res) => {
    if (!req.session.token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const repos = await githubService.getUserRepos(req.session.token);
        // Transform or filter repos if needed (e.g. only necessary fields)
        const simplifiedRepos = repos.map((repo) => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            private: repo.private,
            html_url: repo.html_url,
            description: repo.description,
            language: repo.language,
            updated_at: repo.updated_at,
            clone_url: repo.clone_url
        }));
        res.json(simplifiedRepos);
    }
    catch (error) {
        console.error('Get Repos Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch repositories' });
    }
};
exports.getRepos = getRepos;
