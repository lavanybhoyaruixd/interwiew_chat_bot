import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJson } from '../api/http.js';
import { API_BASE } from '../api/base.js';

export default function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchJson(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        body: { currentPassword, newPassword }
      }, { auth: 'required' });

      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-neutral-900 px-4 py-10">
      <main className="container mx-auto">
        <div className="max-w-xl mx-auto rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur p-6 shadow-2xl">
          <h1 className="text-2xl font-semibold text-white">Change Password</h1>
          <p className="text-sm text-zinc-400 mt-1">Update your account password</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm mb-1 text-zinc-300">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                required
                disabled={loading || success}
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-zinc-300">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                required
                minLength={6}
                disabled={loading || success}
              />
              <p className="text-xs text-zinc-500 mt-1">At least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm mb-1 text-zinc-300">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                required
                disabled={loading || success}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                <p className="text-emerald-400 text-sm">Password changed successfully! Redirecting...</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                disabled={loading || success}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className="ml-auto px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
