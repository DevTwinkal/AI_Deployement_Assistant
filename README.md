# AI Deployment Copilot

An autonomous solution for deploying full-stack and frontend applications to Vercel with zero configuration.

## 🚀 Key Features

- **Intelligent Project Analysis**: Automatically detects languages (Node.js, Python) and frameworks (Next.js, Vite, React, Vue, Angular, Svelte, Nuxt, Flask, Django).
- **Subdirectory (Monorepo) Support**: Native support for projects located in subdirectories (e.g., `frontend/`, `web/`, `client/`). Automatically scopes the Vercel build context.
- **Automatic SPA Routing**: Injects optimized `vercel.json` configurations for Single Page Applications to prevent `404: NOT_FOUND` errors on route refreshes.
- **Binary Asset Safety**: Robust handling of images, icons, and binary files using base64 encoding during the deployment pipeline.
- **Enhanced Authentication**: GitHub OAuth integration with persistent session management and cross-origin reliability (localhost/127.0.0.1 support).
- **Real-time Logs**: Streaming deployment status and logs using Server-Sent Events (SSE).

## 🛠 Tech Stack

- **Backend**: Node.js, Express, TypeScript, Vercel API (v13), Octokit.
- **Frontend**: React, Vite, Lucide Icons, Tailwind CSS.
- **Dev Tools**: tsx, vite-plugin-react, ESLint.

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- Vercel API Token
- GitHub OAuth Application

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DevTwinkal/AI_Deployement_Assistant.git
   ```

2. **Backend Setup**:
   ```ps1
   cd backend
   npm install
   # Configure .env with GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, FRONTEND_URL, VERCEL_TOKEN, etc.
   npm run dev
   ```

3. **Frontend Setup**:
   ```ps1
   cd frontend
   npm install
   # Configure .env with VITE_TAMBO_KEY and VITE_TAMBO_PROJECT_ID
   npm run dev
   ```

## 🏗 Key Module Overview

- `analysisService.ts`: The "brain" of the project—recursively analyzes repositories to determine the optimal build environment.
- `vercelService.ts`: Handles secure file bundle preparation and interaction with Vercel's Deployment API.
- `gitService.ts`: Provides sandbox cloning and workspace management for repository analysis.
- `authController.ts`: Manages the secure OAuth flow and session persistence across origins.

## 📄 License
MIT
