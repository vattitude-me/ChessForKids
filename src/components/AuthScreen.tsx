'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { AVATAR_PRESETS, useProfileStore } from '@/lib/profile-store';

type Mode = 'login' | 'signup';

const PIECE_CHALLENGES = [
  { piece: '♞', name: 'Knight', options: ['Knight', 'Bishop', 'Rook', 'Pawn'] },
  { piece: '♜', name: 'Rook', options: ['Queen', 'Rook', 'King', 'Bishop'] },
  { piece: '♛', name: 'Queen', options: ['King', 'Queen', 'Bishop', 'Knight'] },
  { piece: '♝', name: 'Bishop', options: ['Pawn', 'Rook', 'Bishop', 'Knight'] },
  { piece: '♚', name: 'King', options: ['Queen', 'King', 'Rook', 'Pawn'] },
  { piece: '♟', name: 'Pawn', options: ['Pawn', 'Knight', 'Bishop', 'Rook'] },
];

function useBotCheck() {
  const [verified, setVerified] = useState(false);
  const [challengeIndex] = useState(() => Math.floor(Math.random() * PIECE_CHALLENGES.length));
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const interactionCount = useRef(0);
  const startTime = useRef(Date.now());

  const challenge = PIECE_CHALLENGES[challengeIndex];

  const recordInteraction = useCallback(() => {
    interactionCount.current++;
  }, []);

  const checkAnswer = useCallback((answer: string) => {
    const elapsed = Date.now() - startTime.current;
    const hasInteractions = interactionCount.current >= 2;
    const tookTime = elapsed > 800;

    if (answer === challenge.name && hasInteractions && tookTime) {
      setVerified(true);
      setWrongAnswer(false);
    } else if (answer !== challenge.name) {
      setWrongAnswer(true);
    } else {
      setWrongAnswer(true);
    }
  }, [challenge.name]);

  return { verified, challenge, checkAnswer, wrongAnswer, recordInteraction };
}

function getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Invalid username or password';
    case 'auth/email-already-in-use':
      return 'This username is already taken';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection';
    default:
      return 'Something went wrong. Please try again';
  }
}

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const { setProfile } = useProfileStore();
  const { verified, challenge, checkAnswer, wrongAnswer, recordInteraction } = useBotCheck();

  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].id);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isUsernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isUsernameValid) {
      setError('Username must be 3-20 characters (letters, numbers, underscore)');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (mode === 'signup' && !doPasswordsMatch) {
      setError('Passwords do not match');
      return;
    }
    if (mode === 'signup' && !verified) {
      setError('Please complete the chess piece challenge below');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(username, password, rememberMe);
      } else {
        await signUp(username, password);
        setProfile({
          displayName: username,
          avatarId: selectedAvatar,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      setError(getErrorMessage(firebaseError.code || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-3">
            <div className="absolute inset-0 rounded-2xl bg-[#1a1035]/80 blur-sm scale-110" />
            <Image
              src="/logo.png"
              alt="Chess for Kids"
              width={72}
              height={72}
              className="relative object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight" style={{ textShadow: '0 2px 12px rgba(108, 92, 231, 0.6), 0 4px 20px rgba(0,0,0,0.4)' }}>
            Chess for <span className="text-[#ffd700]">Kids</span>
          </h1>
          <p className="text-[#c4b5e0] mt-2 text-sm">
            {mode === 'login' ? 'Welcome back, champion!' : 'Join the adventure!'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="fantasy-card p-6 rounded-2xl">
          {/* Mode Toggle */}
          <div className="flex rounded-xl overflow-hidden mb-6 border border-white/10">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'text-[#c4b5e0] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'text-[#c4b5e0] hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-[#c4b5e0] mb-1.5 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                autoComplete="username"
                onFocus={recordInteraction}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#c4b5e0] mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  onFocus={recordInteraction}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4b5e0] hover:text-white text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#c4b5e0] mb-1.5 uppercase tracking-wide">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            )}

            {/* Avatar Selection (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#c4b5e0] mb-2 uppercase tracking-wide">
                  Choose Your Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`w-full aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                        selectedAvatar === avatar.id
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
            )}

            {/* Bot Check (signup only) */}
            {mode === 'signup' && (
              <div className={`rounded-xl p-4 border ${verified ? 'bg-green-500/10 border-green-500/30' : wrongAnswer ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[#c4b5e0] uppercase tracking-wide">
                    {verified ? '✓ Verified!' : 'Prove you\'re a real player'}
                  </span>
                </div>
                {!verified && (
                  <>
                    <p className="text-white text-sm mb-3">
                      What chess piece is this? <span className="text-4xl align-middle ml-1">{challenge.piece}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {challenge.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => checkAnswer(option)}
                          className="py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-purple-600/30 hover:border-purple-400/50 transition-all"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {wrongAnswer && (
                      <p className="text-red-300 text-xs mt-2">That&apos;s not right — try again!</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Remember Me (login only) */}
            {mode === 'login' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-[#c4b5e0]">Remember me</span>
              </label>
            )}

            {/* Error */}
            {error && (
              <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="sparkle-btn w-full py-3.5 rounded-xl font-bold text-white text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? '...'
                : mode === 'login'
                ? 'Enter the Realm'
                : 'Begin Your Quest'}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-[#9a95b0] mt-4">
          {mode === 'login'
            ? "Don't have an account? Switch to Sign Up above!"
            : 'Already have an account? Switch to Sign In above!'}
        </p>
      </div>
    </div>
  );
}
