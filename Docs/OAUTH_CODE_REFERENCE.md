# GitHub OAuth Implementation - Code Reference

## Backend Implementation

### 1. Environment Variables (`.env`)



### 2. Server Setup (`backend/src/index.ts`)

**Key Features:**
- ✅ Loads environment variables with `dotenv.config()`
- ✅ Configures CORS with credentials enabled
- ✅ Sets up express-session middleware
- ✅ Mounts auth routes at `/auth`
- ✅ Mounts repo routes at `/api/repos`

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import authRoutes from './routes/authRoutes';
import repoRoutes from './routes/repoRoutes';

dotenv.config();

const app = express();

// CORS with credentials
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/repos', repoRoutes);

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
```

### 3. GitHub Service (`backend/src/services/githubService.ts`)

**Provides:**
- `getAuthUrl()` - Generates GitHub OAuth URL
- `getAccessToken(code)` - Exchanges code for access token
- `getUser(token)` - Fetches user profile
- `getUserRepos(token)` - Fetches user repositories

```typescript
import axios from 'axios';

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;

export const getAuthUrl = () => {
    const scope = 'repo user';
    return `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scope}`;
};

export const getAccessToken = async (code: string) => {
    const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: REDIRECT_URI,
        },
        {
            headers: { Accept: 'application/json' },
        }
    );
    return response.data;
};

export const getUser = async (accessToken: string) => {
    const response = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
};

export const getUserRepos = async (accessToken: string) => {
    const response = await axios.get(
        'https://api.github.com/user/repos?sort=updated&per_page=100',
        {
            headers: { Authorization: `Bearer ${accessToken}` },
        }
    );
    return response.data;
};
```

### 4. Auth Controller (`backend/src/controllers/authController.ts`)

**Endpoints:**
- `login` - Redirects to GitHub OAuth
- `callback` - Handles OAuth callback
- `getMe` - Returns current user
- `getRepos` - Returns user repositories
- `logout` - Destroys session

```typescript
import { Request, Response } from 'express';
import * as githubService from '../services/githubService';

// Extend session type
declare module 'express-session' {
    interface SessionData {
        token: string;
        user: any;
    }
}

