# GitHub OAuth Flow - Visual Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GITHUB OAUTH AUTHENTICATION FLOW                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│    FRONTEND      │         │     BACKEND      │         │     GITHUB       │
│  localhost:5173  │         │  localhost:3000  │         │   github.com     │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
        │                            │                            │
        │                            │                            │
        │                            │                            │
┌───────┴────────────────────────────────────────────────────────────────────┐
│ STEP 1: User Clicks "Sign in with GitHub"                                  │
└───────┬────────────────────────────────────────────────────────────────────┘
        │
        │  window.location.href = 'http://localhost:3000/auth/github'
        │
        ├──────────────────────────►
        │                            │
┌───────┴────────────────────────────┴───────────────────────────────────────┐
│ STEP 2: Backend Generates GitHub OAuth URL                                 │
└───────┬────────────────────────────┬───────────────────────────────────────┘
        │                            │
        │                            │  Redirect to GitHub OAuth
        │                            │  with client_id, redirect_uri, scope
        │                            │
        │                            ├──────────────────────────►
        │                            │                            │
┌───────┴────────────────────────────┴────────────────────────────┴──────────┐
│ STEP 3: User Authorizes App on GitHub                                      │
└───────┬────────────────────────────┬────────────────────────────┬──────────┘
        │                            │                            │
        │                            │  ◄──────────────────────────┤
        │                            │                            │
        │                            │  Redirect with code        │
        │                            │  /auth/github/callback?code=xxx
        │                            │
┌───────┴────────────────────────────┴───────────────────────────────────────┐
│ STEP 4: Backend Exchanges Code for Access Token                            │
└───────┬────────────────────────────┬───────────────────────────────────────┘
        │                            │
        │                            │  POST /login/oauth/access_token
        │                            │  { code, client_id, client_secret }
        │                            │
        │                            ├──────────────────────────►
        │                            │                            │
        │                            │  ◄──────────────────────────┤
        │                            │                            │
        │                            │  { access_token: "gho_xxx" }
        │                            │
┌───────┴────────────────────────────┴───────────────────────────────────────┐
│ STEP 5: Backend Stores Token in Session                                    │
│         req.session.token = access_token                                    │
│         req.session.user = user_data                                        │
└───────┬────────────────────────────┬───────────────────────────────────────┘
        │                            │
        │                            │  GET /user
        │                            │  Authorization: Bearer gho_xxx
        │                            │
        │                            ├──────────────────────────►
        │                            │                            │
        │                            │  ◄──────────────────────────┤
        │                            │                            │
        │                            │  { login, avatar_url, ... }
        │                            │
┌───────┴────────────────────────────┴───────────────────────────────────────┐
│ STEP 6: Backend Redirects to Frontend Dashboard                            │
└───────┬────────────────────────────┬───────────────────────────────────────┘
        │                            │
        │  ◄──────────────────────────┤
        │                            │
        │  Redirect to http://localhost:5173/dashboard
        │  Set-Cookie: connect.sid=xxx (HTTP-only, secure)
        │
┌───────┴────────────────────────────────────────────────────────────────────┐
│ STEP 7: Frontend Loads Dashboard                                           │
└───────┬────────────────────────────────────────────────────────────────────┘
        │
        │  GET /auth/me
        │  Cookie: connect.sid=xxx
        │
        ├──────────────────────────►
        │                            │
┌───────┴────────────────────────────┴───────────────────────────────────────┐
│ STEP 8: Backend Returns User from Session                                  │
└───────┬────────────────────────────┬───────────────────────────────────────┘
        │                            │
        │  ◄──────────────────────────┤
        │                            │
        │  { login: "username", avatar_url: "...", ... }
        │
┌───────┴────────────────────────────────────────────────────────────────────┐
│ STEP 9: Frontend Displays User Info                                        │
└───────┬────────────────────────────────────────────────────────────────────┘
        │
        │  GET /api/repos
        │  Cookie: connect.sid=xxx
        │
        ├──────────────────────────►
        │                            │
┌───────┴────────────────────────────┴───────────────────────────────────────┐
│ STEP 10: Backend Fetches Repos from GitHub                                 │
└───────┬────────────────────────────┬───────────────────────────────────────┘
        │                            │
        │                            │  GET /user/repos
        │                            │  Authorization: Bearer gho_xxx
        │                            │
        │                            ├──────────────────────────►
        │                            │                            │
        │                            │  ◄──────────────────────────┤
        │                            │                            │
        │                            │  [{ name, language, ... }]
        │                            │
