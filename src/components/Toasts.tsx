'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useProgress } from '@/lib/progress';
import { sfx } from '@/lib/sounds';

export default function Toasts() {
  const toasts = useProgress((s) => s.toasts);
  const dismiss = useProgress((s) => s.dismissToast);

  useEffect(() => {
    if (!toasts.length) return;
    const newest = toasts[toasts.length - 1];
    if (newest.kind === 'badge' || newest.kind === 'level') {
      sfx.win();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.3 }, colors: ['#5b4df5', '#ffc83d', '#22c27c', '#ff8fb1', '#3db7f5'] });
    }
    const timers = toasts.map((t) => setTimeout(() => dismiss(t.id), t.kind === 'xp' ? 2200 : 4500));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-3" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`lk-slide-up pointer-events-auto flex items-center gap-3 rounded-2xl border-2 px-4 py-2.5 shadow-lg ${
            t.kind === 'xp' ? 'border-sun bg-sun-soft' : t.kind === 'level' ? 'border-primary bg-primary-soft' : 'border-mint bg-mint-soft'
          }`}
        >
          <span className="text-2xl">{t.icon}</span>
          <span className="text-left">
            <span className="block font-display text-base leading-tight font-extrabold text-ink">{t.title}</span>
            {t.body && <span className="block text-xs font-bold text-muted">{t.body}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
