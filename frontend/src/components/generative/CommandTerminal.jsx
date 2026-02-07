import React, { useEffect, useState, useRef } from 'react';
import { Terminal } from 'lucide-react';

const MOCK_LOGS = [
    "> next build",
    "- info Creating an optimized production build...",
    "- info Compiled successfully",
    "- info Linting and checking validity of types...",
    "- info Collecting page data...",
    "- info Generating static pages (5/5)",
    "- info Finalizing page optimization...",
    "- info First Load JS shared by all 74.3 kB",
    "   chunks/framework-c04026.js  45.2 kB",
    "   chunks/main-062e12.js       28.4 kB",
    "   chunks/pages/_app-349033.js 298 B",
    " ",
    "Route (pages)                              Size     First Load JS",
    "┌ ○ /                                      540 B          74.8 kB",
    "├   /_app                                  0 B            74.3 kB",
    "└ ○ /404                                   182 B          74.5 kB",
    "+ First Load JS shared by all              74.3 kB",
    " ",
    "λ  (Server)  server-side renders at runtime (uses getInitialProps or getServerSideProps)",
    "○  (Static)  automatically rendered as static HTML (uses no initial props)",
];

export default function CommandTerminal({ command = "npm run build" }) {
    const [logs, setLogs] = useState([`$ ${command}`]);
    const bottomRef = useRef(null);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i >= MOCK_LOGS.length) {
                clearInterval(interval);
                return;
            }
            setLogs(prev => [...prev, MOCK_LOGS[i]]);
            i++;
        }, 300); // Stream effect

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="bg-[#0D1117] rounded-xl border border-slate-700 shadow-2xl overflow-hidden font-mono text-sm">
            {/* Title Bar */}
            <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="ml-2 text-slate-400 text-xs flex items-center gap-1">
                    <Terminal size={12} /> bash — 80x24
                </div>
            </div>

            {/* Content */}
            <div className="p-4 h-64 overflow-y-auto space-y-1">
                {logs.map((line, idx) => (
                    <div key={idx} className="text-slate-300 break-all whitespace-pre-wrap">
                        {line.startsWith('$') || line.startsWith('>') ?
                            <span className="text-emerald-400 font-bold">{line}</span> :
                            line.includes('error') ?
                                <span className="text-rose-400">{line}</span> :
                                line.includes('info') ?
                                    <span className="text-blue-300">{line}</span> :
                                    line
                        }
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
