import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { useGameStore, PlayerStats, GameRecord } from "./store";
import { useProfileStore, UserProfile } from "./profile-store";

interface GameData {
  playerName: string;
  playerAge: number | null;
  currentDifficultyIndex: number;
  stats: PlayerStats;
  tutorialProgress: number[];
  gameHistory: GameRecord[];
}

interface CloudUserData {
  game: GameData;
  profile: UserProfile | null;
  updatedAt: string;
}

export async function loadFromCloud(uid: string): Promise<boolean> {
  try {
    const ref = doc(getFirebaseDb(), "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;

    const data = snap.data() as CloudUserData;

    if (data.game) {
      useGameStore.setState({
        playerName: data.game.playerName || "",
        playerAge: data.game.playerAge ?? null,
        currentDifficultyIndex: data.game.currentDifficultyIndex || 0,
        stats: { ...useGameStore.getState().stats, ...data.game.stats },
        tutorialProgress: data.game.tutorialProgress || [],
        gameHistory: data.game.gameHistory || [],
      });
    }

    if (data.profile) {
      useProfileStore.getState().setProfile(data.profile);
    }

    return true;
  } catch {
    return false;
  }
}

export async function saveToCloud(uid: string): Promise<void> {
  try {
    const { playerName, playerAge, currentDifficultyIndex, stats, tutorialProgress, gameHistory } =
      useGameStore.getState();
    const { profile } = useProfileStore.getState();

    const data: CloudUserData = {
      game: { playerName, playerAge, currentDifficultyIndex, stats, tutorialProgress, gameHistory },
      profile,
      updatedAt: new Date().toISOString(),
    };

    const ref = doc(getFirebaseDb(), "users", uid);
    await setDoc(ref, data, { merge: true });
  } catch {
    // Silent fail — localStorage still has the data
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
