import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/login', { email, password });
      navigate('/admin');
    } catch (err) {
      if (err.data && err.data.error) {
        setError(err.data.error);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-brand-500/30 selection:text-brand-900 relative bg-slate-900 overflow-hidden">
      {/* Background Mesh (Same as Landing Page for consistency) */}
      <div className="absolute inset-0 mesh-bg z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-brand-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-fuchsia-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-6">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-slate-400">Sign in to manage your leads</p>
        </div>

        <div className="glass-card py-8 px-4 sm:rounded-[2rem] sm:px-10 relative overflow-hidden mx-4 sm:mx-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />
          
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 ml-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-5 py-4 glass-input rounded-2xl focus-ring transition-all duration-300 outline-none"
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 ml-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-5 py-4 glass-input rounded-2xl focus-ring transition-all duration-300 outline-none"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-brand-500 to-fuchsia-500 hover:shadow-[0_0_30px_-5px_rgba(217,70,239,0.5)] hover:-translate-y-0.5 focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300 mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Sign in to Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
