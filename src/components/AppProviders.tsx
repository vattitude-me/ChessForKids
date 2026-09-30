'use client';

import { ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { useProgress } from '@/lib/progress';
import Toasts from './Toasts';
import Onboarding from './Onboarding';
import Mascot from './ui/Mascot';

function Hydrator() {
  useEffect(() => {
    // The store skips automatic hydration so server and client render the same markup.
    Promise.resolve(useProgress.persist.rehydrate()).finally(() => useProgress.setState({ hydrated: true }));
  }, []);
  return null;
}

function Gate({ children }: { children: ReactNode }) {
  const hydrated = useProgress((s) => s.hydrated);
  if (!hydrated) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Mascot mood="think" size={90} className="animate-float" />
        <p className="font-display text-lg font-bold text-muted">Setting up the board…</p>
      </div>
    );
  }
  return <>{children}</>;
}

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Hydrator />
      <Gate>{children}</Gate>
      <Onboarding />
      <Toasts />
    </AuthProvider>
  );
}
