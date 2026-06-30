import { create } from 'zustand';

export const AVATAR_PRESETS = [
  { id: 'knight-white', emoji: '♞', label: 'White Knight' },
  { id: 'queen-white', emoji: '♛', label: 'White Queen' },
  { id: 'king-white', emoji: '♚', label: 'White King' },
  { id: 'rook-white', emoji: '♜', label: 'White Rook' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
  { id: 'wizard', emoji: '🧙', label: 'Wizard' },
  { id: 'fairy', emoji: '🧚', label: 'Fairy' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn' },
  { id: 'phoenix', emoji: '🔥', label: 'Phoenix' },
  { id: 'owl', emoji: '🦉', label: 'Owl' },
  { id: 'cat', emoji: '🐱', label: 'Cat' },
  { id: 'wolf', emoji: '🐺', label: 'Wolf' },
];

export interface UserProfile {
  displayName: string;
  avatarId: string;
  createdAt: string;
}

interface ProfileState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateAvatar: (avatarId: string) => void;
  updateDisplayName: (name: string) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()((set, get) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateAvatar: (avatarId) => {
    const current = get().profile;
    if (current) {
      set({ profile: { ...current, avatarId } });
    } else {
      set({ profile: { displayName: '', avatarId, createdAt: new Date().toISOString() } });
    }
  },
  updateDisplayName: (name) => {
    const current = get().profile;
    if (current) {
      set({ profile: { ...current, displayName: name } });
    } else {
      set({ profile: { displayName: name, avatarId: AVATAR_PRESETS[0].id, createdAt: new Date().toISOString() } });
    }
  },
  clearProfile: () => set({ profile: null }),
}));

const PROFILE_KEY_PREFIX = 'chess-kids-profile-';

export function loadProfileForUser(uid: string) {
  const raw = localStorage.getItem(`${PROFILE_KEY_PREFIX}${uid}`);
  if (raw) {
    try {
      const profile = JSON.parse(raw) as UserProfile;
      useProfileStore.getState().setProfile(profile);
    } catch {
      useProfileStore.getState().clearProfile();
    }
  }
}

export function saveProfileForUser(uid: string) {
  const { profile } = useProfileStore.getState();
  if (profile) {
    localStorage.setItem(`${PROFILE_KEY_PREFIX}${uid}`, JSON.stringify(profile));
  }
}

export function clearProfileStorage(uid: string) {
  localStorage.removeItem(`${PROFILE_KEY_PREFIX}${uid}`);
}
