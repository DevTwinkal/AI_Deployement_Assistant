# AI Deployment Copilot (MVP) 🚀

A production-ready SaaS platform that allows users to connect GitHub repositories, analyze them using AI, and deploy them to the cloud (Vercel) via an intelligent conversational interface.

![Status](https://img.shields.io/badge/Status-MVP_Ready-success) ![Stack](https://img.shields.io/badge/Stack-React_|_Node.js_|_Vite-blue)

## 🌟 Key Features

*   **🔗 Instant Repo Connectivity**: Securely connect and clone any public GitHub repository.
*   **🧠 AI Project Analysis**: Deep scans `package.json` and `requirements.txt` to auto-detect frameworks (Next.js, React, Python, etc.) and build commands.
*   **⚡ Generative UI Dashboard**: Dynamic interface that adapts to the deployment state (Analysis Cards, Terminals, Success Modals).
*   **📡 Real-time Log Streaming**: Watch your deployment happen live with Server-Sent Events (SSE) streaming logs from the backend.
*   **🚀 Automated Vercel Pipeline**: Simulates the full Vercel deployment lifecycle (Clone → Install → Build → Upload).

---

## 🏗️ Architecture

The project follows a scalable **Client-Server** architecture designed for cloud deployment.

### Frontend (`/frontend`)
*   **Framework**: React 19 + Vite 6
*   **Styling**: TailwindCSS + Framer Motion (Glassmorphism UI)
*   **State Management**: React Hooks + EventSource for streaming
*   **AI Interface**: Tambo SDK (Generative UI)

### Backend (`/backend`)
*   **Server**: Node.js + Express
*   **API Pattern**: REST + Server-Sent Events (SSE)
*   **Core Services**:
    *   `gitService`: Robust child-process based Git cloner.
    *   `analysisService`: Intelligent heuristic engine for stack detection.
    *   `vercelService`: Deployment pipeline orchestrator.
*   **Security**: Temporary workspace isolation (`/workspaces/{uuid}`) with auto-cleanup.

---

## 🚀 Quick Start Guide

### Prerequisites
*   Node.js v18+ installed
*   Git installed

### 1. Start the Backend API
The backend handles repo cloning and deployment logic.

```bash
cd backend
npm install
npm run dev
```
> Server runs on `http://localhost:3000`

### 2. Start the Frontend UI
The frontend provides the interactive dashboard.

```bash
cd frontend
npm install
npm run dev
```
> Open `http://localhost:5173` in your browser.

---

## 🎮 How to Use

1.  **Enter a Repo URL**: Paste any GitHub URL (e.g., `https://github.com/vercel/next-learn`).
2.  **AI Analysis**: The system will clone the repo and display a **Project Intelligence Card** showing the detected framework (e.g., "Next.js") and build command.
3.  **Trigger Deployment**: Click the **"Trigger Vercel Deployment"** button.
4.  **Watch Live Logs**: Observe the build process in the real-time terminal window.
5.  **Visit Site**: Once complete, click the **"Visit Website"** button to see your deployed app (simulated URL).

---

## 🔌 API Documentation

### `POST /api/repos/connect`
Clones and analyzes a repository.
**Body:** `{ "repoUrl": "string" }`
**Response:**
```json
{
  "success": true,
  "workspaceId": "uuid",
  "analysis": {
    "language": "Node.js",
    "framework": "Next.js",
    "buildCommand": "npm run build"
  }
}
```

### `POST /api/deploy`
Triggers the deployment pipeline.
**Body:** `{ "workspaceId": "uuid", "analysis": {...} }`
**Response:** Stream of JSON events (`log`, `success`, `error`).

---

## 📂 Project Structure

```
ai-deployment-copilot/
├── backend/
│   ├── src/
│   │   ├── controllers/   # API Handlers
│   │   ├── services/      # Business Logic (Git, Vercel, Analysis)
│   │   ├── routes/        # Express Route Definitions
│   │   └── utils/         # File System Helpers
│   └── workspaces/        # Temp storage for cloned repos
├── frontend/
│   └── src/
│       ├── components/    # React Components
│       ├── services/      # API Integration (Fetch/SSE)
│       └── tambo/         # Generative UI Logic
└── MVP_ROADMAP.md         # Future development plan
```

## 📄 License
MIT