┌───────┴────────────────────────────┴───────────────────────────────────────┐
│ STEP 11: Backend Returns Simplified Repo List                              │
└───────┬────────────────────────────┬───────────────────────────────────────┘
        │                            │
        │  ◄──────────────────────────┤
        │                            │
        │  [{ id, name, language, description, ... }]
        │
┌───────┴────────────────────────────────────────────────────────────────────┐
│ STEP 12: Frontend Displays Repository Cards                                │
│          - Search functionality                                             │
│          - Click to select                                                  │
│          - Language indicators                                              │
│          - Private/Public icons                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                              LOGOUT FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│    FRONTEND      │         │     BACKEND      │
│  localhost:5173  │         │  localhost:3000  │
└──────────────────┘         └──────────────────┘
        │                            │
        │  GET /auth/logout          │
        │  Cookie: connect.sid=xxx   │
        │                            │
        ├──────────────────────────► │
        │                            │
        │                            │  req.session.destroy()
        │                            │  res.clearCookie('connect.sid')
        │                            │
        │  ◄──────────────────────────┤
        │                            │
        │  { message: "Logged out" } │
        │                            │
        │  setUser(null)             │
        │  Redirect to login page    │
        │                            │


┌─────────────────────────────────────────────────────────────────────────────┐
│                           SESSION STORAGE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Backend Session Store (in-memory):
┌────────────────────────────────────┐
│  Session ID: abc123...             │
│  ├─ token: "gho_xxxxx..."          │
│  ├─ user: {                        │
│  │    login: "username",           │
│  │    avatar_url: "...",           │
│  │    ...                          │
│  │  }                              │
│  └─ expires: 24 hours              │
└────────────────────────────────────┘

Frontend Cookie:
┌────────────────────────────────────┐
│  connect.sid=abc123...             │
│  ├─ HttpOnly: true                 │
│  ├─ Secure: true (production)      │
│  └─ MaxAge: 24 hours               │
└────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY FEATURES                                   │
└─────────────────────────────────────────────────────────────────────────────┘

✅ Token Storage:
   - Access token stored SERVER-SIDE only
   - Never exposed to frontend JavaScript
   - Transmitted via HTTP-only session cookie

✅ CORS Protection:
   - Only allows requests from http://localhost:5173
   - Credentials must be explicitly included
   - Prevents unauthorized API access

✅ Session Security:
   - HTTP-only cookies (prevents XSS)
   - Secure flag in production (HTTPS only)
   - 24-hour expiration
   - Session secret from environment variable

✅ OAuth Security:
   - Authorization code grant flow (most secure)
   - State parameter could be added for CSRF protection
   - Client secret never exposed to frontend
   - Redirect URI validated by GitHub


┌─────────────────────────────────────────────────────────────────────────────┐
│                            ERROR HANDLING                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Missing Code:
  GitHub callback → Backend checks for code
                  → If missing: 400 error

GitHub Auth Failed:
  Token exchange fails → Redirect to frontend with error query param
                       → Frontend shows error message

Session Error:
  Session save fails → Redirect to frontend with error query param
                     → User can retry login

Not Authenticated:
  API request without session → 401 Unauthorized
                              → Frontend redirects to login

GitHub API Error:
  Fetch user/repos fails → 500 Internal Server Error
                         → Frontend shows error message
                         → Retry button available


┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW SUMMARY                                    │
└─────────────────────────────────────────────────────────────────────────────┘

1. User Intent: "I want to login"
   ↓
2. Frontend: Redirect to backend OAuth endpoint
   ↓
3. Backend: Generate GitHub OAuth URL and redirect
   ↓
4. GitHub: User authorizes, redirects back with code
   ↓
5. Backend: Exchange code for token, store in session
   ↓
6. Backend: Fetch user data, store in session
   ↓
7. Backend: Redirect to frontend dashboard
   ↓
8. Frontend: Fetch user info from session
   ↓
9. Frontend: Display user info
   ↓
10. Frontend: Fetch repositories
    ↓
11. Backend: Use session token to fetch from GitHub
    ↓
12. Frontend: Display repository cards
    ↓
13. User: Browse, search, select repositories
    ↓
14. User: Click logout
    ↓
15. Backend: Destroy session
    ↓
16. Frontend: Clear user state, redirect to login
```
