import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: loginWithContext } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await loginWithContext(email, password);
      setSuccess(true);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-black to-purple-950 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-zinc-900/80 to-black/80 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(99,102,241,0.15)] transition-all hover:shadow-[0_0_60px_rgba(99,102,241,0.25)]">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-indigo-300 transition-all duration-300 group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Home</span>
        </button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">Welcome Back</h1>
          <p className="text-sm text-zinc-400">Sign in to continue your journey</p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="group">
          <label className="block text-sm font-medium mb-2 text-zinc-300 group-focus-within:text-indigo-300 transition-colors">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:bg-black/60 hover:border-white/20"
            required
          />
        </div>
        <div className="group">
          <label className="block text-sm font-medium mb-2 text-zinc-300 group-focus-within:text-indigo-300 transition-colors">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:bg-black/60 hover:border-white/20"
            required
          />
        </div>
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 animate-pulse">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 animate-pulse">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-emerald-400 text-sm font-medium">Login successful! Redirecting...</p>
            </div>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 font-semibold hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
          <p className="text-sm text-center text-zinc-400">
            New to HireMate?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Create an account
            </Link>
          </p>
          <p className="text-sm text-center text-zinc-400">
            <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;