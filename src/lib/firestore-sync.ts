import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { useGameStore, PlayerStats, GameRecord } from "./store";
import { useProfileStore, UserProfile } from "./profile-store";
import { encryptPii, decryptPii } from "./crypto";

interface GameData {
  playerName: string;
  playerAge: string | null;
  currentDifficultyIndex: number;
  stats: PlayerStats;
  tutorialProgress: number[];
  gameHistory: GameRecord[];
}

interface CloudUserData {
  game: GameData;
  profile: { displayName: string; avatarId: string; createdAt: string } | null;
  updatedAt: string;
}

export async function loadFromCloud(uid: string): Promise<boolean> {
  try {
    const ref = doc(getFirebaseDb(), "chess4kids-users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;

    const data = snap.data() as CloudUserData;

    if (data.game) {
      const playerName = await decryptPii(data.game.playerName || "", uid);
      let playerAge: number | null = null;
      if (data.game.playerAge) {
        const ageStr = await decryptPii(data.game.playerAge, uid);
        playerAge = ageStr ? parseInt(ageStr, 10) : null;
        if (isNaN(playerAge as number)) playerAge = null;
      }

      useGameStore.setState({
        playerName,
        playerAge,
        currentDifficultyIndex: data.game.currentDifficultyIndex || 0,
        stats: { ...useGameStore.getState().stats, ...data.game.stats },
        tutorialProgress: data.game.tutorialProgress || [],
        gameHistory: data.game.gameHistory || [],
      });
    }

    if (data.profile) {
      const displayName = await decryptPii(data.profile.displayName || "", uid);
      const profile: UserProfile = {
        displayName,
        avatarId: data.profile.avatarId,
        createdAt: data.profile.createdAt,
      };
      useProfileStore.getState().setProfile(profile);
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

    // Encrypt PII fields only
    const encPlayerName = await encryptPii(playerName, uid);
    const encPlayerAge = playerAge != null ? await encryptPii(String(playerAge), uid) : null;

    const gameData: GameData = {
      playerName: encPlayerName,
      playerAge: encPlayerAge,
      currentDifficultyIndex,
      stats,
      tutorialProgress,
      gameHistory,
    };

    let encProfile: CloudUserData["profile"] = null;
    if (profile) {
      encProfile = {
        displayName: await encryptPii(profile.displayName, uid),
        avatarId: profile.avatarId,
        createdAt: profile.createdAt,
      };
    }

    const data: CloudUserData = {
      game: gameData,
      profile: encProfile,
      updatedAt: new Date().toISOString(),
    };

    const ref = doc(getFirebaseDb(), "chess4kids-users", uid);
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
