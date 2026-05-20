// ─────────────────────────────────────────────────────────────
// SaathiAI — Firebase Initialization
// Reads config from environment variables.
// ─────────────────────────────────────────────────────────────

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';

// Firebase config from env vars (loaded via Expo's Constants or dotenv)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  // Optional — add these to .env.example if needed later
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
};

// ─── Singleton App ───────────────────────────────────────────

let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// ─── Firestore ───────────────────────────────────────────────

export const db: Firestore = getFirestore(app);

// ─── Cloud Messaging (FCM) ──────────────────────────────────
// Messaging is only supported on web & Android; on iOS it needs
// additional native config via expo-notifications.

let messaging: Messaging | null = null;

export async function getMessagingInstance(): Promise<Messaging | null> {
  if (messaging) return messaging;
  const supported = await isSupported();
  if (supported) {
    messaging = getMessaging(app);
  }
  return messaging;
}

export { app };
