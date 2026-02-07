import { useState } from 'react';
import { connectRepo, deployToVercel } from './services/api';
import { Bot, GitBranch, Rocket, Terminal, CheckCircle, Loader2, Play, Package, Folder, ExternalLink } from 'lucide-react';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle, connecting, analyzing, ready, deploying, deployed, error
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [deployUrl, setDeployUrl] = useState(null);

  const handleConnect = async (e) => {
    e.preventDefault();
    setStatus('connecting');
    setLogs([`> Connecting to ${repoUrl}...`]);
    setDeployUrl(null);
    setData(null);

    try {
      const result = await connectRepo(repoUrl);
      setData(result);
      setStatus('ready');
      addLog(`Successfully connected! ID: ${result.workspaceId}`);
      if (result.analysis) {
        addLog(`Analysis Complete: Detected ${result.analysis.language} (${result.analysis.framework})`);
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      addLog(`Error: ${error.message}`);
    }
  };

  const handleDeploy = () => {
    if (!data) return;
    setStatus('deploying');
    setLogs([]); // Clear previous logs
    addLog("Initializing Vercel Deployment Pipeline...");

    deployToVercel(
      data.workspaceId,
      data.analysis,
      (msg) => addLog(msg),
      (url) => {
        addLog(`Deployment Successful! ${url}`);
        setDeployUrl(url);
        setStatus('deployed');
      },
      (err) => {
        addLog(`Deployment Failed: ${err}`);
        setStatus('error');
      }
    );
  };

  const addLog = (msg) => {
    setLogs(prev => [...prev, `> ${msg}`]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-purple-500/30">

      {/* Sidebar */}
      <div className="w-16 md:w-20 border-r border-slate-800 flex flex-col items-center py-6 gap-6 bg-slate-900/50 backdrop-blur-xl">
        <div className="p-3 bg-purple-600/20 rounded-xl text-purple-400">
          <Bot size={28} />
        </div>
        <div className="h-full flex flex-col gap-6">
          <div className="p-3 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"><GitBranch size={24} /></div>
          <div className="p-3 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"><Terminal size={24} /></div>
          <div className={`p-3 transition-colors cursor-pointer ${status === 'deploying' ? 'text-purple-400 animate-pulse' : 'text-slate-500 hover:text-slate-200'}`}><Rocket size={24} /></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto p-6 md:p-12">

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent mb-4">
            AI Deployment Copilot
          </h1>
          <p className="text-slate-400 text-lg">
            Deploy any GitHub repository to the cloud in seconds, powered by AI.
          </p>
        </header>

        {/* Input Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl mb-8">
          <form onSubmit={handleConnect} className="flex gap-4 flex-col md:flex-row">
            <input
              type="url"
              placeholder="https://github.com/username/repo"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-slate-600 transition-all shadow-inner"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
              disabled={status === 'deploying' || status === 'connecting'}
            />
            <button
              type="submit"
              disabled={status === 'connecting' || status === 'deploying'}
              className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'connecting' ? <Loader2 className="animate-spin" /> : <GitBranch size={20} />}
              Connect
            </button>
          </form>
        </div>

        {/* Results & Logs Grid */}
        <div className="grid md:grid-cols-2 gap-8 flex-1">

          {/* Analysis & Control Panel */}
          <div className={`flex flex-col gap-6 transition-all duration-500 ${data ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>

            {/* Intelligence Card */}
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6 relative overflow-hidden">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-200">
                <CheckCircle size={20} className={data ? "text-emerald-500" : "text-slate-600"} />
                Project Intelligence
              </h3>

              {data && data.analysis && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                      <Package size={24} />
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm block">Framework</span>
                      <span className="text-xl font-medium text-blue-300">{data.analysis.framework}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm">
                        <Play size={14} /> Build Command
                      </div>
                      <code className="text-sm bg-black/30 px-2 py-1 rounded text-orange-300 font-mono">
                        {data.analysis.buildCommand || 'N/A'}
                      </code>
                    </div>
                    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm">
                        <Folder size={14} /> Output Dir
                      </div>
                      <code className="text-sm bg-black/30 px-2 py-1 rounded text-purple-300 font-mono">
                        {data.analysis.outputDirectory}
                      </code>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Deployment Action Card */}
            {status !== 'idle' && status !== 'connecting' && (
              <div className="bg-gradient-to-br from-purple-900/20 to-slate-900/50 border border-purple-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-in slide-in-from-bottom-4 duration-700">

                {deployUrl ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 mb-2">
                      <Rocket size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Live on Production!</h3>
                    <a href={deployUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20">
                      Visit Website <ExternalLink size={18} />
                    </a>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-2 text-white">Ready to Ship?</h3>
                    <p className="text-slate-400 mb-6">AI has generated the optimal build configuration.</p>
                    <button
                      onClick={handleDeploy}
                      disabled={status === 'deploying'}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {status === 'deploying' ? <Loader2 className="animate-spin" /> : <Rocket size={24} />}
                      {status === 'deploying' ? 'Deploying...' : 'Trigger Vercel Deployment'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Terminal Log */}
          <div className="bg-black/80 border border-slate-800 rounded-2xl p-6 font-mono text-sm relative overflow-hidden shadow-2xl h-[500px] flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900/80 border-b border-slate-800 flex items-center px-4 gap-2 z-10">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              <span className="ml-2 text-xs text-slate-500">deployment-copilot-log</span>
            </div>
            <div className="mt-8 flex flex-col gap-2 text-slate-300 overflow-y-auto flex-1 font-mono text-xs md:text-sm p-2 scroll-smooth">
              {logs.length === 0 && <span className="text-slate-600 opacity-50">System ready. Connect a repository to begin...</span>}
              {logs.map((log, i) => (
                <div key={i} className="animate-in fade-in slide-in-from-left-4 duration-300 whitespace-pre-wrap break-all border-l-2 border-transparent hover:border-slate-700 pl-2">
                  {log}
                </div>
              ))}
              {(status === 'connecting' || status === 'deploying') && (
                <div className="animate-pulse text-purple-400 pl-2">_</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;
