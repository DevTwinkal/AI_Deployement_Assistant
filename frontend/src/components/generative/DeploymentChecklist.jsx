import React, { useState } from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export default function DeploymentChecklist({ target = "Vercel" }) {
    const [steps, setSteps] = useState([
        { id: 1, label: "Install Dependencies", status: "completed" },
        { id: 2, label: "Run Linter", status: "completed" },
        { id: 3, label: "Build Application", status: "running" },
        { id: 4, label: "Check Env Variables", status: "pending" },
        { id: 5, label: "Deploy to Production", status: "pending" }
    ]);

    return (
        <div className="p-6 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl">
            <h3 className="text-xl font-bold text-slate-100 mb-4">
                Deployment to {target}
            </h3>

            <div className="space-y-4 relative">
                {/* Connection Line */}
                <div className="absolute left-[11px] top-2 bottom-4 w-0.5 bg-slate-700 -z-10"></div>

                {steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-4">
                        <div className={`
              w-6 h-6 rounded-full flex items-center justify-center border-2 bg-slate-800
              ${step.status === 'completed' ? 'border-emerald-500 text-emerald-500' :
                                step.status === 'running' ? 'border-blue-500 text-blue-500 animate-pulse' :
                                    'border-slate-600 text-slate-600'}
            `}>
                            {step.status === 'completed' ? <CheckCircle2 size={14} /> :
                                step.status === 'running' ? <div className="w-2 h-2 bg-blue-500 rounded-full" /> :
                                    <Circle size={14} />}
                        </div>

                        <div className={`p-3 rounded-lg flex-1 border ${step.status === 'running' ? 'bg-slate-700/50 border-blue-500/30' :
                                'bg-slate-800 border-slate-700'
                            }`}>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm font-medium ${step.status === 'completed' ? 'text-emerald-400' :
                                        step.status === 'running' ? 'text-blue-400' : 'text-slate-400'
                                    }`}>{step.label}</span>

                                {step.status === 'running' && (
                                    <span className="text-xs text-blue-400 animate-pulse">Processing...</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2">
                View Logs <ArrowRight size={16} />
            </button>
        </div>
    );
}
