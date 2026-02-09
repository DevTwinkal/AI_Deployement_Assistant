import { useState } from 'react';
import { connectRepo, deployToVercel } from './services/api';
import { Bot, GitBranch, Rocket, Terminal, CheckCircle, Loader2, Play, Package, Folder, ExternalLink, LogOut, Link2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import GitHubLogin from './components/GitHubLogin';
import RepoList from './components/RepoList';

function App() {
  const { user, loading, logout } = useAuth();
  const [repoUrl, setRepoUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle, connecting, analyzing, ready, deploying, deployed, error
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [deployUrl, setDeployUrl] = useState(null);
  const [showRepoList, setShowRepoList] = useState(false);

  const handleConnect = async (e) => {
    if (e) e.preventDefault();
    if (!repoUrl) return;

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

  if (status === 'error' && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-red-400 p-4 font-sans text-center">
        <Bot size={64} className="mb-6 opacity-30 animate-pulse text-purple-500" />
        <h1 className="text-3xl font-bold mb-3 text-slate-100">Connection Interrupted</h1>
        <p className="text-slate-400 mb-8 max-w-lg leading-relaxed">
          We encountered a problem validating your session or reaching the deployment engine.
          Please ensure your local backend is running on port 3000.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all active:scale-95"
          >
            Retry Connection
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

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

  const handleRepoSelect = (url) => {
    setRepoUrl(url);
    setShowRepoList(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-purple-400">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-slate-950"></div>
        <div className="relative z-10 w-full px-4 max-w-4xl mx-auto flex flex-col items-center">
          <header className="mb-12 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-purple-600/20 rounded-2xl mb-6 text-purple-400">
              <Bot size={48} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent mb-4">
              AI Deployment Copilot
            </h1>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto">
              Deploy any GitHub repository to the cloud in seconds.
              Full-stack autonomous deployment with zero configuration.
            </p>
          </header>
          <GitHubLogin />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-purple-500/30">

      {/* Sidebar */}
      <div className="w-16 md:w-20 border-r border-slate-800 flex flex-col items-center py-6 gap-6 bg-slate-900/50 backdrop-blur-xl fixed md:static h-full z-50">
        <div className="p-3 bg-purple-600/20 rounded-xl text-purple-400 mb-4">
          <Bot size={28} />
        </div>
        <div className="flex flex-col gap-6 w-full items-center">
          <div className="p-3 text-slate-200 bg-slate-800/50 rounded-lg cursor-pointer transition-colors" title="Deploy"><Rocket size={24} /></div>
          <div className="p-3 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer" title="Logs"><Terminal size={24} /></div>
        </div>
        <div className="mt-auto mb-4 p-3 text-slate-500 hover:text-red-400 transition-colors cursor-pointer" onClick={logout} title="Logout">
          <LogOut size={24} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-6xl mx-auto p-6 md:p-8 ml-16 md:ml-0 w-full">

        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
              Deployment Dashboard
            </h1>
            <p className="text-slate-400">Manage your deployments and repositories</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
            {user.avatar_url ? (
              <img src={user.avatar_url} className="w-8 h-8 rounded-full border border-slate-700" alt="Avatar" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold">
                {user.login?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-medium text-slate-300">{user.login}</span>
          </div>
        </header>

        {/* Input Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          <div className="flex gap-2 mb-6 border-b border-slate-800/50 pb-1">
            <button
              onClick={() => setShowRepoList(false)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[5px] ${!showRepoList ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              <span className="flex items-center gap-2"><Link2 size={16} /> Direct URL</span>
            </button>
            <button
              onClick={() => setShowRepoList(true)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[5px] ${showRepoList ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              <span className="flex items-center gap-2"><GitBranch size={16} /> Select Repository</span>
            </button>
          </div>

          {showRepoList ? (
            <RepoList onSelect={handleRepoSelect} />
          ) : (
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
                disabled={status === 'connecting' || status === 'deploying' || !repoUrl}
                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 min-w-[160px]"
              >
                {status === 'connecting' ? <Loader2 className="animate-spin" /> : <GitBranch size={20} />}
                Connect
              </button>
            </form>
          )}
        </div>

        {/* Results & Logs Grid */}
        <div className="grid md:grid-cols-2 gap-8 flex-1 min-h-[500px]">

          {/* Analysis & Control Panel */}
          <div className={`flex flex-col gap-6 transition-all duration-500 ${data ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none'}`}>

            {/* Intelligence Card */}
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6 relative overflow-hidden h-full">
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
                      <code className="text-sm bg-black/30 px-2 py-1 rounded text-orange-300 font-mono block overflow-x-auto">
                        {data.analysis.buildCommand || 'N/A'}
                      </code>
                    </div>
                    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm">
                        <Folder size={14} /> Output Dir
                      </div>
                      <code className="text-sm bg-black/30 px-2 py-1 rounded text-purple-300 font-mono block overflow-x-auto">
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
          <div className="bg-black/80 border border-slate-800 rounded-2xl p-6 font-mono text-sm relative overflow-hidden shadow-2xl flex flex-col h-full min-h-[400px]">
            <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900/80 border-b border-slate-800 flex items-center px-4 gap-2 z-10">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              <span className="ml-2 text-xs text-slate-500">deployment-copilot-log</span>
            </div>
            <div className="mt-8 flex flex-col gap-2 text-slate-300 overflow-y-auto flex-1 font-mono text-xs md:text-sm p-2 scroll-smooth custom-scrollbar">
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
