'use client';

import Image from 'next/image';
import Link from 'next/link';

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center px-2 py-5">
      <span className="mb-1">{icon}</span>
      <h3 className="text-base md:text-lg font-bold feature-title">{title}</h3>
      <p className="text-sm md:text-base feature-description">{description}</p>
    </div>
  );
}

function SideNavTab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="side-nav-tab flex items-center justify-center px-6 py-3 font-bold text-base md:text-lg transition-all duration-200 hover:-translate-x-1 hover:brightness-125"
    >
      {label}
    </Link>
  );
}

export default function Home() {
  return (
    <div className="home-page min-h-screen flex flex-col">
      {/* Hero Section - Full viewport */}
      <section className="hero-section relative flex-1">
        {/* Background image */}
        <Image
          src="/hero_image.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />

        {/* Gradient overlays */}
        <div className="hero-overlay-left absolute inset-0" />
        <div className="hero-overlay-bottom absolute inset-0" />

        {/* Hero content */}
        <div className="hero-section relative z-10 flex flex-col h-full px-6 md:px-10 lg:px-16 pt-20 md:pt-24">
          <div className="flex flex-1 items-start justify-between">
            {/* Left - Heading & CTA */}
            <div className="max-w-lg lg:max-w-xl pt-4 md:pt-8">
              <h1 className="font-extrabold leading-[1.05] mb-5">
                <span className="block text-3xl md:text-4xl lg:text-7xl text-white">
                  Learn Chess.
                </span>
                <span className="block text-3xl md:text-4xl lg:text-7xl italic mt-2" style={{ color: '#c084fc' }}>
                  Unlock Your
                </span>
                <span className="hero-title-magic block text-5xl md:text-6xl lg:text-8xl italic mt-2">
                  Magic.
                </span>
              </h1>

              <p className="text-base md:text-lg mb-8 max-w-md" style={{ color: '#c8c8d8' }}>
                Epic lessons, fun quests, and magical challenges to help kids learn chess and become true grandmasters!
              </p>

              <Link
                href="/learn"
                className="cta-button inline-flex items-center gap-3 px-8 py-4 rounded-lg font-extrabold text-xl md:text-2xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Start Your Quest
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </Link>
            </div>

            {/* Right - Signpost tabs */}
            <div className="hidden md:flex flex-col gap-2.5 items-end pt-16 lg:pt-24 pr-2">
              <SideNavTab href="/learn" label="Learn" />
              <SideNavTab href="/puzzles" label="Practice" />
              <SideNavTab href="/play" label="Battle" />
              <SideNavTab href="/learn" label="Become a Legend!" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="feature-strip">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-4">
            <FeatureItem
              icon={<Image src="/assets/learn_icon.png" alt="Learn" width={64} height={64} />}
              title="Step-by-Step Lessons"
              description="Learn at your own pace"
            />
            <FeatureItem
              icon={<Image src="/assets/puzzles_icon.png" alt="Puzzles" width={64} height={64} />}
              title="Magic Puzzles & Quests"
              description="Solve, learn and earn rewards"
            />
            <FeatureItem
              icon={<Image src="/assets/progress_icon.png" alt="Progress" width={64} height={64} />}
              title="Track Progress & Achievements"
              description="See your growth and shine"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
