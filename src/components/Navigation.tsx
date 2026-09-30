'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProgress, levelFromXp, DAILY_XP_GOAL, todayKey } from '@/lib/progress';
import { useUi } from '@/lib/ui-store';
import Logo from './Logo';
import { Ring } from './ui/Progress';

const NAV = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/learn', label: 'Learn', icon: '📚' },
  { href: '/puzzles', label: 'Puzzles', icon: '🧩' },
  { href: '/play', label: 'Play', icon: '♟️' },
  { href: '/profile', label: 'Me', icon: '😊' },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function StatusChips() {
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.activity.streak);
  const days = useProgress((s) => s.activity.days);
  const xpToday = useProgress((s) => s.activity.xpByDay[todayKey()] ?? 0);
  const { level } = levelFromXp(xp);
  const activeToday = days.includes(todayKey());
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="chip" title="Day streak">
        <span className={activeToday ? '' : 'grayscale opacity-60'}>🔥</span>
        {streak}
      </span>
      <span className="chip" title="Today's goal">
        <Ring value={xpToday} max={DAILY_XP_GOAL} size={22} stroke={4} color="var(--color-mint)" />
        <span className="hidden sm:inline">{Math.min(xpToday, DAILY_XP_GOAL)}/{DAILY_XP_GOAL}</span>
      </span>
      <span className="chip bg-primary-soft whitespace-nowrap text-primary" title="Level">
        ⭐ {level}
      </span>
    </div>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const focus = useUi((s) => s.focus);
  const avatar = useProgress((s) => s.profile.avatar);
  const hidden = focus || /^\/learn\/.+/.test(pathname);
  if (hidden) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r-2 border-line bg-paper/85 px-4 py-6 backdrop-blur md:flex">
        <Link href="/" className="mb-8 px-2">
          <Logo />
        </Link>
        <ul className="flex flex-1 flex-col gap-1.5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 font-display text-lg font-bold transition ${
                    active ? 'border-primary/30 bg-primary-soft text-primary' : 'border-transparent text-muted hover:bg-cream hover:text-ink'
                  }`}
                >
                  <span className="text-2xl">{item.href === '/profile' ? avatar : item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="px-1">
          <StatusChips />
        </div>
      </nav>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-line bg-cream/90 px-4 py-2.5 backdrop-blur md:hidden">
        <Link href="/">
          <Logo compact />
        </Link>
        <StatusChips />
      </header>

      {/* Mobile tab bar */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t-2 border-line bg-paper/95 backdrop-blur md:hidden">
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1.5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link href={item.href} className="flex flex-col items-center gap-0.5 rounded-xl py-1" aria-current={active ? 'page' : undefined}>
                  <span className={`flex h-9 w-12 items-center justify-center rounded-xl text-2xl transition ${active ? 'bg-primary-soft scale-110' : ''}`}>
                    {item.href === '/profile' ? avatar : item.icon}
                  </span>
                  <span className={`text-[0.72rem] font-extrabold ${active ? 'text-primary' : 'text-muted'}`}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

/** Main content area; drops the nav padding in focus mode (lessons, live games). */
export function MainArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const focus = useUi((s) => s.focus);
  const hidden = focus || /^\/learn\/.+/.test(pathname);
  return <main className={hidden ? 'min-h-screen' : 'min-h-screen pb-24 md:pb-8 md:pl-60'}>{children}</main>;
}
