'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { findLesson, LESSON_ORDER, ALL_LESSONS } from '@/lib/curriculum';
import { useProgress, isLessonUnlocked } from '@/lib/progress';
import { ProgressBar, Stars } from '@/components/ui/Progress';
import Mascot from '@/components/ui/Mascot';
import { StepView } from './steps';
import { sfx } from '@/lib/sounds';

function starsFor(mistakes: number) {
  if (mistakes <= 1) return 3;
  if (mistakes <= 4) return 2;
  return 1;
}

export default function LessonPlayer({ id }: { id: string }) {
  const found = findLesson(id)!;
  const { lesson, world } = found;
  const router = useRouter();
  const lessons = useProgress((s) => s.lessons);
  const unlockAll = useProgress((s) => s.settings.unlockAllLessons);
  const completeLesson = useProgress((s) => s.completeLesson);
  const [index, setIndex] = useState(0);
  const [stepDone, setStepDone] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [finished, setFinished] = useState<number | null>(null);

  const step = lesson.steps[index];
  const nextId = LESSON_ORDER[LESSON_ORDER.indexOf(id) + 1];
  const nextLesson = nextId ? ALL_LESSONS.find((l) => l.id === nextId) : null;
  const unlocked = isLessonUnlocked(LESSON_ORDER, id, lessons, unlockAll);

  const onDone = useCallback(() => setStepDone(true), []);
  const onMistake = useCallback(() => setMistakes((m) => m + 1), []);

  const next = useCallback(() => {
    if (!stepDone) return;
    if (index + 1 < lesson.steps.length) {
      sfx.pop();
      setIndex(index + 1);
      setStepDone(false);
    } else {
      const stars = starsFor(mistakes);
      completeLesson(id, stars);
      setFinished(stars);
      sfx.win();
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.55 }, colors: [world.color, '#ffc83d', '#5b4df5', '#22c27c'] });
    }
  }, [stepDone, index, lesson.steps.length, mistakes, completeLesson, id, world.color]);

  // Enter / Space advances, handy on desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && stepDone && !finished && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, stepDone, finished]);

  if (!unlocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <Mascot mood="think" size={110} />
        <h1 className="font-display text-3xl font-extrabold">This lesson is still locked 🔒</h1>
        <p className="font-semibold text-muted">Finish the lessons before it first. You&apos;re doing great!</p>
        <Link href="/learn" className="btn">Back to the map</Link>
      </div>
    );
  }

  if (finished !== null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center">
        <Mascot mood="cheer" size={140} className="animate-float" />
        <p className="font-bold tracking-widest uppercase" style={{ color: world.color }}>Lesson complete!</p>
        <h1 className="font-display text-4xl font-extrabold">{lesson.title}</h1>
        <div className="lk-pop">
          <Stars count={finished} size="text-5xl" />
        </div>
        <p className="max-w-sm font-semibold text-muted">
          {finished === 3 ? 'Perfect! You didn\'t miss a thing. 🌟' : finished === 2 ? 'Great job! Practise again for 3 stars.' : 'You did it! Every champion keeps practising.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {nextLesson ? (
            <button className="btn btn-lg btn-mint" onClick={() => router.push(`/learn/${nextLesson.id}`)}>
              Next: {nextLesson.title} →
            </button>
          ) : (
            <Link href="/play" className="btn btn-lg btn-mint">Play a real game →</Link>
          )}
          <Link href="/learn" className="btn btn-lg btn-white">Back to map</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 pt-4 pb-3">
        <Link href="/learn" className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl font-bold text-muted hover:bg-line/60" aria-label="Exit lesson">
          ✕
        </Link>
        <ProgressBar value={index + (stepDone ? 1 : 0)} max={lesson.steps.length} color={world.color} height={16} className="flex-1" />
        <span className="text-2xl" title={lesson.title}>{lesson.icon}</span>
      </header>

      <div className="flex-1 pb-32">
        <StepView key={`${id}-${index}`} step={step} onDone={onDone} onMistake={onMistake} />
      </div>

      <footer className={`pb-safe fixed inset-x-0 bottom-0 z-20 border-t-2 transition-colors ${stepDone ? 'border-mint/40 bg-mint-soft' : 'border-line bg-paper'}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <p className="hidden font-display text-xl font-extrabold text-mint-dark sm:block">{stepDone ? (step.kind === 'talk' ? 'Got it?' : 'Awesome! ✨') : ''}</p>
          <button className={`btn btn-lg ml-auto w-full sm:w-auto ${stepDone ? 'btn-mint' : ''}`} disabled={!stepDone} onClick={next}>
            {index + 1 < lesson.steps.length ? 'Continue' : 'Finish lesson'}
          </button>
        </div>
      </footer>
    </div>
  );
}
