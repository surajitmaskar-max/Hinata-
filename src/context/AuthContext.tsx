import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateAuthProfile,
  deleteUser,
  signInAnonymously,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import {
  getUserProfile,
  setUserProfile,
  updateUserProfile,
  deleteAllUserData,
  UserProfileData,
} from '../firebase/userRepository';
import { JarvisLanguage } from '../types/jarvis';
import { speechManager } from '../utils/speech';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (
    email: string,
    pass: string,
    displayName: string,
    language?: JarvisLanguage,
    voice?: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithDemoAccount: (accountName: 'Surajit' | 'Hinata Fan') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPreferences: (data: Partial<UserProfileData>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  wipeAllUserData: () => Promise<void>;
  getPersonalizedGreeting: (nameOverride?: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfileState] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          let profile = await getUserProfile(user.uid);
          if (!profile) {
            // First time login for this user - initialize profile
            profile = {
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || `${user.uid}@hinata.ai`,
              photoURL: user.photoURL || undefined,
              preferredLanguage: 'en',
              preferredVoice: 'hinata_sweet',
              createdAt: new Date().toISOString(),
            };
            await setUserProfile(user.uid, profile);
          }
          setUserProfileState(profile);

          // Greet user with Hinata anime voice!
          const greetingText = generateGreeting(profile.displayName, profile.preferredLanguage);
          speechManager.speakHinata(greetingText, 'greeting');
        } catch (error) {
          console.error('Failed to load user profile from Firestore:', error);
        }
      } else {
        setUserProfileState(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateGreeting = (name: string, lang: JarvisLanguage = 'en') => {
    if (lang === 'bn') {
      return `আবার স্বাগতম, ${name}! 💜 হিনাটা আজ তোমার সাহায্য করতে প্রস্তুত। বলো, কী সাহায্য করতে পারি?`;
    } else if (lang === 'hi') {
      return `वापसी पर स्वागत है, ${name}! 💜 हिनाटा आज आपकी सहायता के लिए तैयार है। बताइए, मैं क्या करूँ?`;
    }
    return `Welcome back, ${name}! 💜 Hinata is ready to help you today. What can I do for you?`;
  };

  const getPersonalizedGreeting = (nameOverride?: string) => {
    const name = nameOverride || userProfile?.displayName || currentUser?.displayName || 'Friend';
    const lang = userProfile?.preferredLanguage || 'en';
    return generateGreeting(name, lang);
  };

  const login = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const profile = await getUserProfile(cred.user.uid);
    if (profile) setUserProfileState(profile);
  };

  const signup = async (
    email: string,
    pass: string,
    displayName: string,
    language: JarvisLanguage = 'en',
    voice: string = 'hinata_sweet'
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateAuthProfile(cred.user, { displayName });

    const newProfile: UserProfileData = {
      displayName: displayName.trim() || 'User',
      email: cred.user.email || email,
      preferredLanguage: language,
      preferredVoice: voice,
      createdAt: new Date().toISOString(),
    };

    await setUserProfile(cred.user.uid, newProfile);
    setUserProfileState(newProfile);
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const existing = await getUserProfile(cred.user.uid);
    if (!existing) {
      const newProfile: UserProfileData = {
        displayName: cred.user.displayName || 'Google User',
        email: cred.user.email || 'user@gmail.com',
        photoURL: cred.user.photoURL || undefined,
        preferredLanguage: 'en',
        preferredVoice: 'hinata_sweet',
        createdAt: new Date().toISOString(),
      };
      await setUserProfile(cred.user.uid, newProfile);
      setUserProfileState(newProfile);
    } else {
      setUserProfileState(existing);
    }
  };

  // Quick Account switch for verifying cross-user isolation
  const loginWithDemoAccount = async (accountName: 'Surajit' | 'Hinata Fan') => {
    const email =
      accountName === 'Surajit'
        ? 'surajit.demo@hinata.ai'
        : 'hinatafan.tester@hinata.ai';
    const password = 'Password@123!';
    const displayName = accountName === 'Surajit' ? 'Surajit' : 'Hinata Fan';

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // Register it if not yet created
        await signup(email, password, displayName, accountName === 'Surajit' ? 'en' : 'bn');
      } else {
        // Fallback to anonymous signin if email auth is disabled in project
        const anon = await signInAnonymously(auth);
        await updateAuthProfile(anon.user, { displayName });
        const demoProfile: UserProfileData = {
          displayName,
          email: `${displayName.toLowerCase().replace(/\s+/g, '')}@hinata.ai`,
          preferredLanguage: accountName === 'Surajit' ? 'en' : 'bn',
          preferredVoice: 'hinata_sweet',
          createdAt: new Date().toISOString(),
        };
        await setUserProfile(anon.user.uid, demoProfile);
        setUserProfileState(demoProfile);
      }
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfileState(null);
    setCurrentUser(null);
  };

  const updateUserPreferences = async (data: Partial<UserProfileData>) => {
    if (!currentUser) return;
    await updateUserProfile(currentUser.uid, data);
    if (data.displayName && currentUser) {
      await updateAuthProfile(currentUser, { displayName: data.displayName });
    }
    setUserProfileState((prev) => (prev ? { ...prev, ...data } : null));
  };

  const wipeAllUserData = async () => {
    if (!currentUser) return;
    await deleteAllUserData(currentUser.uid);
    // recreate empty profile
    if (userProfile) {
      await setUserProfile(currentUser.uid, userProfile);
    }
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    await deleteAllUserData(uid);
    await deleteUser(currentUser);
    setUserProfileState(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        login,
        signup,
        loginWithGoogle,
        loginWithDemoAccount,
        resetPassword,
        logout,
        updateUserPreferences,
        deleteAccount,
        wipeAllUserData,
        getPersonalizedGreeting,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
