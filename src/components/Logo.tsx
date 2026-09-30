export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <rect x="2" y="2" width="44" height="44" rx="14" fill="#5b4df5" />
      <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#lkShine)" />
      {/* knight silhouette */}
      <path
        d="M17 36 h16 c0-4-1-7-3-9 c2-1 4-3 4-6 c0-5-4-9-10-9 c-1 0-2 0-3 1 l-2-3 l-1 4 c-3 2-5 5-5 8 l3 2 c1-1 3-2 5-2 c-3 4-4 8-4 14 z"
        fill="#fff"
      />
      <circle cx="24.5" cy="18.5" r="1.6" fill="#5b4df5" />
      {/* crown sparkle */}
      <path d="M36 8 l1.2 2.8 l2.8 1.2 l-2.8 1.2 l-1.2 2.8 l-1.2 -2.8 l-2.8 -1.2 l2.8 -1.2 z" fill="#ffc83d" />
      <defs>
        <linearGradient id="lkShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={compact ? 34 : 40} />
      <span className="font-display text-xl leading-none font-extrabold text-ink">
        Little<span className="text-primary"> Knights</span>
      </span>
    </span>
  );
}
