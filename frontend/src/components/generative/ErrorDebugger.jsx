import React from 'react';
import { AlertOctagon, Bug, ArrowRight } from 'lucide-react';

export default function ErrorDebugger({ error = "Build failed", context = "" }) {
    return (
        <div className="p-5 bg-rose-950/30 border border-rose-900/50 rounded-xl backdrop-blur-md">
            <div className="flex items-start gap-4 mb-4">
                <div className="mt-1 p-2 bg-rose-900/50 rounded-lg text-rose-400">
                    <Bug size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-rose-200">Error Detected</h3>
                    <p className="text-rose-300/80 text-sm font-mono mt-1">{error}</p>
                </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 mb-4">
                <h4 className="text-xs uppercase text-slate-500 font-semibold mb-2">Analysis</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                    {context || "The build failed likely due to a version mismatch in Node.js modules based on the stack trace."}
                </p>
            </div>

            <div className="flex gap-2">
                <button className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                    <AlertOctagon size={14} /> Attempt Auto-Fix
                </button>
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition">
                    Stack Trace
                </button>
            </div>
        </div>
    );
}
