'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProgress, AVATARS } from '@/lib/progress';
import { useAuth } from '@/lib/auth-context';
import Mascot from './ui/Mascot';
import Modal from './ui/Modal';

const AGES = [
  { label: '4–5', age: 5, puzzle: 350, game: 250 },
  { label: '6–7', age: 7, puzzle: 400, game: 300 },
  { label: '8–9', age: 9, puzzle: 500, game: 400 },
  { label: '10–12', age: 11, puzzle: 650, game: 500 },
  { label: '13+', age: 14, puzzle: 800, game: 700 },
];

const EXPERIENCE = [
  { label: 'Brand new!', icon: '🌱', bonus: 0 },
  { label: 'I know the moves', icon: '♟️', bonus: 150 },
  { label: 'I play a lot', icon: '🏆', bonus: 400 },
];

export default function Onboarding() {
  const onboarded = useProgress((s) => s.profile.onboarded);
  const hydrated = useProgress((s) => s.hydrated);
  const { loading, syncing } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [age, setAge] = useState<(typeof AGES)[number] | null>(null);

  if (!hydrated || onboarded || loading || syncing) return null;

  const finish = (bonus: number) => {
    const a = age ?? AGES[1];
    const s = useProgress.getState();
    s.setProfile({ name: name.trim() || 'Champion', avatar, age: a.age, onboarded: true });
    useProgress.setState({
      puzzles: { ...s.puzzles, rating: a.puzzle + bonus },
      games: { ...s.games, rating: a.game + bonus },
    });
  };

  return (
    <Modal open>
      {step === 0 && (
        <div className="text-center">
          <Mascot mood="cheer" size={110} className="mx-auto animate-float" />
          <h2 className="mt-2 font-display text-3xl font-extrabold">Welcome to Chess 4 Kids!</h2>
          <p className="mt-2 text-lg font-semibold text-muted">I&apos;m Coach Hoot. I&apos;ll help you become a chess champion! 🏆</p>
          <button className="btn btn-lg mt-6 w-full" onClick={() => setStep(1)}>
            Let&apos;s go!
          </button>
          <p className="mt-4 text-sm font-semibold text-muted">
            Already have an account?{' '}
            <Link href="/profile#account" className="text-primary underline" onClick={() => useProgress.getState().setProfile({ onboarded: true })}>
              Sign in
            </Link>
          </p>
        </div>
      )}
      {step === 1 && (
        <div>
          <h2 className="text-center font-display text-2xl font-extrabold">What should I call you?</h2>
          <input
            autoFocus
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your first name or a nickname"
            className="mt-4 w-full rounded-2xl border-2 border-line bg-cream px-4 py-3 text-center font-display text-xl font-bold outline-none focus:border-primary"
          />
          <p className="mt-5 mb-2 text-center font-bold text-muted">Pick your buddy</p>
          <div className="grid grid-cols-8 gap-1.5">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`aspect-square rounded-xl text-2xl transition ${avatar === a ? 'scale-110 bg-primary-soft ring-3 ring-primary' : 'bg-cream hover:scale-105'}`}
                aria-label={`Avatar ${a}`}
              >
                {a}
              </button>
            ))}
          </div>
          <button className="btn btn-lg mt-6 w-full" onClick={() => setStep(2)}>
            Next
          </button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2 className="text-center font-display text-2xl font-extrabold">How old are you?</h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {AGES.map((a) => (
              <button
                key={a.label}
                onClick={() => {
                  setAge(a);
                  setStep(3);
                }}
                className="card card-hover py-4 font-display text-xl font-extrabold"
              >
                {a.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs font-semibold text-muted">We only use this to pick the right starting level. It stays on this device.</p>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2 className="text-center font-display text-2xl font-extrabold">Have you played chess before?</h2>
          <div className="mt-4 flex flex-col gap-2">
            {EXPERIENCE.map((e) => (
              <button key={e.label} onClick={() => finish(e.bonus)} className="card card-hover flex items-center gap-3 px-5 py-4 text-left font-display text-xl font-extrabold">
                <span className="text-3xl">{e.icon}</span>
                {e.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
