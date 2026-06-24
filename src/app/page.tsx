'use client';

import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';

function PathCard({
  href,
  icon,
  title,
  description,
  accent,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  badge?: string;
}) {
  return (
    <Link href={href} className="home-path-card group" style={{ '--card-accent': accent } as React.CSSProperties}>
      {badge && <span className="home-path-badge">{badge}</span>}
      <div className="home-path-card-icon">{icon}</div>
      <h3 className="home-path-card-title">{title}</h3>
      <p className="home-path-card-desc">{description}</p>
      <span className="home-path-card-cta">
        Begin
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

function StatBubble({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="home-stat-bubble">
      <span className="home-stat-icon">{icon}</span>
      <span className="home-stat-value">{value}</span>
      <span className="home-stat-label">{label}</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="home-page min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="home-hero relative overflow-hidden">
        <Image
          src="/hero_image.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        <div className="home-hero-overlay absolute inset-0" />
        <div className="home-hero-overlay-bottom absolute inset-0" />

        <div className="home-hero-content relative z-10">
          <div className="home-hero-text">
            <h1 className="home-hero-headline">
              <span className="home-hero-headline-top">Learn Chess.</span>
              <span className="home-hero-headline-mid">Unlock Your</span>
              <span className="home-hero-headline-magic">Magic.</span>
            </h1>

            <p className="home-hero-subtext">
              Epic quests, magical puzzles, and step-by-step lessons to help young minds master the game of kings.
            </p>

            <div className="home-hero-actions">
              <Link href="/learn" className="home-hero-cta-primary">
                <span>Start Your Quest</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/play" className="home-hero-cta-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Play a Game</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="home-hero-scroll">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* Choose Your Path Section */}
      <section className="home-paths-section">
        <div className="home-paths-container">
          <div className="home-paths-header">
            <h2 className="home-paths-title">Choose Your Path</h2>
            <p className="home-paths-subtitle">Every grandmaster starts with a single move</p>
          </div>

          <div className="home-paths-grid">
            <PathCard
              href="/learn"
              accent="#d4a843"
              badge="Start Here"
              icon={<Image src="/assets/learn_icon.png" alt="" width={72} height={72} className="object-contain" />}
              title="Learn"
              description="Step-by-step lessons from beginner to master. Learn pieces, tactics, and strategy."
            />
            <PathCard
              href="/learn"
              accent="#a0475a"
              icon={<Image src="/assets/puzzles_icon.png" alt="" width={72} height={72} className="object-contain" />}
              title="Solve"
              description="Magical puzzles and challenges that sharpen your skills and earn rewards."
            />
            <PathCard
              href="/play"
              accent="#6c5ce7"
              icon={<Image src="/assets/progress_icon.png" alt="" width={72} height={72} className="object-contain" />}
              title="Play"
              description="Battle the AI, track your progress, and prove your mastery on the board."
            />
          </div>
        </div>
      </section>

      {/* Progress & Rewards Preview */}
      <section className="home-rewards-section">
        <div className="home-rewards-container">
          <div className="home-rewards-content">
            <div className="home-rewards-text">
              <h2 className="home-rewards-title">Earn Rewards & Level Up</h2>
              <p className="home-rewards-desc">
                Complete lessons, solve puzzles, and win games to collect achievements and unlock new challenges.
              </p>
              <div className="home-rewards-stats">
                <StatBubble icon="⭐" value="12" label="Lessons" />
                <StatBubble icon="🧩" value="50+" label="Puzzles" />
                <StatBubble icon="🏆" value="∞" label="Games" />
              </div>
            </div>
            <div className="home-rewards-visual">
              <div className="home-rewards-badge-stack">
                <div className="home-reward-badge home-reward-badge-1">🏰</div>
                <div className="home-reward-badge home-reward-badge-2">⚔️</div>
                <div className="home-reward-badge home-reward-badge-3">🐉</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
