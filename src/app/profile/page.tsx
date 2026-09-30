'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProgress, levelFromXp, rankForLevel, BADGES, AVATARS, BOARD_THEMES, BoardThemeId } from '@/lib/progress';
import { ALL_LESSONS } from '@/lib/curriculum';
import { getBot } from '@/lib/engine/bots';
import { ProgressBar } from '@/components/ui/Progress';
import Modal from '@/components/ui/Modal';
import AccountPanel from '@/components/AccountPanel';

function Stat({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="card flex flex-col items-center p-4 text-center">
      <span className="text-3xl">{icon}</span>
      <span className="font-display text-3xl font-extrabold">{value}</span>
      <span className="text-sm font-bold text-muted">{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const s = useProgress();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(s.profile.name);
  const [confirmReset, setConfirmReset] = useState(false);
  const { level, into, needed } = levelFromXp(s.xp);
  const rank = rankForLevel(level);
  const lessonStars = Object.values(s.lessons).reduce((a, l) => a + l.stars, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 md:px-8 md:py-8">
      {/* Header */}
      <section className="card flex flex-col items-center gap-4 p-6 sm:flex-row">
        <button onClick={() => setEditing(true)} className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] bg-primary-soft text-6xl transition hover:scale-105" aria-label="Change avatar">
          {s.profile.avatar}
          <span className="absolute -right-1 -bottom-1 rounded-full bg-paper px-1.5 text-base shadow">✏️</span>
        </button>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-display text-3xl font-extrabold">{s.profile.name || 'Champion'}</h1>
          <p className="font-bold text-muted">
            {rank.icon} Level {level} {rank.name} · {s.xp} XP total
          </p>
          <ProgressBar value={into} max={needed} color="var(--color-primary)" className="mt-3" />
          <p className="mt-1 text-xs font-bold text-muted">{needed - into} XP to level {level + 1}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon="📚" value={`${Object.keys(s.lessons).length}/${ALL_LESSONS.length}`} label="Lessons" />
        <Stat icon="⭐" value={lessonStars} label="Lesson stars" />
        <Stat icon="🧩" value={s.puzzles.rating} label={`Puzzle rating · ${s.puzzles.solved} solved`} />
        <Stat icon="♟️" value={s.games.rating} label={`Game rating · ${s.games.wins}W ${s.games.draws}D ${s.games.losses}L`} />
      </section>

      {/* Badges */}
      <section className="card mt-6 p-5">
        <h2 className="font-display text-2xl font-extrabold">
          Badges <span className="text-base text-muted">{Object.keys(s.badges).length}/{BADGES.length}</span>
        </h2>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {BADGES.map((b) => {
            const got = !!s.badges[b.id];
            return (
              <div key={b.id} className={`flex flex-col items-center rounded-2xl border-2 p-3 text-center ${got ? 'border-sun bg-sun-soft' : 'border-line bg-cream opacity-60'}`} title={b.description}>
                <span className={`text-4xl ${got ? '' : 'grayscale'}`}>{got ? b.icon : '🔒'}</span>
                <span className="mt-1 font-display text-sm leading-tight font-extrabold">{b.name}</span>
                <span className="text-[0.7rem] leading-tight font-bold text-muted">{b.description}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent games */}
      {s.games.history.length > 0 && (
        <section className="card mt-6 p-5">
          <h2 className="font-display text-2xl font-extrabold">Recent games</h2>
          <ul className="mt-3 divide-y-2 divide-line">
            {s.games.history.slice(0, 8).map((g) => {
              const bot = getBot(g.botId);
              return (
                <li key={g.id} className="flex items-center gap-3 py-2.5">
                  <span className="text-3xl">{bot.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold">
                      vs {bot.name} <span className="text-sm text-muted">as {g.color === 'w' ? 'White' : 'Black'}</span>
                    </p>
                    <p className="text-xs font-semibold text-muted">
                      {new Date(g.date).toLocaleDateString()} · {Math.ceil(g.moves / 2)} moves
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${g.result === 'win' ? 'bg-mint-soft text-mint-dark' : g.result === 'loss' ? 'bg-coral-soft text-coral-dark' : 'bg-sky-soft text-sky-dark'}`}>
                    {g.result === 'win' ? 'Won' : g.result === 'loss' ? 'Lost' : 'Draw'} {g.ratingChange >= 0 ? '+' : ''}
                    {g.ratingChange}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Settings */}
      <section className="card mt-6 p-5">
        <h2 className="font-display text-2xl font-extrabold">Settings</h2>
        <p className="mt-4 mb-2 font-bold">Board colours</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(BOARD_THEMES) as BoardThemeId[]).map((id) => {
            const t = BOARD_THEMES[id];
            return (
              <button key={id} onClick={() => s.setSettings({ boardTheme: id })} className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2 font-bold ${s.settings.boardTheme === id ? 'border-primary bg-primary-soft' : 'border-line bg-paper'}`}>
                <span className="grid h-7 w-7 grid-cols-2 overflow-hidden rounded-md">
                  <span style={{ background: t.light }} />
                  <span style={{ background: t.dark }} />
                  <span style={{ background: t.dark }} />
                  <span style={{ background: t.light }} />
                </span>
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {([
            ['sound', '🔊 Sounds'],
            ['showLegalMoves', '🟢 Show possible moves'],
            ['coachTips', '🦉 Coach tips during games'],
            ['showEvalBar', '📊 Who\'s winning bar'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center justify-between rounded-2xl bg-cream px-4 py-3 font-bold">
              {label}
              <input type="checkbox" className="h-5 w-5 accent-[var(--color-primary)]" checked={s.settings[key]} onChange={(e) => s.setSettings({ [key]: e.target.checked })} />
            </label>
          ))}
        </div>
      </section>

      {/* Grown-ups */}
      <section id="account" className="card mt-6 p-5">
        <h2 className="font-display text-2xl font-extrabold">For grown-ups 👨‍👩‍👧</h2>
        <div className="mt-3">
          <AccountPanel />
        </div>
        <div className="mt-5 flex flex-col gap-2 border-t-2 border-line pt-4">
          <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-cream px-4 py-3 font-bold">
            <span>
              🔓 Unlock all lessons
              <span className="block text-xs font-semibold text-muted">Let your child jump to any lesson</span>
            </span>
            <input type="checkbox" className="h-5 w-5 accent-[var(--color-primary)]" checked={s.settings.unlockAllLessons} onChange={(e) => s.setSettings({ unlockAllLessons: e.target.checked })} />
          </label>
          <button className="btn btn-ghost btn-sm self-start text-coral-dark" onClick={() => setConfirmReset(true)}>
            Reset all progress
          </button>
        </div>
        <p className="mt-4 text-xs font-semibold text-muted">
          <Link href="/privacy" className="underline">Privacy</Link> · <Link href="/terms" className="underline">Terms</Link> · Chess engine: Stockfish 19 (GPLv3,{' '}
          <a href="/engine/STOCKFISH-LICENSE.txt" className="underline">license</a>)
        </p>
      </section>

      <Modal open={editing} onClose={() => setEditing(false)}>
        <h2 className="text-center font-display text-2xl font-extrabold">Edit profile</h2>
        <input value={name} maxLength={20} onChange={(e) => setName(e.target.value)} className="mt-4 w-full rounded-2xl border-2 border-line bg-cream px-4 py-3 text-center font-display text-xl font-bold outline-none focus:border-primary" />
        <div className="mt-4 grid grid-cols-8 gap-1.5">
          {AVATARS.map((a) => (
            <button key={a} onClick={() => s.setProfile({ avatar: a })} className={`aspect-square rounded-xl text-2xl ${s.profile.avatar === a ? 'bg-primary-soft ring-3 ring-primary' : 'bg-cream'}`}>
              {a}
            </button>
          ))}
        </div>
        <button
          className="btn mt-5 w-full"
          onClick={() => {
            s.setProfile({ name: name.trim() || s.profile.name });
            setEditing(false);
          }}
        >
          Save
        </button>
      </Modal>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)}>
        <h2 className="text-center font-display text-2xl font-extrabold">Reset everything?</h2>
        <p className="mt-2 text-center font-semibold text-muted">All lessons, puzzles, games, badges and XP on this device will be erased.</p>
        <div className="mt-5 flex gap-2">
          <button className="btn btn-white flex-1" onClick={() => setConfirmReset(false)}>
            Cancel
          </button>
          <button
            className="btn btn-coral flex-1"
            onClick={() => {
              s.resetAll();
              setConfirmReset(false);
            }}
          >
            Reset
          </button>
        </div>
      </Modal>
    </div>
  );
}
