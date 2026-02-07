import React, { useEffect, useState } from 'react';
import { Package, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ProjectAnalyzer({ path }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        // Simulate MCP Tool Call: analyze_project(path)
        setTimeout(() => {
            setData({
                stack: "Next.js 14",
                language: "TypeScript",
                dependencies: 24,
                healthScore: 85,
                issues: [
                    { id: 1, text: "Missing .dockerignore", severity: "medium" },
                    { id: 2, text: "Environment variables not secured", severity: "high" }
                ]
            });
            setLoading(false);
        }, 1500);
    }, [path]);

    if (loading) return (
        <div className="p-6 bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 animate-pulse">
            <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <ShieldCheck size={100} className="text-emerald-500" />
            </div>

            <h3 className="text-xl font-bold text-slate-100 mb-1 flex items-center gap-2">
                <Package className="text-blue-400" /> Project Analysis
            </h3>
            <p className="text-slate-400 text-sm mb-6 font-mono">{path}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-900/50 rounded-lg">
                    <div className="text-xs text-slate-500 uppercase">Framework</div>
                    <div className="text-lg font-semibold text-white">{data.stack}</div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                    <div className="text-xs text-slate-500 uppercase">Health Score</div>
                    <div className="text-lg font-semibold text-emerald-400">{data.healthScore}/100</div>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Detected Issues</h4>
                {data.issues.map((issue) => (
                    <div key={issue.id} className="flex items-center gap-3 p-2 rounded bg-slate-900/30 border border-slate-800/50">
                        <AlertTriangle size={16} className={issue.severity === 'high' ? 'text-rose-500' : 'text-amber-500'} />
                        <span className="text-sm text-slate-300">{issue.text}</span>
                        <button className="ml-auto text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600/30 transition">
                            Fix
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
