// ─────────────────────────────────────────────────────────────
// SaathiAI — Date Formatting Helpers
// ─────────────────────────────────────────────────────────────
import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
} from 'date-fns';

/**
 * "Today, 3:00 PM" / "Tomorrow, 10:00 AM" / "Mon, May 17, 2:00 PM"
 */
export function formatRelative(iso: string): string {
  try {
    const date = parseISO(iso);
    const time = format(date, 'h:mm a');

    if (isToday(date)) return `Today, ${time}`;
    if (isTomorrow(date)) return `Tomorrow, ${time}`;
    if (isYesterday(date)) return `Yesterday, ${time}`;

    return format(date, 'EEE, MMM d, h:mm a');
  } catch {
    return iso;
  }
}

/**
 * "Monday, May 17, 2026 at 10:00 AM"
 */
export function formatFull(iso: string): string {
  try {
    const date = parseISO(iso);
    return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
  } catch {
    return iso;
  }
}

/**
 * "May 17, 2026"
 */
export function formatDateOnly(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return iso;
  }
}

/**
 * "10:00 AM"
 */
export function formatTimeOnly(iso: string): string {
  try {
    return format(parseISO(iso), 'h:mm a');
  } catch {
    return iso;
  }
}
