# 🚀 Quick Start Checklist

## ✅ Pre-Flight Checklist

Before testing, make sure you complete these steps:

### 1. GitHub OAuth App Configuration ⚠️ CRITICAL

- [ ] Go to https://github.com/settings/developers
- [ ] Click on your OAuth App
- [ ] Verify **Authorization callback URL** is set to:
  ```
  http://localhost:3000/auth/github/callback
  ```
- [ ] Click "Update application" if you made changes

### 2. Environment Variables

- [x] `backend/.env` file exists ✅
- [x] `GITHUB_CLIENT_ID` is set ✅
- [x] `GITHUB_CLIENT_SECRET` is set ✅
- [x] `GITHUB_REDIRECT_URI` is correct ✅
- [x] `SESSION_SECRET` is set ✅
- [x] `FRONTEND_URL` is set ✅

### 3. Dependencies Installed

- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)

---

## 🎬 Launch Sequence

### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

**Wait for:** `AI Deployment Copilot Backend running on port 3000`

### Terminal 2: Frontend Server

```bash
cd frontend
npm run dev
```

**Wait for:** `VITE v6.x.x ready in xxx ms`

---

## 🧪 Testing Checklist

### Phase 1: Login Flow

- [ ] Open browser to http://localhost:5173
- [ ] See landing page with "AI Deployment Copilot" title
- [ ] See "Sign in with GitHub" button
- [ ] Click "Sign in with GitHub"
- [ ] Redirected to GitHub authorization page
- [ ] See your OAuth app name
- [ ] Click "Authorize" button
- [ ] Redirected back to http://localhost:5173/dashboard
- [ ] See your GitHub username in top-right corner
- [ ] See your avatar (if you have one)

### Phase 2: Dashboard Features

- [ ] See two tabs: "Direct URL" and "Select Repository"
- [ ] "Direct URL" tab is selected by default
- [ ] See input field for repository URL
- [ ] See "Connect" button
- [ ] See sidebar with Bot icon
- [ ] See logout button in sidebar (bottom)

### Phase 3: Repository Listing

- [ ] Click "Select Repository" tab
- [ ] See loading spinner briefly
- [ ] See search bar appear
- [ ] See grid of repository cards
- [ ] Each card shows:
  - [ ] Repository name
  - [ ] Description (or "No description")
  - [ ] Programming language (if available)
  - [ ] Last updated date
  - [ ] Lock icon (private) or Globe icon (public)

### Phase 4: Search Functionality

- [ ] Type in search bar
- [ ] Repositories filter in real-time
- [ ] Clear search
- [ ] All repositories reappear

### Phase 5: Repository Selection

- [ ] Click on a repository card
- [ ] Tab switches to "Direct URL"
- [ ] Repository URL appears in input field
- [ ] Can manually edit the URL
- [ ] Can switch back to "Select Repository" tab

### Phase 6: Logout

- [ ] Click logout icon in sidebar
- [ ] Redirected to login page
- [ ] No longer see dashboard
- [ ] See "Sign in with GitHub" button again

### Phase 7: Session Persistence

- [ ] Login again
- [ ] Navigate to dashboard
- [ ] Refresh the page (F5)
- [ ] Still logged in
- [ ] Dashboard still shows your info
- [ ] Repositories still load

---

## 🔍 Troubleshooting Checklist

### Issue: "Missing code" error after GitHub redirect

**Diagnosis:**
- [ ] Check GitHub OAuth app settings
- [ ] Verify redirect URI is exactly: `http://localhost:3000/auth/github/callback`
- [ ] No extra `/api` in the path
- [ ] No trailing slash

**Fix:**
- [ ] Update GitHub OAuth app redirect URI
- [ ] Click "Update application"
- [ ] Clear browser cookies
- [ ] Try login again

### Issue: CORS errors in browser console

**Diagnosis:**
- [ ] Open DevTools (F12) → Console tab
- [ ] Look for errors mentioning "CORS" or "Access-Control-Allow-Origin"

