'use client';

import Link from 'next/link';
import { useProgress, levelFromXp, rankForLevel, BADGES, DAILY_XP_GOAL, todayKey, isLessonUnlocked } from '@/lib/progress';
import { WORLDS, ALL_LESSONS, LESSON_ORDER } from '@/lib/curriculum';
import { suggestBot, getBot } from '@/lib/engine/bots';
import Coach from '@/components/ui/Coach';
import { ProgressBar, Ring } from '@/components/ui/Progress';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const TIPS = [
  'Before every move, ask: **what is my opponent threatening?**',
  'Knights on the rim are dim! Keep your knights near the **center**.',
  'Castle early to keep your king **safe**.',
  'Look for **checks, captures and threats**. They are the most powerful moves!',
  'Every piece has a job. Try to get **all** your pieces into the game.',
  'When you are ahead, trade pieces. When you are behind, keep them!',
  'A pawn that reaches the end becomes a **queen**. Push those passed pawns!',
];

export default function Home() {
  const s = useProgress();
  const { level, into, needed } = levelFromXp(s.xp);
  const rank = rankForLevel(level);
  const nextLessonId = LESSON_ORDER.find((id) => !s.lessons[id]) ?? null;
  const nextLesson = nextLessonId ? ALL_LESSONS.find((l) => l.id === nextLessonId)! : null;
  const world = nextLesson ? WORLDS.find((w) => w.lessons.includes(nextLesson))! : WORLDS[WORLDS.length - 1];
  const worldDone = world.lessons.filter((l) => s.lessons[l.id]).length;
  const totalDone = Object.keys(s.lessons).length;
  const xpToday = s.activity.xpByDay[todayKey()] ?? 0;
  const bot = suggestBot(s.games.rating);
  const dailyDone = s.puzzles.dailyDone[todayKey()]?.length ?? 0;
  const earned = BADGES.filter((b) => s.badges[b.id]).sort((a, b) => (s.badges[b.id] > s.badges[a.id] ? 1 : -1));
  const tip = TIPS[new Date().getDate() % TIPS.length];
  const saved = s.games.saved;
  const unlocked = nextLesson ? isLessonUnlocked(LESSON_ORDER, nextLesson.id, s.lessons, s.settings.unlockAllLessons) : false;

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 md:px-8 md:py-8">
      {/* Greeting */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-line bg-paper text-4xl shadow-[0_4px_0_var(--color-line)]">{s.profile.avatar}</span>
          <div>
            <p className="font-bold text-muted">{greeting()},</p>
            <h1 className="font-display text-3xl leading-tight font-extrabold md:text-4xl">{s.profile.name || 'Champion'}!</h1>
          </div>
        </div>
        <div className="card flex items-center gap-4 px-4 py-3">
          <span className="text-3xl">{rank.icon}</span>
          <div className="min-w-48 flex-1">
            <div className="flex justify-between gap-3 text-sm font-extrabold">
              <span>Level {level} · {rank.name}</span>
              <span className="text-muted">{into}/{needed} XP</span>
            </div>
            <ProgressBar value={into} max={needed} color="var(--color-primary)" className="mt-1.5" />
          </div>
        </div>
      </section>

      {saved && (
        <Link href="/play?resume=1" className="lk-slide-up card card-hover mt-5 flex items-center gap-4 border-sun bg-sun-soft p-4">
          <span className="text-4xl">{getBot(saved.botId).emoji}</span>
          <div className="flex-1">
            <p className="font-display text-lg font-extrabold">Your game with {getBot(saved.botId).name} is waiting!</p>
            <p className="text-sm font-bold text-muted">{saved.moves.length} moves played. Tap to continue.</p>
          </div>
          <span className="btn btn-sun btn-sm">Resume</span>
        </Link>
      )}

      {/* Continue learning */}
      <section className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="card relative overflow-hidden p-6" style={{ background: `linear-gradient(135deg, ${world.color}22, #fff 60%)` }}>
          <div className="absolute -top-6 -right-4 text-[9rem] leading-none opacity-15 select-none">{world.icon}</div>
          <p className="text-sm font-extrabold tracking-wide uppercase" style={{ color: world.color }}>
            {nextLesson ? `${world.title} · ${worldDone}/${world.lessons.length}` : 'All lessons complete!'}
          </p>
          <h2 className="mt-1 font-display text-3xl font-extrabold">{nextLesson ? nextLesson.title : 'You finished the whole academy! 🎓'}</h2>
          <p className="mt-1 text-lg font-semibold text-muted">{nextLesson ? nextLesson.blurb : 'Keep sharpening your skills with puzzles and games.'}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {nextLesson && unlocked ? (
              <Link href={`/learn/${nextLesson.id}`} className="btn btn-lg">
                {totalDone === 0 ? 'Start your first lesson' : 'Continue learning'} →
              </Link>
            ) : (
              <Link href="/learn" className="btn btn-lg">Open the map →</Link>
            )}
            <span className="font-bold text-muted">{totalDone}/{ALL_LESSONS.length} lessons done</span>
          </div>
          <ProgressBar value={totalDone} max={ALL_LESSONS.length} className="mt-5" color={world.color} />
        </div>

        <div className="card flex flex-col justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <Ring value={xpToday} max={DAILY_XP_GOAL} size={76} stroke={9} color="var(--color-mint)">
              <span className="text-2xl">{xpToday >= DAILY_XP_GOAL ? '✅' : '🎯'}</span>
            </Ring>
            <div>
              <p className="font-display text-xl font-extrabold">Daily goal</p>
              <p className="font-bold text-muted">
                {xpToday >= DAILY_XP_GOAL ? 'Done for today. Amazing!' : `${DAILY_XP_GOAL - Math.min(xpToday, DAILY_XP_GOAL)} XP to go`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-cream p-3">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="font-display text-xl font-extrabold">{s.activity.streak} day streak</p>
              <p className="text-sm font-bold text-muted">Best: {s.activity.bestStreak} days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link href="/puzzles?mode=daily" className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-4xl">📅</span>
            <span className="chip">{dailyDone}/5</span>
          </div>
          <h3 className="mt-3 font-display text-xl font-extrabold">Daily Puzzles</h3>
          <p className="font-semibold text-muted">5 fresh puzzles every day</p>
        </Link>
        <Link href="/puzzles" className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-4xl">🧩</span>
            <span className="chip bg-primary-soft text-primary">★ {s.puzzles.rating}</span>
          </div>
          <h3 className="mt-3 font-display text-xl font-extrabold">Puzzle Training</h3>
          <p className="font-semibold text-muted">Puzzles that grow with you</p>
        </Link>
        <Link href={`/play?bot=${bot.id}`} className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-4xl">{bot.emoji}</span>
            <span className="chip">~{bot.rating}</span>
          </div>
          <h3 className="mt-3 font-display text-xl font-extrabold">Play {bot.name}</h3>
          <p className="font-semibold text-muted">A great match for you</p>
        </Link>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        <Coach text={`**Coach's tip:** ${tip.replace(/^\*\*|\*\*$/g, '')}`} mood="happy" size={80} />
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-extrabold">Badges</h3>
            <Link href="/profile" className="text-sm font-extrabold text-primary">See all</Link>
          </div>
          {earned.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {earned.slice(0, 8).map((b) => (
                <span key={b.id} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sun-soft text-2xl" title={b.name}>
                  {b.icon}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 font-semibold text-muted">Finish your first lesson to earn a badge! 🏅</p>
          )}
        </div>
      </section>
    </div>
  );
}
