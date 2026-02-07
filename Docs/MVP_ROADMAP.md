# AI Deployment Copilot - MVP Roadmap & Architecture

## 1. Architecture Overview

### Frontend (React + Tambo)
- **Framework**: Vite + React
- **Styling**: TailwindCSS + Framer Motion (for "wow" factor)
- **AI Interface**: Tambo SDK (Generative UI)
- **Communication**: HTTP/REST + WebSocket (for log streaming)

### Backend (Node.js API)
- **Server**: Express.js
- **Git Engine**: `simple-git` for cloning and operations
- **Integrations**: 
  - GitHub API (Octokit) for metadata/OAuth
  - Vercel API for deployment triggers
- **Security**: 
  - Temporary workspace isolation (`/tmp/workspaces/<id>`)
  - Environment variable encryption (basic)

## 2. API Design

### Repository Management
- `POST /api/repos/connect`: Validate and clone public/private repo
- `GET /api/repos/:id/structure`: Analyze file tree and frameworks

### Deployment
- `POST /api/deploy/analyze`: AI analysis of project requirements
- `POST /api/deploy/trigger`: Push to Vercel
- `GET /api/deploy/:id/logs`: Stream build logs

## 3. Folder Structure

```
root/
├── backend/
│   ├── src/
│   │   ├── config/         # Env & Secrets
│   │   ├── controllers/    # Route logic
│   │   ├── services/       # Git, Vercel, GitHub services
│   │   ├── routes/         # Express routes
│   │   ├── utils/          # File ops, security
│   │   └── index.ts        # Entry point
│   ├── workspaces/         # Temp clone targets
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── tambo/          # Custom Tambo components
│   │   ├── services/       # API clients
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 4. Implementation Phasing

### Phase 1: Foundation & Git Connectivity (CURRENT)
- Set up Express server structure.
- Implement strictly safe local workspace manager.
- Create "Connect Repo" API (Clones repo to temp folder).
- Basic Frontend UI to input Repo URL and visualize structure.

### Phase 2: Analysis & Intelligence
- Implement file analysis service (detect `package.json`, `requirements.txt`).
- Feed context to Tambo for "Deployment Suggestions".

### Phase 3: Vercel Integration
- Connect Vercel API.
- Trigger builds.
- Stream status back to UI.

### Phase 4: Production Hardening
- Docker sandbox for cloning.
- OAuth flow for private repos.
- Redis for job queue.

---
## 5. Deployment Strategy
- **Frontend**: Vercel
- **Backend**: Render or Vercel Serverless (using /api rewrites)
