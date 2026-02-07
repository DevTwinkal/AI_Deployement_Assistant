import React, { useEffect, useState } from 'react';
import { Activity, Globe, Server, Clock } from 'lucide-react';

export default function DeploymentStatusDashboard({ environment = "Production" }) {
    const [cpu, setCpu] = useState(24);
    const [mem, setMem] = useState(41);

    useEffect(() => {
        const interval = setInterval(() => {
            setCpu(Prev => Math.min(100, Math.max(0, Prev + (Math.random() - 0.5) * 10)));
            setMem(Prev => Math.min(100, Math.max(0, Prev + (Math.random() - 0.5) * 5)));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-6 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Globe size={20} className="text-blue-400" />
                        {environment} Status
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Operational • us-east-1
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500">Uptime</div>
                    <div className="font-mono text-emerald-400">99.99%</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* CPU Card */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity size={14} className="text-amber-400" />
                        <span className="text-xs text-slate-400 uppercase">CPU Load</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-slate-200">{Math.round(cpu)}%</span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full mb-2">
                            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${cpu}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Mem Card */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Server size={14} className="text-purple-400" />
                        <span className="text-xs text-slate-400 uppercase">Memory</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-slate-200">{Math.round(mem)}%</span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full mb-2">
                            <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${mem}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-400 font-mono">
                <span>Latest Deploy: 4m ago</span>
                <span className="flex items-center gap-1"><Clock size={12} /> v2.4.0</span>
            </div>
        </div>
    );
}