**Fix:**
- [ ] Verify backend is running on port 3000
- [ ] Verify frontend is running on port 5173
- [ ] Access via `http://localhost:5173` (not `127.0.0.1`)
- [ ] Check backend CORS configuration in `src/index.ts`

### Issue: "Not authenticated" when fetching repos

**Diagnosis:**
- [ ] Open DevTools (F12) → Network tab
- [ ] Look for request to `/api/repos`
- [ ] Check response status (should be 200, not 401)
- [ ] Check if cookies are being sent

**Fix:**
- [ ] Clear all browser cookies for localhost
- [ ] Logout (if possible)
- [ ] Login again
- [ ] Check backend logs for session creation

### Issue: Repositories not loading

**Diagnosis:**
- [ ] Open DevTools (F12) → Network tab
- [ ] Look for request to `/api/repos`
- [ ] Check response status and body
- [ ] Check browser console for errors

**Fix:**
- [ ] Verify you're logged in (check `/auth/me` endpoint)
- [ ] Check GitHub token has `repo` scope
- [ ] Check backend logs for errors
- [ ] Try logout and login again

### Issue: Session not persisting across page refresh

**Diagnosis:**
- [ ] Check if cookies are enabled in browser
- [ ] Check if cookies are being set (DevTools → Application → Cookies)
- [ ] Look for `connect.sid` cookie

**Fix:**
- [ ] Enable cookies in browser settings
- [ ] Check `SESSION_SECRET` is set in `.env`
- [ ] Restart backend server
- [ ] Clear cookies and login again

---

## 📊 Health Check Commands

### Check Backend Health

```bash
curl http://localhost:3000/health
```

**Expected:** `{"status":"ok","version":"1.0.0"}`

### Check Authentication Status (after login)

```bash
curl http://localhost:3000/auth/me -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

**Expected:** Your GitHub user object

### Check Repository Endpoint (after login)

```bash
curl http://localhost:3000/api/repos -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

**Expected:** Array of your repositories

---

## 🎯 Success Criteria

Your implementation is working correctly if:

- [x] Backend server starts without errors ✅
- [x] Frontend server starts without errors ✅
- [ ] Login redirects to GitHub
- [ ] GitHub redirects back to dashboard
- [ ] Dashboard shows your username
- [ ] Repository list loads
- [ ] Search filters repositories
- [ ] Clicking a repo selects it
- [ ] Logout returns to login page
- [ ] Session persists across page refresh

---

## 📝 Notes

- **Session Duration:** 24 hours (configurable in `backend/src/index.ts`)
- **Repository Limit:** 100 repos (configurable in `backend/src/services/githubService.ts`)
- **OAuth Scopes:** `repo user` (allows reading repos and user info)
- **Cookie Name:** `connect.sid` (default for express-session)

---

## 🆘 Getting Help

If you encounter issues not covered here:

1. **Check Backend Logs:** Look at the terminal running `npm run dev` in backend
2. **Check Browser Console:** Open DevTools (F12) → Console tab
3. **Check Network Tab:** Open DevTools (F12) → Network tab
4. **Review Documentation:**
   - `OAUTH_TESTING_GUIDE.md` - Detailed testing instructions
   - `OAUTH_CODE_REFERENCE.md` - Complete code documentation
   - `OAUTH_FLOW_DIAGRAM.md` - Visual flow diagram

---

## ✅ Final Checklist

Before considering the task complete:

- [ ] GitHub OAuth app redirect URI is correct
- [ ] Both servers start without errors
- [ ] Can login via GitHub
- [ ] Dashboard loads with user info
- [ ] Repositories load and display
- [ ] Search works
- [ ] Can select repositories
- [ ] Logout works
- [ ] Session persists across refresh

---

**Status:** Ready to test! 🚀

**Next Step:** Update your GitHub OAuth app redirect URI, then start both servers and test the flow!
