'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Lobby, { GameConfig } from '@/components/play/Lobby';
import GameTable from '@/components/play/GameTable';
import { getBot } from '@/lib/engine/bots';
import { getEngine } from '@/lib/engine/stockfish';
import { useProgress } from '@/lib/progress';
import { useUi } from '@/lib/ui-store';

interface Session extends GameConfig {
  key: number;
  startFen?: string;
  moves?: string[];
}

function PlayInner() {
  const params = useSearchParams();
  const router = useRouter();
  const setFocus = useUi((s) => s.setFocus);
  const [session, setSession] = useState<Session | null>(() => {
    const saved = useProgress.getState().games.saved;
    if (params.get('resume') && saved) {
      return { key: Date.now(), bot: getBot(saved.botId), color: saved.color, takebacks: true, startFen: saved.startFen, moves: saved.moves };
    }
    return null;
  });

  useEffect(() => {
    getEngine().preload();
  }, []);

  useEffect(() => {
    setFocus(!!session);
    return () => setFocus(false);
  }, [session, setFocus]);

  const start = (c: GameConfig) => {
    // Starting a new game abandons any saved one.
    useProgress.getState().saveGame(null);
    setSession({ ...c, key: Date.now() });
  };

  if (!session) {
    return <Lobby initialBot={params.get('bot') ?? undefined} onStart={start} />;
  }

  return (
    <GameTable
      key={session.key}
      bot={session.bot}
      color={session.color}
      takebacks={session.takebacks}
      startFen={session.startFen}
      initialMoves={session.moves}
      onExit={() => {
        setSession(null);
        router.replace('/play');
      }}
      onRematch={() => start({ bot: session.bot, color: session.color === 'w' ? 'b' : 'w', takebacks: session.takebacks })}
    />
  );
}

export default function PlayPage() {
  return (
    <Suspense>
      <PlayInner />
    </Suspense>
  );
}
