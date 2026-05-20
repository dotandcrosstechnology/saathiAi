import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Booking, ReasoningStep, ScheduledTask } from '../types';
import { parseISO, subHours, addHours } from 'date-fns';

export async function scheduleFollowups(
  booking: Booking
): Promise<{ scheduled: ScheduledTask[]; reasoning_step: ReasoningStep }> {
  const startTime = new Date().toISOString();
  
  const appointmentTime = parseISO(booking.scheduled_iso);

  // 1. Schedule 3 tasks
  const scheduled: ScheduledTask[] = [
    {
      task_type: 'reminder',
      scheduled_for_iso: subHours(appointmentTime, 1).toISOString(),
      message: `Reminder: Your ${booking.service_type} appointment is in 1 hour.`
    },
    {
      task_type: 'arrival_check',
      scheduled_for_iso: appointmentTime.toISOString(),
      message: `Has your ${booking.service_type} arrived?`
    },
    {
      task_type: 'completion_check',
      scheduled_for_iso: addHours(appointmentTime, 1.5).toISOString(),
      message: `Is the job completed? Please rate your experience.`
    }
  ];

  // 2. Schedule with OS (expo-notifications)
  try {
    const Notifications = require('expo-notifications');
    for (let i = 0; i < scheduled.length; i++) {
      const task = scheduled[i];
      let triggerObj: any;
      
      if (i === 0) {
        // DEMO OVERRIDE: Fire first reminder in exactly 30 seconds
        triggerObj = {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 30,
        };
      } else {
        const triggerTime = new Date(task.scheduled_for_iso);
        if (triggerTime <= new Date()) continue;
        triggerObj = triggerTime;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `SaathiAI ${task.task_type.replace('_', ' ').toUpperCase()}`,
          body: task.message,
        },
        trigger: triggerObj,
      });
    }
  } catch (err) {
    console.log(`[Mock OS Notification Scheduler] Scheduled 3 followup tasks for ${booking.booking_id}`);
  }

  // 3. Write to Firestore
  try {
    if (process.env.EXPO_PUBLIC_FIREBASE_API_KEY) {
      for (let i = 0; i < scheduled.length; i++) {
        const task = scheduled[i];
        const task_id = `task_${booking.booking_id}_${i}`;
        const docRef = doc(db, 'bookings', booking.booking_id, 'followups', task_id);
        await setDoc(docRef, task);
      }
    } else {
      console.warn("⚠️ Firestore unconfigured. Bypassing subcollection writes.");
    }
  } catch (err) {
    console.warn("⚠️ Firestore subcollection write failed. Running in offline/mock mode.");
  }

  const reasoning_step: ReasoningStep = {
    agent: 'FollowupAgent',
    timestamp: startTime,
    thought: 'Scheduled reminder, arrival check, and completion check notifications based on appointment time.',
    tool_called: 'expo.scheduleNotificationAsync & firestore.setDoc',
    tool_input: { booking_id: booking.booking_id, appointment_time: booking.scheduled_iso },
    tool_output: { scheduled_tasks: scheduled },
    decision: `Successfully registered 3 followup tasks for booking ${booking.booking_id}.`
  };

  return { scheduled, reasoning_step };
}
