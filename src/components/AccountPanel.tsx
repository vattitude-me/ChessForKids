'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const PIECES = [
  { glyph: '♞', name: 'Knight' },
  { glyph: '♜', name: 'Rook' },
  { glyph: '♛', name: 'Queen' },
  { glyph: '♝', name: 'Bishop' },
];

function errorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Wrong username or password.';
    case 'auth/email-already-in-use':
      return 'That username is taken. Try another one!';
    case 'auth/weak-password':
      return 'Password needs at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many tries. Please wait a bit.';
    case 'auth/network-request-failed':
      return 'No internet connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

/** Optional parent account for saving progress across devices. */
export default function AccountPanel() {
  const { user, username, cloudEnabled, signIn, signUp, signOut, syncing } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [challenge] = useState(() => PIECES[Math.floor(Math.random() * PIECES.length)]);
  const [answer, setAnswer] = useState('');

  if (!cloudEnabled) {
    return (
      <div className="rounded-2xl bg-cream p-4 text-sm font-semibold text-muted">
        Progress is saved on this device. Cloud accounts aren&apos;t set up for this site.
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-extrabold">Signed in as {username}</p>
          <p className="text-sm font-semibold text-muted">{syncing ? 'Syncing…' : 'Your progress is saved to the cloud ☁️'}</p>
        </div>
        <button className="btn btn-white btn-sm" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(name.trim())) {
      setError('Username: 3–20 letters, numbers or _');
      return;
    }
    if (password.length < 6) {
      setError('Password needs at least 6 characters.');
      return;
    }
    if (mode === 'signup' && answer !== challenge.name) {
      setError('Answer the chess question first!');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') await signIn(name.trim(), password);
      else await signUp(name.trim(), password);
    } catch (err) {
      setError(errorMessage((err as { code?: string }).code ?? ''));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-muted">Ask a grown-up to help. An account saves your progress so you can play on any device.</p>
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-cream p-1">
        {(['login', 'signup'] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-xl py-2 font-display font-extrabold ${mode === m ? 'bg-paper text-primary shadow' : 'text-muted'}`}>
            {m === 'login' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Username" autoComplete="username" className="rounded-2xl border-2 border-line bg-paper px-4 py-3 font-bold outline-none focus:border-primary" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="rounded-2xl border-2 border-line bg-paper px-4 py-3 font-bold outline-none focus:border-primary" />
      {mode === 'signup' && (
        <div className="rounded-2xl bg-cream p-3">
          <p className="text-sm font-bold">
            Quick check: which piece is this? <span className="text-3xl">{challenge.glyph}</span>
          </p>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {PIECES.map((p) => (
              <button key={p.name} type="button" onClick={() => setAnswer(p.name)} className={`rounded-xl border-2 py-1.5 text-sm font-extrabold ${answer === p.name ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-paper'}`}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-sm font-bold text-coral-dark">{error}</p>}
      <button className="btn" disabled={busy}>
        {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  );
}
