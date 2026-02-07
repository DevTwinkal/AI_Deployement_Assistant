 
import { useState } from 'react';

// Import Generative Components
import ProjectAnalyzer from '../components/generative/ProjectAnalyzer';
import DeploymentChecklist from '../components/generative/DeploymentChecklist';
import CommandTerminal from '../components/generative/CommandTerminal';
import ConfigEditor from '../components/generative/ConfigEditor';
import ErrorDebugger from '../components/generative/ErrorDebugger';
import DeploymentStatusDashboard from '../components/generative/DeploymentStatusDashboard';

const GENERATIVE_DECISIONS = [
    {
        trigger: ['analyze', 'project', 'scan', 'stack'],
        component: <ProjectAnalyzer path="/user/dev/my-app" />,
        text: "I've analyzed the project structure. It appears to be a React application with a Node.js backend."
    },
    {
        trigger: ['deploy', 'ship', 'production', 'vercel'],
        component: <DeploymentChecklist target="Vercel" />,
        text: "I can help with that. Here is the deployment checklist for Vercel."
    },
    {
        trigger: ['log', 'output', 'terminal', 'history'],
        component: <CommandTerminal command="npm run build" />,
        text: "Showing recent build logs from the pipeline."
    },
    {
        trigger: ['fix', 'config', 'edit', 'docker'],
        component: <ConfigEditor file="Dockerfile" suggestedContent="FROM node:18-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD ['npm', 'start']" />,
        text: "I've generated a fix for your Dockerfile configuration."
    },
    {
        trigger: ['debug', 'error', 'fail', 'crash'],
        component: <ErrorDebugger error="EADDRINUSE: 5000" />,
        text: "It looks like port 5000 is occupied. Here is an analysis of the error."
    },
    {
        trigger: ['status', 'dashboard', 'health', 'monitor'],
        component: <DeploymentStatusDashboard environment="Production" />,
        text: "Here is the live status of your production environment."
    }
];

export const useTambo = () => {
    const [messages, setMessages] = useState([
        { id: 'welcome', role: 'assistant', content: 'Ready to deploy. Ask me to "Analyze current project" or "Deploy to Vercel".' }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => setInput(e.target.value);

    const submit = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // Simulation delay for "Thinking"
        const delay = Math.random() * 800 + 600;

        setTimeout(() => {
            const lowerInput = userMsg.content.toLowerCase();
            const decision = GENERATIVE_DECISIONS.find(d =>
                d.trigger.some(t => lowerInput.includes(t))
            );

            const aiMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: decision ? decision.text : "I processed that request but no specific UI component was needed.",
                component: decision ? decision.component : null,
                toolInvocations: decision ? [{ toolName: decision.trigger[0] }] : [] // For Debugger
            };

            setMessages(prev => [...prev, aiMsg]);
            setIsLoading(false);
        }, delay);
    };

    return {
        messages,
        input,
        setInput, // Exposed for scenarios
        handleInputChange,
        submit,
        isLoading
    };
};
