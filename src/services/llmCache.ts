// In-memory LLM response cache.
// Demo phrases are pre-populated so the 3 core flows never burn quota.

export interface CacheEntry {
  content: string;
  provider: 'cache';
}

// djb2 hash — fast, collision-resistant enough for a session cache
function djb2(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

// Strip timestamp lines so the same message always hashes identically
function normalize(s: string): string {
  return s.replace(/^Current timestamp: .+$/m, '').trim();
}

export function computeKey(systemPrompt: string, userPrompt: string): string {
  return djb2(normalize(systemPrompt) + '||' + normalize(userPrompt));
}

// ─── Pre-populated demo intents ──────────────────────────────

const DEMO_INTENTS: Array<{ phrase: string; intent: object }> = [
  {
    phrase: 'Mujhe kal subah G-13 mein AC technician chahiye',
    intent: {
      service_type: 'ac_technician',
      sub_type: null,
      location: { city: 'Islamabad', area: 'G-13', confidence: 'high' },
      time_window: {
        start_iso: null,
        end_iso: null,
        interpretation: 'kal subah (tomorrow morning 06:00–11:59)',
      },
      urgency: 'normal',
      language_detected: 'roman_urdu',
      constraints: [],
      needs_clarification: false,
      clarification_question: null,
      reasoning: 'User needs AC technician tomorrow morning in G-13 Islamabad. [cached demo]',
    },
  },
  {
    phrase: 'yaar urgent plumber chahye, paani leak ho raha hai',
    intent: {
      service_type: 'plumber',
      sub_type: 'water_leak',
      location: { city: null, area: null, confidence: 'low' },
      time_window: {
        start_iso: null,
        end_iso: null,
        interpretation: 'abhi/foran — emergency now',
      },
      urgency: 'emergency',
      language_detected: 'roman_urdu',
      constraints: ['water_leak_active'],
      needs_clarification: true,
      clarification_question: 'Bhai aapka area aur city batao taake hum kareeb ka plumber bhej sakein?',
      reasoning: 'Emergency water leak — plumber needed immediately. Location unknown. [cached demo]',
    },
  },
  {
    phrase: 'AC technician chahiye',
    intent: {
      service_type: 'ac_technician',
      sub_type: null,
      location: { city: null, area: null, confidence: 'low' },
      time_window: {
        start_iso: null,
        end_iso: null,
        interpretation: 'anytime in next 24 hours',
      },
      urgency: 'normal',
      language_detected: 'roman_urdu',
      constraints: [],
      needs_clarification: true,
      clarification_question: 'Aapka area aur city batao, aur kab chahiye?',
      reasoning: 'AC technician needed but no location or time given. [cached demo]',
    },
  },
];

// ─── Session cache ────────────────────────────────────────────

const sessionCache = new Map<string, CacheEntry>();

export function getDemoIntent(userPrompt: string): string | null {
  for (const { phrase, intent } of DEMO_INTENTS) {
    if (userPrompt.includes(phrase)) {
      return JSON.stringify(intent);
    }
  }
  return null;
}

export function getFromCache(key: string): CacheEntry | undefined {
  return sessionCache.get(key);
}

export function setInCache(key: string, content: string): void {
  sessionCache.set(key, { content, provider: 'cache' });
}
