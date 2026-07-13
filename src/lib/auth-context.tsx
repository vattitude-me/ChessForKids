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
import { useGameStore, loadGameForUser, saveGameForUser } from "./store";
import { useProfileStore, loadProfileForUser, saveProfileForUser } from "./profile-store";
import { loadFromCloud, debouncedSaveToCloud, flushCloudSave } from "./firestore-sync";

const toEmail = (username: string) => `${username.toLowerCase().trim()}@chessforkids.app`;

interface AuthContextType {
  user: User | null;
  username: string | null;
  loading: boolean;
  signIn: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUid = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      setLoading(false);
      return;
    }

    let resolved = false;

    // Hard timeout: if Firebase Auth hasn't responded in 3s (e.g. network
    // blocked, token refresh failing), stop showing the splash and fall through
    // to the login screen.
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        setLoading(false);
      }
    }, 3000);

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (u) => {
      if (resolved && !u) return; // timeout already showed login screen
      resolved = true;
      clearTimeout(timeout);

      if (u && u.uid !== currentUid.current) {
        currentUid.current = u.uid;
        // Load localStorage immediately so the UI can render
        loadGameForUser(u.uid);
        loadProfileForUser(u.uid);
        setUser(u);
        setLoading(false);
        // Cloud sync in background with a 5s timeout
        Promise.race([
          loadFromCloud(u.uid),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000)),
        ]).then((loaded) => {
          if (loaded) {
            saveGameForUser(u.uid);
            saveProfileForUser(u.uid);
          }
        });
      } else if (!u && currentUid.current) {
        currentUid.current = null;
        useGameStore.getState().resetStats();
        useProfileStore.getState().clearProfile();
        setUser(u);
        setLoading(false);
      } else {
        setUser(u);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  // Auto-save on store changes (localStorage + cloud)
  useEffect(() => {
    const unsubGame = useGameStore.subscribe(() => {
      if (currentUid.current) {
        saveGameForUser(currentUid.current);
        debouncedSaveToCloud(currentUid.current);
      }
    });
    const unsubProfile = useProfileStore.subscribe(() => {
      if (currentUid.current) {
        saveProfileForUser(currentUid.current);
        debouncedSaveToCloud(currentUid.current);
      }
    });
    return () => { unsubGame(); unsubProfile(); };
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
      saveGameForUser(currentUid.current);
      saveProfileForUser(currentUid.current);
      await flushCloudSave(currentUid.current);
    }
    await firebaseSignOut(getFirebaseAuth());
  }, []);

  const username = user?.email?.replace("@chessforkids.app", "") || null;

  return (
    <AuthContext.Provider value={{ user, username, loading, signIn, signUp, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
