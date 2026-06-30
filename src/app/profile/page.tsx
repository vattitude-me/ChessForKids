'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AVATAR_PRESETS, useProfileStore } from '@/lib/profile-store';
import { useGameStore } from '@/lib/store';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, username, signOut } = useAuth();
  const { profile, updateAvatar, updateDisplayName } = useProfileStore();
  const stats = useGameStore((s) => s.stats);

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.displayName || username || '');
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const currentAvatar = AVATAR_PRESETS.find((a) => a.id === profile?.avatarId) || AVATAR_PRESETS[0];

  const handleSaveName = () => {
    if (newName.trim()) {
      updateDisplayName(newName.trim());
      setEditingName(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowSignOutConfirm(false);
  };

  if (!user) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="text-[#c4b5e0]">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 py-6 md:pt-24 max-w-lg mx-auto">
      {/* Back button */}
      <Link href="/" className="inline-flex items-center gap-2 text-[#c4b5e0] hover:text-white mb-6 transition-colors">
        <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        <span className="text-sm font-medium">Back</span>
      </Link>

      {/* Profile Header */}
      <div className="fantasy-card p-6 rounded-2xl text-center mb-6">
        <div className="text-6xl mb-3">{currentAvatar.emoji}</div>
        {editingName ? (
          <div className="flex items-center gap-2 justify-center mb-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-center focus:outline-none focus:border-purple-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
            <button onClick={handleSaveName} className="text-green-400 hover:text-green-300 text-sm font-bold">Save</button>
            <button onClick={() => setEditingName(false)} className="text-red-400 hover:text-red-300 text-sm font-bold">Cancel</button>
          </div>
        ) : (
          <h1 className="text-2xl font-black text-white mb-1">
            {profile?.displayName || username}
            <button
              onClick={() => { setNewName(profile?.displayName || username || ''); setEditingName(true); }}
              className="ml-2 text-[#c4b5e0] hover:text-white text-sm align-middle"
              title="Edit name"
            >
              ✏️
            </button>
          </h1>
        )}
        <p className="text-[#9a95b0] text-sm">@{username}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="text-xl font-black text-[#ffd700]">{stats.level}</div>
            <div className="text-[10px] text-[#9a95b0] uppercase tracking-wide">Level</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <div className="text-xl font-black text-white">{stats.totalGames}</div>
            <div className="text-[10px] text-[#9a95b0] uppercase tracking-wide">Games</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <div className="text-xl font-black text-green-400">{stats.wins}</div>
            <div className="text-[10px] text-[#9a95b0] uppercase tracking-wide">Wins</div>
          </div>
        </div>
      </div>

      {/* Avatar Selection */}
      <div className="fantasy-card p-5 rounded-2xl mb-6">
        <h2 className="text-sm font-bold text-[#c4b5e0] uppercase tracking-wide mb-3">Change Avatar</h2>
        <div className="grid grid-cols-6 gap-2">
          {AVATAR_PRESETS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => updateAvatar(avatar.id)}
              className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                profile?.avatarId === avatar.id
                  ? 'bg-purple-600/50 border-2 border-purple-400 scale-110 shadow-lg shadow-purple-500/30'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105'
              }`}
              title={avatar.label}
            >
              {avatar.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Account Section */}
      <div className="fantasy-card p-5 rounded-2xl">
        <h2 className="text-sm font-bold text-[#c4b5e0] uppercase tracking-wide mb-3">Account</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-white/70">Username</span>
            <span className="text-sm text-white font-medium">@{username}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-white/70">Member since</span>
            <span className="text-sm text-white font-medium">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
            </span>
          </div>

          <hr className="border-white/10" />

          {/* Sign Out */}
          {showSignOutConfirm ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-sm text-red-300 mb-3">Are you sure you want to sign out?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors"
                >
                  Sign Out
                </button>
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-bold transition-all"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
