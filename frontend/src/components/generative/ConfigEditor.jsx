import React, { useState } from 'react';
import { FileText, Save, Check } from 'lucide-react';

export default function ConfigEditor({ file = "Dockerfile", suggestedContent = "" }) {
    const [content, setContent] = useState(suggestedContent);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // Simulate MCP Tool Call: generate_config
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="flex flex-col h-full bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-900/50">
                <div className="flex items-center gap-2 text-slate-200 font-medium text-sm">
                    <FileText size={16} className="text-blue-400" />
                    {file}
                </div>
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition
            ${saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}
          `}
                >
                    {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Apply Changes</>}
                </button>
            </div>

            <div className="flex-1 relative">
                <textarea
                    className="w-full h-64 bg-[#0d1117] text-slate-300 p-4 font-mono text-sm resize-none focus:outline-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    spellCheck="false"
                />
            </div>
        </div>
    );
}
