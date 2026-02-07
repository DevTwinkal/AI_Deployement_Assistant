import { Github } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function GitHubLogin() {
    const { login } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-xl shadow-2xl max-w-md mx-auto mt-20">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <Github size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400 text-center mb-8">
                Connect your GitHub account to access your repositories and deploy in seconds.
            </p>

            <button
                onClick={login}
                className="flex items-center gap-3 bg-white text-black hover:bg-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-white/20 w-full justify-center"
            >
                <Github size={24} />
                Sign in with GitHub
            </button>
        </div>
    );
}

export default GitHubLogin;
