// ─────────────────────────────────────────────────────────────
// SaathiAI — Bookings Service
// Local AsyncStorage is the primary source of truth.
// Firestore is optional — synced when available.
// ─────────────────────────────────────────────────────────────

import {
  collection, query, where, onSnapshot,
  Unsubscribe, doc, updateDoc, setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Booking } from '../types';
import {
  getLocalBookings,
  cancelBookingLocally,
  saveBookingLocally,
} from './localBookings';

export type BookingFilter = 'upcoming' | 'past' | 'cancelled';

// ── Client-side filter + sort ─────────────────────────────────
export function filterBookings(bookings: Booking[], filter: BookingFilter): Booking[] {
  const now = new Date().toISOString();
  if (filter === 'upcoming') {
    return bookings
      .filter(
        b =>
          ['confirmed', 'reminded', 'in_progress'].includes(b.status) &&
          new Date(b.scheduled_iso) >= new Date(),
      )
      .sort((a, b) => a.scheduled_iso.localeCompare(b.scheduled_iso));
  }
  if (filter === 'past') {
    return bookings
      .filter(
        b =>
          b.status === 'completed' ||
          (['confirmed', 'reminded', 'in_progress'].includes(b.status) &&
            new Date(b.scheduled_iso) < new Date()),
      )
      .sort((a, b) => b.scheduled_iso.localeCompare(a.scheduled_iso));
  }
  // cancelled
  return bookings
    .filter(b => b.status === 'cancelled')
    .sort((a, b) => b.scheduled_iso.localeCompare(a.scheduled_iso));
}

// ── Local-first subscription ──────────────────────────────────
/**
 * Subscribe to a user's bookings.
 * Immediately emits from AsyncStorage, then merges with Firestore if available.
 * Returns an unsubscribe function.
 */
export function subscribeToBookings(
  userId: string,
  filter: BookingFilter,
  onData: (bookings: Booking[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  let firestoreUnsub: Unsubscribe | null = null;
  let cancelled = false;

  // 1. Emit local bookings immediately (fast, no network)
  getLocalBookings().then(local => {
    if (!cancelled) onData(filterBookings(local, filter));
  });

  // 2. Attempt real-time Firestore listener; merge with local on success
  try {
    const q = query(collection(db, 'bookings'), where('user_id', '==', userId));

    firestoreUnsub = onSnapshot(
      q,
      async snapshot => {
        if (cancelled) return;

        const firestoreBookings: Booking[] = [];
        snapshot.forEach(d => {
          firestoreBookings.push({ booking_id: d.id, ...d.data() } as Booking);
        });

        // Sync any Firestore bookings into local store so cancel works correctly
        for (const b of firestoreBookings) {
          await saveBookingLocally(b);
        }

        // Re-read local (now merged) and emit
        const merged = await getLocalBookings();
        if (!cancelled) onData(filterBookings(merged, filter));
      },
      async error => {
        console.warn(`[Bookings] Firestore listener error: ${error.message}`);
        // Fall back to local only — already emitted above, nothing extra needed
        onError?.(error);
      },
    );
  } catch (err) {
    console.warn('[Bookings] Could not attach Firestore listener, using local only.');
  }

  return () => {
    cancelled = true;
    firestoreUnsub?.();
  };
}

// ── Cancel a booking ──────────────────────────────────────────
/**
 * Cancels a booking. Updates local store first (always works),
 * then tries Firestore (best-effort).
 */
export async function cancelBooking(bookingId: string): Promise<void> {
  // Local update — guaranteed to work
  await cancelBookingLocally(bookingId);

  // Firestore update — best-effort
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    });
  } catch {
    // Firestore not available — local update is enough for the demo
  }
}

// ── One-shot fetch ────────────────────────────────────────────
export async function getUserBookings(
  userId: string,
  filter: BookingFilter,
): Promise<Booking[]> {
  const local = await getLocalBookings();
  return filterBookings(local, filter);
}
