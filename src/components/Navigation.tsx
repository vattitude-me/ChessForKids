'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/learn', label: 'Lessons' },
  { href: '/puzzles', label: 'Puzzles' },
  { href: '/progress', label: 'Progress' },
];

const mobileNavItems = [
  { href: '/', label: 'Home', icon: '🏰' },
  { href: '/learn', label: 'Lessons', icon: '📚' },
  { href: '/puzzles', label: 'Puzzles', icon: '🧩' },
  { href: '/progress', label: 'Progress', icon: '📈' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top nav - transparent overlay */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Chess for Kids"
                width={60}
                height={60}
                className="object-contain"
              />
              <span className="font-bold text-2xl lg:text-3xl" style={{ color: '#ffffff' }}>
                <span style={{ color: '#ffd700' }}>Chess</span>
                <span className="text-sm lg:text-base block" style={{ color: '#c0b0ff' }}>
                  ✦ for Kids ✦
                </span>
              </span>
            </Link>

            {/* Nav links */}
            <div className="flex items-center gap-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg lg:text-xl font-semibold transition-colors duration-200 hover:text-white"
                    style={{
                      color: isActive ? '#ffd700' : '#e0e0e0',
                    }}
                  >
                    {item.label}{isActive && ' ✦'}
                  </Link>
                );
              })}
            </div>

            {/* Play button */}
            <Link
              href="/play"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-base lg:text-lg transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #3b2570, #5b3d99)',
                color: '#e8dcc8',
                border: '1px solid #6b4daa80',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Let's Battle
            </Link>
          </div>
        </div>
      </nav>

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
