import { useState, useEffect } from 'react';
import { getMyRepos } from '../services/api';
import { GitBranch, Lock, Globe, Search, Loader2 } from 'lucide-react';

function RepoList({ onSelect }) {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchRepos();
    }, []);

    const fetchRepos = async () => {
        try {
            const data = await getMyRepos();
            setRepos(data);
        } catch (err) {
            setError('Failed to fetch repositories');
        } finally {
            setLoading(false);
        }
    };

    const filteredRepos = repos.filter(repo =>
        repo.full_name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center p-12 text-purple-400">
            <Loader2 className="animate-spin" size={32} />
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-400 bg-red-900/10 rounded-xl border border-red-900/50">
            {error}
            <button onClick={fetchRepos} className="block mx-auto mt-4 text-sm underline hover:text-red-300">Retry</button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <Search className="text-slate-500" size={20} />
                <input
                    type="text"
                    placeholder="Search repositories..."
                    className="bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-600 flex-1"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredRepos.map(repo => (
                    <div
                        key={repo.id}
                        onClick={() => onSelect(repo.html_url)}
                        className="group p-4 bg-slate-900/30 border border-slate-800 rounded-xl hover:border-purple-500/50 hover:bg-slate-800/50 transition-all cursor-pointer flex flex-col gap-2"
                    >
                        <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-slate-200 group-hover:text-purple-300 truncate pr-2">
                                {repo.name}
                            </h3>
                            {repo.private ? <Lock size={14} className="text-yellow-500/50" /> : <Globe size={14} className="text-emerald-500/50" />}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 h-8">
                            {repo.description || 'No description provided'}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            {repo.language && (
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-purple-500/50" />
                                    {repo.language}
                                </span>
                            )}
                            <span className="text-slate-600">Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RepoList;
