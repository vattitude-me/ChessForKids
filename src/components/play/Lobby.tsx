'use client';

import { useState } from 'react';
import { BOTS, Bot, suggestBot } from '@/lib/engine/bots';
import { useProgress } from '@/lib/progress';
import Coach from '@/components/ui/Coach';

export interface GameConfig {
  bot: Bot;
  color: 'w' | 'b';
  takebacks: boolean;
}

function Toggle({ label, icon, checked, onChange, help }: { label: string; icon: string; checked: boolean; onChange: (v: boolean) => void; help: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-paper px-4 py-3">
      <span className="text-2xl">{icon}</span>
      <span className="flex-1">
        <span className="block font-display text-lg leading-tight font-extrabold">{label}</span>
        <span className="block text-xs font-bold text-muted">{help}</span>
      </span>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-7 w-12 rounded-full bg-line transition peer-checked:bg-mint after:absolute after:top-1 after:left-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
    </label>
  );
}

export default function Lobby({ initialBot, onStart }: { initialBot?: string; onStart: (c: GameConfig) => void }) {
  const rating = useProgress((s) => s.games.rating);
  const beaten = useProgress((s) => s.games.botsBeaten);
  const settings = useProgress((s) => s.settings);
  const setSettings = useProgress((s) => s.setSettings);
  const suggested = suggestBot(rating);
  const [botId, setBotId] = useState(initialBot && BOTS.some((b) => b.id === initialBot) ? initialBot : suggested.id);
  const [color, setColor] = useState<'w' | 'b' | 'random'>('w');
  const [takebacks, setTakebacks] = useState(true);
  const bot = BOTS.find((b) => b.id === botId)!;

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 md:px-8 md:py-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold">Play a Game</h1>
          <p className="text-lg font-semibold text-muted">Choose your opponent. Every bot is powered by Stockfish, tuned to play like a real kid!</p>
        </div>
        <span className="chip bg-primary-soft text-lg text-primary">Your rating: {rating}</span>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="grid grid-cols-2 content-start gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {BOTS.map((b) => {
            const active = b.id === botId;
            return (
              <button
                key={b.id}
                onClick={() => setBotId(b.id)}
                className={`card relative flex flex-col items-center gap-1 px-3 pt-4 pb-3 text-center transition ${active ? 'scale-[1.02]' : 'card-hover'}`}
                style={active ? { borderColor: b.color, boxShadow: `0 5px 0 ${b.color}`, background: `${b.color}22` } : undefined}
              >
                {b.id === suggested.id && <span className="absolute -top-2.5 rounded-full bg-sun px-2 py-0.5 text-[0.65rem] font-extrabold tracking-wide uppercase">Best match</span>}
                {beaten.includes(b.id) && <span className="absolute top-2 right-2 text-lg" title="You beat this bot!">🏅</span>}
                <span className="text-5xl drop-shadow-sm">{b.emoji}</span>
                <span className="font-display text-base leading-tight font-extrabold">{b.name}</span>
                <span className="text-xs font-extrabold text-muted">~{b.rating}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <div className="card p-5" style={{ borderColor: bot.color }}>
            <div className="flex items-center gap-4">
              <span className="flex h-20 w-20 items-center justify-center rounded-3xl text-6xl" style={{ background: `${bot.color}33` }}>{bot.emoji}</span>
              <div>
                <h2 className="font-display text-2xl leading-tight font-extrabold">{bot.name}</h2>
                <p className="font-bold text-muted">Rating about {bot.rating}</p>
              </div>
            </div>
            <p className="mt-3 font-semibold">{bot.tagline}</p>
            <p className="mt-2 rounded-2xl bg-cream px-3 py-2 font-semibold italic">&ldquo;{bot.greeting}&rdquo;</p>
          </div>

          <div className="card p-4">
            <p className="mb-2 font-display text-lg font-extrabold">I want to play</p>
            <div className="grid grid-cols-3 gap-2">
              {([['w', '⚪', 'White'], ['random', '🎲', 'Random'], ['b', '⚫', 'Black']] as const).map(([v, icon, label]) => (
                <button key={v} onClick={() => setColor(v)} className={`rounded-2xl border-2 py-2.5 font-display font-extrabold transition ${color === v ? 'border-primary bg-primary-soft text-primary' : 'border-line bg-paper text-muted'}`}>
                  <span className="block text-2xl">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Toggle icon="🦉" label="Coach tips" help="Coach Hoot tells you about good and risky moves" checked={settings.coachTips} onChange={(v) => setSettings({ coachTips: v })} />
            <Toggle icon="↩️" label="Take-backs" help="Undo a move if you make a mistake" checked={takebacks} onChange={setTakebacks} />
            <Toggle icon="📊" label="Who's winning bar" help="Shows who is ahead right now" checked={settings.showEvalBar} onChange={(v) => setSettings({ showEvalBar: v })} />
            <Toggle icon="🟢" label="Show possible moves" help="Dots show where a piece can go" checked={settings.showLegalMoves} onChange={(v) => setSettings({ showLegalMoves: v })} />
          </div>

          <button
            className="btn btn-lg btn-mint w-full"
            onClick={() => onStart({ bot, color: color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : color, takebacks })}
          >
            Play {bot.name}! ♟️
          </button>
          {bot.rating > rating + 500 && <Coach text="Wow, that's a tough one! Give it your best shot. 💪" mood="wow" size={56} />}
        </div>
      </div>
    </div>
  );
}
