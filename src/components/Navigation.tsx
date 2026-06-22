'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/learn', label: 'Lessons', icon: 'book' },
  { href: '/progress', label: 'Progress', icon: 'chart' },
  { href: '/play', label: 'Battle', icon: 'battle' },
];

const mobileNavItems = [
  { href: '/', label: 'Home', icon: '🏰' },
  { href: '/learn', label: 'Lessons', icon: '📚' },
  { href: '/play', label: 'Battle', icon: '⚔️' },
  { href: '/progress', label: 'Progress', icon: '📈' },
];

function NavIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? '#ffffff' : '#d0d0dc';
  const size = 20;

  switch (type) {
    case 'home':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8z" />
        </svg>
      );
    case 'book':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      );
    case 'puzzle':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 00-5 0V5H4c-1.1 0-2 .9-2 2v3.8h1.5a2.5 2.5 0 010 5H2V19c0 1.1.9 2 2 2h3.8v-1.5a2.5 2.5 0 015 0V21H17c1.1 0 2-.9 2-2v-4h1.5a2.5 2.5 0 000-5z" />
        </svg>
      );
    case 'chart':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M4 20h4V10H4v10zm6 0h4V4h-4v16zm6 0h4v-8h-4v8z" />
        </svg>
      );
    case 'battle':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop/Tablet: Logo on left + centered nav pill */}
      <div className="fixed top-0 left-0 right-0 z-50 hidden md:flex items-center px-5 lg:px-8 py-3">
        {/* Logo - bold, prominent, with dark backing for contrast */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-[#1a1035]/80 blur-sm scale-110" />
            <Image
              src="/logo.png"
              alt="Chess for Kids"
              width={56}
              height={56}
              className="relative object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="leading-tight">
            <span className="font-black text-2xl lg:text-3xl block tracking-tight" style={{ color: '#ffffff', textShadow: '0 2px 12px rgba(108, 92, 231, 0.6), 0 4px 20px rgba(0,0,0,0.4)' }}>
              Chess for <span style={{ color: '#ffd700' }}>Kids</span>
            </span>
            <span className="text-[11px] lg:text-xs font-bold block tracking-widest uppercase" style={{ color: '#c4b5e0', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>Learn & Play</span>
          </div>
        </Link>

        {/* Centered nav pill */}
        <nav className="flex-1 flex justify-center">
          <div className="nav-pill flex items-center px-3 lg:px-4 py-2 lg:py-2.5 rounded-full">
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-pill-item flex items-center gap-2 rounded-full transition-all duration-300 ${
                      isActive ? 'nav-pill-item-active' : ''
                    }`}
                  >
                    <NavIcon type={item.icon} active={isActive} />
                    <span className={`font-bold text-sm lg:text-base whitespace-nowrap ${
                      isActive ? 'text-white nav-pill-item-label' : 'text-[#d0d0dc]'
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Spacer to balance the logo width */}
        <div className="w-[160px] shrink-0" />
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t" style={{ background: '#0d0a1af7', borderColor: '#ffffff15' }}>
        <div className="flex justify-around items-center py-2 px-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                style={{
                  color: isActive ? '#ffd700' : '#a0a0b0',
                  background: isActive ? '#7c3aed25' : 'transparent',
                }}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
