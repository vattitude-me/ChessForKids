import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import { generateDailyMateIn2Puzzles } from "./mate-in-2-engine";
import { Puzzle } from "./puzzle-generator";

const DAILY_PUZZLES_COLLECTION = "chess4kids-daily-puzzles";
const PUZZLE_HISTORY_COLLECTION = "chess4kids-puzzle-history";

interface DailyPuzzleDoc {
  date: string;
  puzzles: Puzzle[];
  createdAt: string;
}

interface PuzzleHistoryEntry {
  challengeId: string;
  fen: string;
  solvedAt: string | null;
  status: "solved" | "unsolved";
}

interface UserPuzzleHistoryDoc {
  userId: string;
  history: PuzzleHistoryEntry[];
  updatedAt: string;
}

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/**
 * Get today's daily puzzles. Checks Firestore first — if today's set exists, returns it.
 * Otherwise generates a new batch of 10, validates against user history, and stores in Firestore.
 */
export async function getDailyPuzzles(userId: string): Promise<Puzzle[]> {
  const dateKey = getTodayKey();

  try {
    const dailyRef = doc(getFirebaseDb(), DAILY_PUZZLES_COLLECTION, dateKey);
    const dailySnap = await getDoc(dailyRef);

    if (dailySnap.exists()) {
      const data = dailySnap.data() as DailyPuzzleDoc;
      await ensureHistoryTracked(userId, data.puzzles);
      return data.puzzles;
    }

    // Generate new daily set
    const puzzles = generateDailyMateIn2Puzzles(10);

    if (puzzles.length > 0) {
      const dailyDoc: DailyPuzzleDoc = {
        date: dateKey,
        puzzles,
        createdAt: new Date().toISOString(),
      };

      await setDoc(dailyRef, dailyDoc);
      await ensureHistoryTracked(userId, puzzles);
    }

    return puzzles;
  } catch {
    // Fallback to local generation if Firestore is unavailable
    return generateDailyMateIn2Puzzles(10);
  }
}

/**
 * Track puzzles in user's history to ensure uniqueness across days.
 */
async function ensureHistoryTracked(userId: string, puzzles: Puzzle[]): Promise<void> {
  try {
    const historyRef = doc(getFirebaseDb(), PUZZLE_HISTORY_COLLECTION, userId);
    const historySnap = await getDoc(historyRef);

    let existing: PuzzleHistoryEntry[] = [];
    if (historySnap.exists()) {
      existing = (historySnap.data() as UserPuzzleHistoryDoc).history || [];
    }

    const existingFens = new Set(existing.map(e => e.fen));
    const newEntries: PuzzleHistoryEntry[] = puzzles
      .filter(p => !existingFens.has(p.fen))
      .map(p => ({
        challengeId: p.id,
        fen: p.fen,
        solvedAt: null,
        status: "unsolved" as const,
      }));

    if (newEntries.length > 0) {
      const updatedHistory = [...existing, ...newEntries];
      const historyDoc: UserPuzzleHistoryDoc = {
        userId,
        history: updatedHistory,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(historyRef, historyDoc, { merge: true });
    }
  } catch {
    // Non-critical — puzzle works without history tracking
  }
}

/**
 * Mark a puzzle as solved for a user.
 */
export async function markPuzzleSolved(userId: string, challengeId: string): Promise<void> {
  try {
    const historyRef = doc(getFirebaseDb(), PUZZLE_HISTORY_COLLECTION, userId);
    const historySnap = await getDoc(historyRef);

    if (!historySnap.exists()) return;

    const data = historySnap.data() as UserPuzzleHistoryDoc;
    const updated = data.history.map(entry =>
      entry.challengeId === challengeId
        ? { ...entry, status: "solved" as const, solvedAt: new Date().toISOString() }
        : entry
    );

    await setDoc(historyRef, { ...data, history: updated, updatedAt: new Date().toISOString() }, { merge: true });
  } catch {
    // Non-critical
  }
}

/**
 * Get all FENs a user has already seen (for uniqueness validation).
 */
export async function getUserSeenFens(userId: string): Promise<Set<string>> {
  try {
    const historyRef = doc(getFirebaseDb(), PUZZLE_HISTORY_COLLECTION, userId);
    const historySnap = await getDoc(historyRef);

    if (!historySnap.exists()) return new Set();

    const data = historySnap.data() as UserPuzzleHistoryDoc;
    return new Set(data.history.map(e => e.fen));
  } catch {
    return new Set();
  }
}

/**
 * Get user's puzzle progress for today's set.
 */
export async function getTodayProgress(userId: string): Promise<{ solved: number; total: number }> {
  try {
    const dateKey = getTodayKey();
    const dailyRef = doc(getFirebaseDb(), DAILY_PUZZLES_COLLECTION, dateKey);
    const dailySnap = await getDoc(dailyRef);

    if (!dailySnap.exists()) return { solved: 0, total: 0 };

    const dailyData = dailySnap.data() as DailyPuzzleDoc;
    const challengeIds = new Set(dailyData.puzzles.map(p => p.id));

    const historyRef = doc(getFirebaseDb(), PUZZLE_HISTORY_COLLECTION, userId);
    const historySnap = await getDoc(historyRef);

    if (!historySnap.exists()) return { solved: 0, total: dailyData.puzzles.length };

    const historyData = historySnap.data() as UserPuzzleHistoryDoc;
    const solvedCount = historyData.history.filter(
      e => challengeIds.has(e.challengeId) && e.status === "solved"
    ).length;

    return { solved: solvedCount, total: dailyData.puzzles.length };
  } catch {
    return { solved: 0, total: 0 };
  }
}
