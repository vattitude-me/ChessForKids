import Link from 'next/link';
import { ReactNode } from 'react';

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-1.5 font-display text-xl font-extrabold text-ink">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <Link href="/profile" className="text-sm font-bold text-muted hover:text-ink">
        &larr; Back
      </Link>
      <h1 className="mt-3 font-display text-4xl font-extrabold">{title}</h1>
      <p className="mt-1 text-sm font-bold text-muted">Last updated {updated}</p>
      <div className="card mt-6 space-y-6 p-6 leading-relaxed font-semibold text-muted [&_li]:ml-5 [&_li]:list-disc">{children}</div>
    </div>
  );
}
