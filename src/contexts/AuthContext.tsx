import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, onAuthChange, signIn, signUp, signOut as authSignOut } from '../services/auth';
import { clearLocalBookings, invalidateLocalCache } from '../services/localBookings';
import { db } from '../services/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  city: 'Islamabad' | 'Lahore' | 'Karachi';
  createdAt: string;
  phoneNumber?: string;
  totalBookings: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: typeof signIn;
  signUp: typeof signUp;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isFirstRun: boolean;
  setIsFirstRun: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstRun, setIsFirstRun] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const wrappedSignUp = async (...args: Parameters<typeof signUp>) => {
    invalidateLocalCache(); // fresh slate for new user
    const res = await signUp(...args);
    setIsFirstRun(true);
    return res;
  };

  const wrappedSignOut = async () => {
    // Clear local state immediately — navigation happens right away,
    // no need to wait for Firebase's async callback
    setUser(null);
    setProfile(null);
    await clearLocalBookings();
    // Firebase sign-out is best-effort — may fail without a valid project
    try { await authSignOut(); } catch (e) { console.warn('Firebase signOut:', e); }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const merged = { ...profile, ...updates } as UserProfile;
    await setDoc(doc(db, 'users', user.uid), merged, { merge: true });
    setProfile(merged);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp: wrappedSignUp, signOut: wrappedSignOut, updateProfile, isFirstRun, setIsFirstRun }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
