// ─────────────────────────────────────────────────────────────
// SaathiAI — Seed Firestore with mock provider data
//
// Usage:  npx ts-node scripts/seedFirestore.ts
//
// Requires FIREBASE_* env vars to be set (or a .env file).
// Idempotent — uses setDoc with { merge: true }.
// ─────────────────────────────────────────────────────────────

import { config } from 'dotenv';
config(); // load .env from project root

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { providers } from '../src/data/providers';

// ─── Firebase init (script-local, not the app singleton) ────

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// ─── Seed ────────────────────────────────────────────────────

async function seed() {
  console.log(`\n🌱 Seeding ${providers.length} providers to Firestore...\n`);

  for (const provider of providers) {
    const ref = doc(db, 'providers', provider.provider_id);
    await setDoc(ref, provider, { merge: true });
    console.log(
      `  ✅ ${provider.provider_id} — ${provider.name} (${provider.city}/${provider.area})`,
    );
  }

  console.log(
    `\n🎉 Done! ${providers.length} providers written to /providers/{id}.\n`,
  );
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
