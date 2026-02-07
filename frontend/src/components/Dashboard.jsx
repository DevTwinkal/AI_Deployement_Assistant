import React, { useRef, useEffect, useState } from 'react';
import { useTambo } from '../tambo';
import { Send, Bot, User, Sparkles, PlayCircle, Zap } from 'lucide-react';
import TamboDebug from './TamboDebug';
import { AnimatePresence, motion } from 'framer-motion';

const DEMO_SCENARIOS = [
    { label: "Analyze Project", prompt: "Analyze this project folder for me." },
    { label: "Deploy to Vercel", prompt: "I want to deploy this app to Vercel." },
    { label: "Fix Build Error", prompt: "I'm getting a build error. Can you debug it?" },
    { label: "System Status", prompt: "Show me the production system status." },
];

export default function Dashboard() {
    const { messages, input, handleInputChange, submit, isLoading, setInput } = useTambo();
    const scrollRef = useRef(null);
    const [lastIntent, setLastIntent] = useState(null);

    // Auto-scroll logic to keep the chat view at the bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Track intent for debug diagnostics
    useEffect(() => {
        const lastUser = messages.filter(m => m.role === 'user').pop();
        if (lastUser) setLastIntent(lastUser.content);
    }, [messages]);

    /**
     * Handles scenario clicks by setting the SDK input state and submitting immediately.
     * This ensures the AI processes the prompt exactly as if the user typed it.
     */
    const handleScenarioClick = (prompt) => {
        // Use the official SDK setInput if available, or simulate input change
        if (setInput) {
            setInput(prompt);
        } else {
            const fakeEvent = { target: { value: prompt } };
            handleInputChange(fakeEvent);
        }

        // Allow a render cycle for state update, then submit
        setTimeout(() => {
            document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }, 50);
    };

    return (
        <div className="flex flex-col h-screen bg-[#0f172a] text-slate-100 overflow-hidden relative font-sans selection:bg-blue-500/30">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            {/* Header */}
            <header className="p-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur z-10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight leading-none">AI Deployment Copilot</h1>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-wide">POWERED BY TAMBO SDK</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        Tambo Active
                    </div>
                </div>
            </header>

            {/* Enhanced Debug Panel */}
            <TamboDebug messages={messages} isStreaming={isLoading} intent={lastIntent} />

            {/* Main Feed */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 space-y-8 animate-in fade-in duration-700">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                            <Bot size={64} className="text-slate-400 relative z-10" />
                        </div>
                        <div className="text-center max-w-md space-y-2">
                            <h2 className="text-2xl font-bold text-slate-200">Ready to Deploy?</h2>
                            <p>I can analyze projects, fix configs, and manage deployments.</p>
                        </div>

                        {/* Demo Scenarios Grid - Triggers real SDK pipeline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                            {DEMO_SCENARIOS.map((scenario) => (
                                <button
                                    key={scenario.label}
                                    onClick={() => handleScenarioClick(scenario.prompt)}
                                    className="flex items-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all group text-left"
                                >
                                    <div className="p-2 bg-slate-900 rounded-lg group-hover:text-blue-400 transition-colors">
                                        <Zap size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-200 group-hover:text-blue-100">{scenario.label}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-[150px]">{scenario.prompt}</div>
                                    </div>
                                    <PlayCircle size={16} className="ml-auto opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="max-w-5xl mx-auto space-y-6">
                    {messages.map((msg, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            key={msg.id || idx}
                            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >

                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 mt-2 shadow-lg">
                                    <Bot size={16} className="text-white" />
                                </div>
                            )}

                            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-full ${msg.component ? 'w-full lg:w-3/4' : 'max-w-2xl'}`}>
                                {/* AI Response Text */}
                                {msg.content && (
                                    <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-bl-none backdrop-blur-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                )}

                                {/* Generative UI Container - Renders ONLY when SDK streams a tool match */}
                                {msg.component && (
                                    <div className="mt-4 w-full transform origin-top-left transition-all duration-500">
                                        <div className="relative group">
                                            {/* AI Verification Label */}
                                            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-indigo-500/90 text-[10px] font-bold text-white rounded-full shadow-lg z-10 flex items-center gap-1 backdrop-blur-md">
                                                <Sparkles size={8} /> GENERATED UI
                                            </div>
                                            {/* Component Slot */}
                                            <div className="ring-1 ring-white/10 rounded-xl overflow-hidden shadow-2xl bg-black/20">
                                                {msg.component}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-2">
                                    <User size={16} />
                                </div>
                            )}

                        </motion.div>
                    ))}

                    {/* Streaming Loading State */}
                    {isLoading && (
                        <div className="flex gap-4 justify-start animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                <Bot size={16} className="text-slate-400" />
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 font-mono mt-2 bg-slate-800/30 px-3 py-1.5 rounded-full">
                                <span className="animate-pulse">Analyzing intent...</span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </main>

            {/* Input Area */}
            <footer className="p-4 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur z-10">
                <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="max-w-4xl mx-auto relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 group-focus-within:opacity-100 transition duration-500 blur"></div>
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type a command (e.g., 'Deploy to AWS', 'Fix this config')"
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:bg-slate-800 transition shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-full transition text-white shadow-lg"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </footer>
        </div>
    );
}
