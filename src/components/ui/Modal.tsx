'use client';

import { ReactNode, useEffect } from 'react';

export default function Modal({ open, onClose, children, className = '' }: { open: boolean; onClose?: () => void; children: ReactNode; className?: string }) {
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-3 backdrop-blur-sm sm:items-center" onClick={onClose} role="dialog" aria-modal="true">
      <div className={`lk-pop max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[28px] border-2 border-line bg-paper p-6 shadow-2xl ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
