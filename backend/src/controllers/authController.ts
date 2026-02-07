import { Request, Response } from 'express';
import * as githubService from '../services/githubService';

// Extend session to include token
import 'express-session';
declare module 'express-session' {
    interface SessionData {
        token: string;
        user: any;
    }
}

export const login = (req: Request, res: Response) => {
    const url = githubService.getAuthUrl();
    console.log('Redirecting to GitHub Auth:', url);
    res.redirect(url);
};

export const callback = async (req: Request, res: Response) => {
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
            res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        });
    } catch (error: any) {
        console.error('Auth Callback Error:', error.message);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_callback_failed`);
    }
};

export const logout = (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout Error:', err);
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.clearCookie('connect.sid'); // clear session cookie
        res.json({ message: 'Logged out successfully' });
    });
};

export const getMe = async (req: Request, res: Response) => {
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
    } catch (error: any) {
        console.error('Get User Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const getRepos = async (req: Request, res: Response) => {
    if (!req.session.token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const repos = await githubService.getUserRepos(req.session.token);
        // Transform or filter repos if needed (e.g. only necessary fields)
        const simplifiedRepos = repos.map((repo: any) => ({
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
    } catch (error: any) {
        console.error('Get Repos Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch repositories' });
    }
};
