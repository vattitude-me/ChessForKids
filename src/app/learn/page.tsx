'use client';

import Link from 'next/link';
import { useProgress, isLessonUnlocked } from '@/lib/progress';
import { WORLDS, LESSON_ORDER, ALL_LESSONS } from '@/lib/curriculum';
import { Stars, ProgressBar } from '@/components/ui/Progress';
import Coach from '@/components/ui/Coach';

// Horizontal offsets that make the path wiggle like a trail.
const OFFSETS = [0, 56, 84, 56, 0, -56, -84, -56];

export default function LearnPage() {
  const lessons = useProgress((s) => s.lessons);
  const unlockAll = useProgress((s) => s.settings.unlockAllLessons);
  const current = LESSON_ORDER.find((id) => !lessons[id]);
  const done = Object.keys(lessons).length;
  let globalIndex = 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 md:py-8">
      <header className="mb-6">
        <h1 className="font-display text-4xl font-extrabold">Chess Academy</h1>
        <p className="mt-1 text-lg font-semibold text-muted">Follow the trail from your very first move to checkmating like a pro!</p>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={done} max={ALL_LESSONS.length} className="flex-1" />
          <span className="font-extrabold text-muted">{done}/{ALL_LESSONS.length}</span>
        </div>
      </header>

      {done === 0 && <Coach className="mb-6" text="Tap the glowing circle to start your **first lesson**! Each lesson takes about 3 minutes." mood="cheer" />}

      {WORLDS.map((world, wi) => {
        const worldDone = world.lessons.filter((l) => lessons[l.id]).length;
        const firstLocked = !isLessonUnlocked(LESSON_ORDER, world.lessons[0].id, lessons, unlockAll);
        return (
          <section key={world.id} className="mb-10">
            <div
              className={`card sticky top-16 z-10 flex items-center gap-4 p-4 md:top-4 ${firstLocked ? 'opacity-80' : ''}`}
              style={{ background: `linear-gradient(120deg, ${world.color}, ${world.color}cc)`, borderColor: world.color, boxShadow: `0 4px 0 ${world.color}88` }}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25 text-3xl">{world.icon}</span>
              <div className="flex-1 text-white">
                <p className="text-xs font-extrabold tracking-widest uppercase opacity-90">World {wi + 1}</p>
                <h2 className="font-display text-2xl leading-tight font-extrabold">{world.title}</h2>
                <p className="text-sm font-bold opacity-90">{world.subtitle}</p>
              </div>
              <span className="rounded-full bg-white/25 px-3 py-1 font-extrabold text-white">
                {worldDone}/{world.lessons.length}
              </span>
            </div>

            <ol className="relative mt-8 flex flex-col items-center gap-7">
              {world.lessons.map((lesson) => {
                const idx = globalIndex++;
                const result = lessons[lesson.id];
                const unlocked = isLessonUnlocked(LESSON_ORDER, lesson.id, lessons, unlockAll);
                const isCurrent = lesson.id === current;
                const offset = OFFSETS[idx % OFFSETS.length];
                return (
                  <li key={lesson.id} style={{ transform: `translateX(${offset}px)` }} className="flex flex-col items-center">
                    {isCurrent && (
                      <span className="lk-slide-up mb-2 rounded-xl border-2 bg-paper px-3 py-1 font-display text-sm font-extrabold" style={{ borderColor: world.color, color: world.color }}>
                        START
                      </span>
                    )}
                    {unlocked ? (
                      <Link
                        href={`/learn/${lesson.id}`}
                        className={`relative flex h-20 w-20 items-center justify-center rounded-full text-4xl transition active:translate-y-1 ${isCurrent ? 'animate-float' : ''}`}
                        style={{
                          background: result ? world.color : isCurrent ? world.color : '#fff',
                          color: result || isCurrent ? '#fff' : world.color,
                          border: `3px solid ${world.color}`,
                          boxShadow: `0 6px 0 ${world.color}99${isCurrent ? `, 0 0 0 8px ${world.color}33` : ''}`,
                        }}
                        aria-label={lesson.title}
                      >
                        <span className={result || isCurrent ? 'drop-shadow' : ''}>{result ? '✓' : lesson.icon}</span>
                      </Link>
                    ) : (
                      <span className="flex h-20 w-20 items-center justify-center rounded-full border-3 border-line bg-[#f1ece2] text-3xl text-muted shadow-[0_6px_0_var(--color-line)]" aria-label={`${lesson.title} (locked)`}>
                        🔒
                      </span>
                    )}
                    <span className={`mt-2 max-w-36 text-center font-display text-base leading-tight font-extrabold ${unlocked ? 'text-ink' : 'text-muted'}`}>{lesson.title}</span>
                    {result && <Stars count={result.stars} size="text-sm" />}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      <div className="card p-5 text-center">
        <p className="text-4xl">🎓</p>
        <p className="mt-2 font-display text-xl font-extrabold">Graduation</p>
        <p className="font-semibold text-muted">Finish every world to become a Chess 4 Kids graduate!</p>
      </div>
    </div>
  );
}
