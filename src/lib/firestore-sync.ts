import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { encryptPii, decryptPii } from "./crypto";
import { ProgressData, defaultProgress, getProgressData, AVATARS } from "./progress";

// Cloud documents live in the same collection as v1. Version 2 progress is
// stored under the `v2` field; the legacy `game`/`profile` fields are left
// untouched so an older build of the app can still read them.
const COLLECTION = "chess4kids-users";

interface LegacyStats {
  totalGames?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  puzzlesSolved?: number;
  xp?: number;
  bestStreak?: number;
}

interface CloudDoc {
  v2?: ProgressData;
  game?: { playerName?: string; stats?: LegacyStats };
  profile?: { displayName?: string; avatarId?: string } | null;
  updatedAt?: string;
}

const LEGACY_AVATARS: Record<string, string> = {
  dragon: "🐲", wizard: "🦉", fairy: "🦄", unicorn: "🦄", phoenix: "🚀", owl: "🦉", cat: "🐯", wolf: "🦊",
};

/** Reads a user's progress from Firestore. Migrates v1 data when that's all there is. */
export async function loadFromCloud(uid: string): Promise<ProgressData | null> {
  try {
    const snap = await getDoc(doc(getFirebaseDb(), COLLECTION, uid));
    if (!snap.exists()) return null;
    const data = snap.data() as CloudDoc;

    if (data.v2) {
      const name = await decryptPii(data.v2.profile?.name || "", uid);
      const age = getProgressData().profile.age;
      return { ...data.v2, profile: { ...data.v2.profile, name, age } };
    }

    if (data.game || data.profile) {
      // One-time import of the original Chess Quest progress.
      const base = defaultProgress();
      const stats = data.game?.stats ?? {};
      const name = await decryptPii(data.profile?.displayName || data.game?.playerName || "", uid);
      const avatarId = data.profile?.avatarId ?? "";
      base.profile = {
        ...base.profile,
        name,
        avatar: LEGACY_AVATARS[avatarId] ?? AVATARS[0],
        onboarded: !!name,
      };
      base.xp = stats.xp ?? 0;
      base.games = {
        ...base.games,
        played: stats.totalGames ?? 0,
        wins: stats.wins ?? 0,
        losses: stats.losses ?? 0,
        draws: stats.draws ?? 0,
      };
      base.puzzles = { ...base.puzzles, solved: stats.puzzlesSolved ?? 0 };
      base.updatedAt = new Date(0).toISOString(); // let any newer local data win
      return base;
    }
    return null;
  } catch {
    return null;
  }
}

function stripUndefined<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export async function saveToCloud(uid: string): Promise<void> {
  try {
    const data = getProgressData();
    const encName = await encryptPii(data.profile.name, uid);
    // The age range never leaves the device.
    const v2: ProgressData = stripUndefined({ ...data, profile: { ...data.profile, name: encName, age: null } });
    await setDoc(doc(getFirebaseDb(), COLLECTION, uid), { v2, updatedAt: new Date().toISOString() }, { merge: true });
  } catch {
    // Silent fail: localStorage still has the data
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function debouncedSaveToCloud(uid: string): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveToCloud(uid);
  }, 2000);
}

export function flushCloudSave(uid: string): Promise<void> {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  return saveToCloud(uid);
}
