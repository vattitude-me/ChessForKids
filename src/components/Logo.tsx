/* eslint-disable @next/next/no-img-element */

export function LogoMark({ size = 40 }: { size?: number }) {
  return <img src="/brand/logo-mark.svg" width={size} height={size} alt="" aria-hidden="true" />;
}

/** "Chess 4 Kids" lockup: knight mark + wordmark with the 4 in a sunny badge. */
export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label="Chess 4 Kids">
      <LogoMark size={compact ? 34 : 40} />
      <span className="flex items-center gap-1 font-display text-xl leading-none font-extrabold text-ink" aria-hidden="true">
        Chess
        <span className="inline-flex h-6 w-6 -rotate-8 items-center justify-center rounded-full border-2 border-sun-dark bg-sun text-sm text-ink">4</span>
        <span className="text-primary">Kids</span>
      </span>
    </span>
  );
}
