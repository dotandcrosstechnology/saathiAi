// ─────────────────────────────────────────────────────────────
// SaathiAI — Local Booking Store
// AsyncStorage-backed, in-memory-cached booking persistence.
// Works fully offline — Firestore is optional bonus.
// ─────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking } from '../types';

const STORAGE_KEY = '@saathi_bookings_v2';
let _cache: Booking[] | null = null;

// ── internal helpers ─────────────────────────────────────────

async function load(): Promise<Booking[]> {
  if (_cache !== null) return _cache;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    _cache = raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    _cache = [];
  }
  return _cache!;
}

async function persist(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(_cache ?? []));
  } catch {}
}

// ── public API ───────────────────────────────────────────────

export async function saveBookingLocally(booking: Booking): Promise<void> {
  const list = await load();
  // Upsert — replace if booking_id already exists
  _cache = [booking, ...list.filter(b => b.booking_id !== booking.booking_id)];
  await persist();
}

export async function cancelBookingLocally(bookingId: string): Promise<void> {
  const list = await load();
  _cache = list.map(b =>
    b.booking_id === bookingId
      ? { ...b, status: 'cancelled' as Booking['status'], cancelled_at: new Date().toISOString() }
      : b,
  );
  await persist();
}

export async function getLocalBookings(): Promise<Booking[]> {
  return load();
}

export async function clearLocalBookings(): Promise<void> {
  _cache = [];
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/** Call this to force a reload from AsyncStorage (e.g. after sign-in). */
export function invalidateLocalCache(): void {
  _cache = null;
}