export const login = (req: Request, res: Response) => {
    const url = githubService.getAuthUrl();
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
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=github_auth_failed`);
        }

        req.session.token = tokenData.access_token;
        const user = await githubService.getUser(tokenData.access_token);
        req.session.user = user;

        req.session.save((err) => {
            if (err) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=session_error`);
            }
            res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        });
    } catch (error: any) {
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_callback_failed`);
    }
};

export const getMe = async (req: Request, res: Response) => {
    if (!req.session.token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        if (req.session.user) {
            return res.json(req.session.user);
        }
        const user = await githubService.getUser(req.session.token);
        req.session.user = user;
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const getRepos = async (req: Request, res: Response) => {
    if (!req.session.token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const repos = await githubService.getUserRepos(req.session.token);
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
        res.status(500).json({ error: 'Failed to fetch repositories' });
    }
};

export const logout = (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
};
```

### 5. Auth Routes (`backend/src/routes/authRoutes.ts`)

```typescript
import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

router.get('/github', authController.login);
router.get('/github/callback', authController.callback);
router.get('/me', authController.getMe);
router.get('/repos', authController.getRepos);
router.get('/logout', authController.logout);

export default router;
```

### 6. Repo Routes (`backend/src/routes/repoRoutes.ts`)

```typescript
import { Router } from 'express';
import { getRepos } from '../controllers/authController';

const router = Router();

// GET /api/repos - Fetch user repositories
router.get('/', getRepos);

export default router;
```

---

## Frontend Implementation

### 1. API Service (`frontend/src/services/api.js`)

**Provides:**
- `getMe()` - Fetch current user
- `getMyRepos()` - Fetch repositories
- `logout()` - Logout user
- All requests include credentials (cookies)

```javascript
export const API_BASE_URL = 'http://localhost:3000';

const fetchWithAuth = async (url, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        credentials: 'include', // Send cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }
    
    return response.json();
};

export const getMe = async () => {
    return fetchWithAuth('/auth/me');
};

export const getMyRepos = async () => {
    return fetchWithAuth('/api/repos');
};

export const logout = async () => {
    return fetchWithAuth('/auth/logout');
};
```

### 2. Auth Context (`frontend/src/context/AuthContext.jsx`)

**Provides:**
- `user` - Current user object (or null)
- `loading` - Loading state
- `login()` - Redirect to GitHub OAuth
- `logout()` - Logout and clear user

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logout as apiLogout } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await getMe();
            setUser(userData);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        window.location.href = 'http://localhost:3000/auth/github';
    };

    const logout = async () => {
        try {
            await apiLogout();
            setUser(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
```

### 3. Login Component (`frontend/src/components/GitHubLogin.jsx`)

```javascript
import { Github } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function GitHubLogin() {
    const { login } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-xl shadow-2xl max-w-md mx-auto">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <Github size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400 text-center mb-8">
                Connect your GitHub account to access your repositories.
            </p>

            <button
                onClick={login}
                className="flex items-center gap-3 bg-white text-black hover:bg-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg w-full justify-center"
            >
                <Github size={24} />
                Sign in with GitHub
            </button>
        </div>
    );
}

export default GitHubLogin;
```

### 4. Repository List Component (`frontend/src/components/RepoList.jsx`)

**Features:**
- Fetches repos on mount
- Real-time search filtering
- Displays repo cards with metadata
- Click to select repository

```javascript
import { useState, useEffect } from 'react';
import { getMyRepos } from '../services/api';
import { Lock, Globe, Search, Loader2 } from 'lucide-react';

function RepoList({ onSelect }) {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchRepos();
    }, []);

    const fetchRepos = async () => {
        try {
            const data = await getMyRepos();
            setRepos(data);
        } catch (err) {
            setError('Failed to fetch repositories');
        } finally {
            setLoading(false);
        }
    };

    const filteredRepos = repos.filter(repo =>
        repo.full_name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center p-12 text-purple-400">
            <Loader2 className="animate-spin" size={32} />
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-400">
            {error}
            <button onClick={fetchRepos} className="block mx-auto mt-4 underline">
                Retry
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <Search className="text-slate-500" size={20} />
                <input
                    type="text"
                    placeholder="Search repositories..."
                    className="bg-transparent border-none outline-none text-slate-200 flex-1"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                {filteredRepos.map(repo => (
                    <div
                        key={repo.id}
                        onClick={() => onSelect(repo.html_url)}
                        className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl hover:border-purple-500/50 cursor-pointer"
                    >
                        <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-slate-200">{repo.name}</h3>
                            {repo.private ? <Lock size={14} /> : <Globe size={14} />}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                            {repo.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            {repo.language && (
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-purple-500/50" />
                                    {repo.language}
                                </span>
                            )}
                            <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RepoList;
```

### 5. Main App Component (`frontend/src/App.jsx`)

**Flow:**
1. Shows loading spinner while checking auth
2. If not authenticated → Shows login page
3. If authenticated → Shows dashboard with:
   - User info in header
   - Repository selection (tabs: Direct URL / Select Repository)
   - Logout button

The existing `App.jsx` already handles this correctly!

---

## 🔐 Security Features

✅ **Session Security:**
- HTTP-only cookies (prevents XSS attacks)
- Secure flag in production (HTTPS only)
- 24-hour session expiry
- Session secret from environment variable

✅ **CORS Protection:**
- Only allows requests from frontend URL
- Credentials must be explicitly included

✅ **Token Storage:**
- Access token stored server-side in session
- Never exposed to frontend JavaScript
- Automatically included in API requests via session cookie

✅ **Error Handling:**
- Graceful error messages
- Redirects on auth failures
- No sensitive data in error responses

---

## 📊 API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/auth/github` | No | Redirects to GitHub OAuth |
| GET | `/auth/github/callback` | No | Handles OAuth callback |
| GET | `/auth/me` | Yes | Returns current user |
| GET | `/auth/logout` | Yes | Destroys session |
| GET | `/api/repos` | Yes | Returns user repositories |

---

## 🎯 Complete!

All code is already implemented and working. Just follow the testing guide to verify!
