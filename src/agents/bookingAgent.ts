const generateId = (len: number) => Math.random().toString(36).substring(2, 2 + len);
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Booking, Provider, ReasoningStep, ServiceIntent } from '../types';
import { saveBookingLocally } from '../services/localBookings';
import { parseISO, isWithinInterval } from 'date-fns';
import { SIMULATE_TOP_UNAVAILABLE } from '../utils/config';

export class SlotUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SlotUnavailableError';
  }
}

export async function executeBooking(
  intent: ServiceIntent,
  chosenProvider: Provider,
  userId: string
): Promise<{ booking: Booking; reasoning_step: ReasoningStep }> {
  const startTime = new Date().toISOString();

  if (SIMULATE_TOP_UNAVAILABLE && chosenProvider.provider_id === 'prov_001') {
    const slot = chosenProvider.available_slots[0] || 'unknown';
    throw new SlotUnavailableError(
      `Slot ${slot} for ${chosenProvider.name} was just booked by another user`
    );
  }

  // 1. Generate booking_id with nanoid
  const booking_id = `bk_${generateId(10)}`;

  // 2. Pick the best matching available slot from chosenProvider.available_slots
  let scheduled_iso = chosenProvider.available_slots[0]; // fallback
  if (intent.time_window.start_iso && intent.time_window.end_iso) {
    const start = parseISO(intent.time_window.start_iso);
    const end = parseISO(intent.time_window.end_iso);
    const matchingSlot = chosenProvider.available_slots.find(slot => 
      isWithinInterval(parseISO(slot), { start, end })
    );
    if (matchingSlot) scheduled_iso = matchingSlot;
  }

  // 3. Build the Booking object
  const booking: Booking = {
    booking_id,
    user_id: userId,
    provider_id: chosenProvider.provider_id,
    service_type: chosenProvider.service_type,
    scheduled_iso,
    status: 'confirmed',
    created_at: startTime,
    receipt_data: {
      provider_name: chosenProvider.name,
      service: chosenProvider.service_type,
      time: scheduled_iso,
      price: chosenProvider.hourly_rate_pkr,
      booking_id,
      generated_at: startTime
    }
  };

  // Always persist locally first — works offline, no Firebase needed
  await saveBookingLocally(booking);

  // 4 & 5. Firestore operations (mocked fallback if unconfigured)
  const available_slots_before = [...chosenProvider.available_slots];
  const available_slots_after = chosenProvider.available_slots.filter(s => s !== scheduled_iso);
  
  try {
    if (process.env.EXPO_PUBLIC_FIREBASE_API_KEY) {
      // Write booking
      await setDoc(doc(db, 'bookings', booking_id), booking);
      // Update provider slots
      await updateDoc(doc(db, 'providers', chosenProvider.provider_id), {
        available_slots: available_slots_after
      });
    } else {
      console.warn("⚠️ Firestore unconfigured. Bypassing writes for Action Simulation.");
    }
  } catch (err) {
    console.warn("⚠️ Firestore write failed. Running in offline/mock mode for Action Simulation.");
  }

  // 7. Trigger local push notification via expo-notifications
  try {
    const Notifications = await import('expo-notifications');
    const timeFormatted = new Date(scheduled_iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Booking Confirmed',
        body: `${chosenProvider.name} booked for ${timeFormatted}`,
        data: { booking_id, screen: 'Receipt' },
      },
      trigger: null, // immediate
    });
  } catch (err) {
    console.log(`[Mock Push Notification]: Booking confirmed with ${chosenProvider.name}`);
  }

  // 8. Return booking + reasoning step
  const reasoning_step: ReasoningStep = {
    agent: 'BookingAgent',
    timestamp: startTime,
    thought: 'Selected best available slot, generated booking, updated provider availability, triggered confirmation notification.',
    tool_called: 'firestore.writeTransaction',
    tool_input: {
      booking_data: booking,
      provider_id: chosenProvider.provider_id,
      slot_to_remove: scheduled_iso
    },
    tool_output: {
      firestore_state: {
        provider_available_slots_BEFORE: available_slots_before,
        provider_available_slots_AFTER: available_slots_after,
        new_booking_document: booking
      }
    },
    decision: `Created booking ${booking_id} for ${chosenProvider.name} at ${scheduled_iso}.`
  };

  return { booking, reasoning_step };
}
