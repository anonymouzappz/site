"use client";

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth, googleProvider } from "@/lib/firebase";
import {
  User,
  createUserWithEmailAndPassword,
  linkWithPopup,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
  isLoggedIn: boolean;
  emailVerified: boolean;

  registerWithEmail: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;

  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  resendVerification: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function cleanEmail(email: string) {
  return email.trim().toLowerCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // async function startAnonymousSession() {
    //   try {
    //     await ensureAnonymousUser();
    //   } catch (error) {
    //     console.error("Anonymous auth failed:", error);
    //   }
    // }

    // startAnonymousSession();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!mounted) return;

      if (currentUser) {
        try {
          if (!currentUser.isAnonymous) {
            const profile = doc(db, 'users', currentUser.uid);
            if (!(await getDoc(profile)).exists()) await setDoc(profile, {
              uid: currentUser.uid, displayName: currentUser.displayName || '', email: currentUser.email || '',
              photoURL: currentUser.photoURL || '', role: 'customer', rewardsPoints: 0, lifetimePoints: 0,
              tier: 'Rebel Starter', isDisabled: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
            });
          }
          await currentUser.reload();
          setUser(auth.currentUser);
        } catch {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  async function registerWithEmail(
    name: string,
    email: string,
    password: string
  ) {
    const result = await createUserWithEmailAndPassword(
      auth,
      cleanEmail(email),
      password
    );

    const cleanName = name.trim();

    if (cleanName) {
      await updateProfile(result.user, {
        displayName: cleanName,
      });
    }

    await sendEmailVerification(result.user);

    await result.user.reload();
    setUser(auth.currentUser);
  }

  async function loginWithEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(
      auth,
      cleanEmail(email),
      password
    );

    await result.user.reload();
    setUser(auth.currentUser);
  }

  async function loginWithGoogle() {
    const currentUser = auth.currentUser;

    if (currentUser?.isAnonymous) {
      try {
        const result = await linkWithPopup(currentUser, googleProvider);
        await result.user.reload();
        setUser(auth.currentUser);
        return;
      } catch (error: unknown) {
        const firebaseError = error as { code?: string };

        if (
          firebaseError.code !== "auth/credential-already-in-use" &&
          firebaseError.code !== "auth/provider-already-linked"
        ) {
          throw error;
        }
      }
    }

    const result = await signInWithPopup(auth, googleProvider);
    await result.user.reload();
    setUser(auth.currentUser);
  }

  async function linkGoogleAccount() {
    await loginWithGoogle();
  }

  async function resendVerification() {
    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.isAnonymous || currentUser.emailVerified) {
      return;
    }

    await sendEmailVerification(currentUser);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, cleanEmail(email));
  }

  async function logout() {
    await signOut(auth);

    try {
    //   await ensureAnonymousUser();
    } catch (error) {
      console.error("Anonymous re-login failed:", error);
    }
  }

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAnonymous: !!user?.isAnonymous,
      isLoggedIn: !!user && !user.isAnonymous,
      emailVerified: !!user?.emailVerified,

      registerWithEmail,
      loginWithEmail,
      loginWithGoogle,
      linkGoogleAccount,
      resendVerification,
      resetPassword,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}