# AI Deployment Copilot 🚀

A next-generation AI-powered DevOps assistant that intelligently guides you through project analysis, configuration, and deployment processes using a **Generative UI** interface.

This project demonstrates the power of **Generative UI**, where the AI doesn't just chat—it summons interactive React components (checklists, terminals, editors) to actually *do* the work.

![Generative UI Demo](https://placehold.co/1200x400/0f172a/38bdf8?text=Generative+UI+DevOps+Dashboard)

## 🌟 Key Features

### ✨ Generative UI Components
The AI dynamically renders specialized interfaces based on your intent:
- **Project Analyzer:** A comprehensive card displaying stack details, health scores, and issues.
- **Deployment Checklist:** Interactive, step-by-step guide tailored to your specific deployment target (Vercel, Docker, etc.).
- **Config Editor:** Smart editor for fixing configuration files like `Dockerfile` or `vercel.json` on the fly.
- **Command Terminal:** Real-time simulated terminal for watching build logs and processes.
- **Status Dashboard:** Visual monitoring of deployment progress and server health.

### 🧠 Backend Power (MCP)
The `backend/` folder contains a reference **Model Context Protocol (MCP)** server that implements:
- `analyze_project`: Deep scanning of project directories.
- `simulate_deployment`: Realistic simulation of build and deploy pipelines.
- `generate_config`: Intelligent creation of necessary config files.

---

## 🚀 Quick Start (Demo Mode)

The frontend is currently configured with **Simulated Backend Mode** for instant, stable demos without requiring local MCP configuration.

### 1. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
> Open `http://localhost:5173` to launch the AI Assistant.

### 2. Try the Demo Scenarios
Once the dashboard is open, type these commands to trigger Generative UI:

| Intent | Command to Type | Component Summoned |
| :--- | :--- | :--- |
| **Analyze** | "Analyze this project" | `ProjectAnalyzer` |
| **Deploy** | "Deploy to Vercel" | `DeploymentChecklist` |
| **Monitor** | "Show build logs" | `CommandTerminal` |
| **Fix** | "Fix my config" | `ConfigEditor` |
| **Status** | "Show status" | `DeploymentStatusDashboard` |

---

## 🛠️ Components & Architecture

### Frontend (`/frontend`)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide React
- **AI Integration:** Mocked Tambo SDK (`src/tambo/index.jsx`) for stable demo purposes.

### Backend (`/backend`)
A standalone **MCP Server** built with Node.js.
- **Protocol:** Model Context Protocol (over Stdio)
- **Tools Implemented:** `analyze_project`, `simulate_deployment`, `generate_config`
- **To Run:**
  ```bash
  cd backend
  npm install
  npm run dev  # Runs the MCP server on stdio
  ```

## 📂 Project Structure

```
ai-deployment-copilot/
├── frontend/                 # React Application
│   ├── src/components/generative  # The AI-summoned UI components
│   └── src/tambo/            # Mocked SDK integration
├── backend/                  # Node.js MCP Server
│   └── src/                  # Tool definitions and logic
└── BLUEPRINT.md              # Technical design document
```

## 📄 License
MIT
