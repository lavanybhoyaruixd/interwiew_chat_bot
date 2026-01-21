import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-black to-indigo-950 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-purple-500/20 bg-gradient-to-b from-zinc-900/80 to-black/80 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.15)] transition-all hover:shadow-[0_0_60px_rgba(168,85,247,0.25)]">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-purple-300 transition-all duration-300 group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Home</span>
        </button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">Join HireMate</h1>
          <p className="text-sm text-zinc-400">Start your interview preparation journey</p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="group">
          <label className="block text-sm font-medium mb-2 text-zinc-300 group-focus-within:text-purple-300 transition-colors">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:bg-black/60 hover:border-white/20"
            required
          />
        </div>

        <div className="group">
          <label className="block text-sm font-medium mb-2 text-zinc-300 group-focus-within:text-purple-300 transition-colors">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:bg-black/60 hover:border-white/20"
            required
          />
        </div>

        <div className="group">
          <label className="block text-sm font-medium mb-2 text-zinc-300 group-focus-within:text-purple-300 transition-colors">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:bg-black/60 hover:border-white/20"
            required
          />
        </div>

        <div className="group">
          <label className="block text-sm font-medium mb-2 text-zinc-300 group-focus-within:text-purple-300 transition-colors">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:bg-black/60 hover:border-white/20"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 font-semibold hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

        <p className="text-sm text-center mt-6 pt-6 border-t border-white/10 text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
