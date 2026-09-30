/* eslint-disable @next/next/no-img-element */

export function LogoMark({ size = 40 }: { size?: number }) {
  return <img src="/brand/logo-mark.svg" width={size} height={size} alt="" aria-hidden="true" />;
}

/** The Chess 4 Kids lockup: shield knight + wordmark (public/brand/logo.svg). */
export default function Logo({ compact = false }: { compact?: boolean }) {
  const h = compact ? 34 : 42;
  return <img src="/brand/logo.svg" height={h} width={Math.round((h * 921) / 240)} alt="Chess 4 Kids" style={{ height: h, width: 'auto' }} />;
}
