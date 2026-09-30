'use client';

import { create } from 'zustand';

/** Transient UI state shared across components (not persisted). */
export const useUi = create<{ focus: boolean; setFocus: (f: boolean) => void }>()((set) => ({
  focus: false,
  setFocus: (focus) => set({ focus }),
}));
