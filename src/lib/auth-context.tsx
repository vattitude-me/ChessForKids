"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { useProgress } from "./progress";
import { loadFromCloud, debouncedSaveToCloud, flushCloudSave, saveToCloud } from "./firestore-sync";

const toEmail = (username: string) => `${username.toLowerCase().trim()}@chessforkids.app`;

/** Cloud accounts are optional: the app works fully offline as a guest. */
export const cloudEnabled = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

interface AuthContextType {
  user: User | null;
  username: string | null;
  loading: boolean;
  syncing: boolean;
  cloudEnabled: boolean;
  signIn: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(cloudEnabled);
  const [syncing, setSyncing] = useState(false);
  const currentUid = useRef<string | null>(null);

  useEffect(() => {
    if (!cloudEnabled) return;

    let resolved = false;
    // Never block the UI on Firebase: after 3s we carry on as a guest.
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setLoading(false);
      }
    }, 3000);

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (u) => {
      resolved = true;
      clearTimeout(timeout);
      setUser(u);
      setLoading(false);

      if (u && u.uid !== currentUid.current) {
        currentUid.current = u.uid;
        setSyncing(true);
        Promise.race([
          loadFromCloud(u.uid),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000)),
        ]).then((cloud) => {
          const local = useProgress.getState();
          const localIsFresh = local.xp === 0 && !local.profile.onboarded;
          if (cloud && (localIsFresh || cloud.updatedAt > local.updatedAt)) {
            useProgress.getState().replaceAll(cloud);
          } else {
            saveToCloud(u.uid);
          }
          setSyncing(false);
        });
      } else if (!u && currentUid.current) {
        currentUid.current = null;
      }
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  // Keep the cloud copy fresh while signed in.
  useEffect(() => {
    return useProgress.subscribe((state, prev) => {
      if (currentUid.current && state.updatedAt !== prev.updatedAt) {
        debouncedSaveToCloud(currentUid.current);
      }
    });
  }, []);

  const signIn = useCallback(async (username: string, password: string, rememberMe = true) => {
    const auth = getFirebaseAuth();
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, toEmail(username), password);
  }, []);

  const signUp = useCallback(async (username: string, password: string) => {
    const auth = getFirebaseAuth();
    await setPersistence(auth, browserLocalPersistence);
    await createUserWithEmailAndPassword(auth, toEmail(username), password);
  }, []);

  const signOutUser = useCallback(async () => {
    if (currentUid.current) {
      await flushCloudSave(currentUid.current);
    }
    await firebaseSignOut(getFirebaseAuth());
    currentUid.current = null;
    // Shared family devices: start the next player fresh.
    useProgress.getState().resetAll();
  }, []);

  const username = user?.email?.replace("@chessforkids.app", "") || null;

  return (
    <AuthContext.Provider value={{ user, username, loading, syncing, cloudEnabled, signIn, signUp, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
