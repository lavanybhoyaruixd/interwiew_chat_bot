import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { fetchJson } from '../api/http.js';
import { API_BASE } from '../api/base.js';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, reload, loading: authLoading } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchJson(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        body: { name: name.trim() }
      }, { auth: 'required' });

      if (data.success) {
        setSuccess(true);
        await reload();
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-neutral-900 px-4 py-10">
      <main className="container mx-auto">
        <div className="max-w-xl mx-auto rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur p-6 shadow-2xl">
          <h1 className="text-2xl font-semibold text-white">Edit Profile</h1>
          <p className="text-sm text-zinc-400 mt-1">Update your account information</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm mb-1 text-zinc-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                placeholder="Your name"
                disabled={loading || authLoading}
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-zinc-300">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-zinc-500 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                <p className="text-emerald-400 text-sm">Profile updated successfully! Redirecting...</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || authLoading || success}
                className="ml-auto px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
