import React, { useEffect, useState } from 'react';
import { Activity, Cpu, Zap, Code, Database, Layers } from 'lucide-react';

export default function TamboDebug({ messages, isStreaming, intent }) {
    // Find the last tool/component call details from REAL messages
    const lastToolCall = messages
        .filter(m => m.role === 'assistant' && m.toolInvocations?.length > 0)
        .pop();

    const toolInfo = lastToolCall?.toolInvocations?.[0];
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            onClick={() => setExpanded(!expanded)}
            className={`fixed bottom-24 right-4 bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl backdrop-blur-md font-mono z-50 transition-all duration-300 overflow-hidden cursor-pointer hover:border-blue-500/30 ${expanded ? 'w-80' : 'w-64'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-purple-400" />
                    <span className="font-bold text-xs text-slate-300">Tambo Knowledge Graph</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                    <span className="text-[10px] text-slate-500">{isStreaming ? 'STREAMING' : 'IDLE'}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-3">
                {/* Intent Section */}
                <div>
                    <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1 flex items-center gap-1">
                        <Zap size={10} /> User Intent
                    </div>
                    <div className="text-xs text-slate-200 truncate bg-slate-800/50 p-1.5 rounded border border-slate-700/50">
                        {intent || "Waiting for input..."}
                    </div>
                </div>

                {/* Decision Section */}
                {toolInfo ? (
                    <div className="animate-in fade-in slide-in-from-right duration-300">
                        <div className="text-[10px] uppercase text-slate-500 font-semibold mb-1 flex items-center gap-1">
                            <Database size={10} /> Selected Component
                        </div>
                        <div className="bg-blue-900/20 border border-blue-500/30 p-2 rounded relative overflow-hidden">
                            <div className="flex justify-between items-center z-10 relative">
                                <span className="text-xs font-bold text-blue-300">&lt;{toolInfo.toolName} /&gt;</span>
                                {/* We removed fake confidence. If SDK provides it, use it. Otherwise, show 'Matched' */}
                                <span className="text-[10px] text-emerald-400">MATCHED</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="opacity-50 text-xs text-slate-500 italic">No component triggered</div>
                )}

                {/* Stats */}
                {expanded && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                        <div className="p-2 bg-slate-800 rounded">
                            <div className="text-[10px] text-slate-500">History</div>
                            <div className="text-xs text-slate-300">{messages.length} msgs</div>
                        </div>
                        {/* Removed fake latency */}
                        <div className="p-2 bg-slate-800 rounded">
                            <div className="text-[10px] text-slate-500">SDK Status</div>
                            <div className="text-xs text-emerald-400">Active</div>
                        </div>
                    </div>
                )}

                {!expanded && (
                    <div className="text-[9px] text-center text-slate-600 mt-1">Click to expand details</div>
                )}
            </div>
        </div>
    );
}
