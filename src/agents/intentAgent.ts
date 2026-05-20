// ─────────────────────────────────────────────────────────────
// SaathiAI — Intent Agent
// Converts free-form user messages (Roman Urdu, Urdu, English,
// mixed) into a structured ServiceIntent JSON object.
// ─────────────────────────────────────────────────────────────

import { callLLM } from '../services/llm';
import { ServiceIntent, ReasoningStep } from '../types';

// ─── System Prompt ───────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Intent Agent for SaathiAI, a service orchestrator for Pakistan's informal economy. Users send messages in Roman Urdu, Urdu, English, or mixed. Your ONLY job: convert the raw message into a structured JSON intent.

Return ONLY valid JSON matching this schema (no markdown, no explanation outside the JSON):
{
  "service_type": "ac_technician" | "electrician" | "plumber" | "unknown",
  "sub_type": string | null,
  "location": {"city": string|null, "area": string|null, "confidence": "high"|"medium"|"low"},
  "time_window": {"start_iso": string|null, "end_iso": string|null, "interpretation": string},
  "urgency": "emergency" | "high" | "normal" | "flexible",
  "language_detected": "urdu"|"roman_urdu"|"english"|"mixed",
  "constraints": string[],
  "needs_clarification": boolean,
  "clarification_question": string|null,
  "reasoning": string
}

ROMAN URDU GLOSSARY:
- kal → tomorrow, aaj → today, abhi/jaldi → now/urgent
- subah → morning (06-11), dopahar → afternoon (12-16), shaam → evening (17-20), raat → night (20-23)
- chahiye/chahye → need, bhejo → send, banda/bandi → person
- yaar/bhai → friend (ignore for parsing)
- phat gaya/kharab/tut gaya → broken
- theek karna/marammat → repair
- leak/tapak → leak

LOCATION HEURISTICS:
- G-13, F-10, F-11, I-8 → Islamabad
- DHA, Gulberg, Johar Town, Model Town → Lahore (unless explicitly stated otherwise like "DHA Karachi")
- Clifton, Defence, Gulshan, Gulshan-e-Iqbal → Karachi
- If ambiguous, use the user's context city; if still unclear, set confidence='low'.

URGENCY:
- 'paani leak', 'emergency', 'jaldi', 'abhi', 'foran' → emergency
- 'aaj' with no time → high
- 'kal' or specific future → normal
- 'parson', 'anytime', 'koi bhi waqt' → flexible
- No time mentioned → normal

CLARIFICATION: Set needs_clarification=true only if BOTH location AND service are unknown. Question must be in user's detected language.`;

// ─── Validation ──────────────────────────────────────────────

const VALID_SERVICE_TYPES = ['ac_technician', 'electrician', 'plumber', 'unknown'];
const VALID_URGENCIES = ['emergency', 'high', 'normal', 'flexible'];
const VALID_LANGUAGES = ['urdu', 'roman_urdu', 'english', 'mixed'];
const VALID_CONFIDENCES = ['high', 'medium', 'low'];

function validateIntent(obj: unknown): ServiceIntent {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Response is not an object');
  }

  const o = obj as Record<string, unknown>;

  if (!VALID_SERVICE_TYPES.includes(o.service_type as string)) {
    throw new Error(`Invalid service_type: ${o.service_type}`);
  }
  if (!VALID_URGENCIES.includes(o.urgency as string)) {
    throw new Error(`Invalid urgency: ${o.urgency}`);
  }
  if (!VALID_LANGUAGES.includes(o.language_detected as string)) {
    throw new Error(`Invalid language_detected: ${o.language_detected}`);
  }

  const loc = o.location as Record<string, unknown> | undefined;
  if (!loc || typeof loc !== 'object') {
    throw new Error('Missing or invalid location object');
  }
  if (!VALID_CONFIDENCES.includes(loc.confidence as string)) {
    throw new Error(`Invalid location.confidence: ${loc.confidence}`);
  }

  const tw = o.time_window as Record<string, unknown> | undefined;
  if (!tw || typeof tw !== 'object') {
    throw new Error('Missing or invalid time_window object');
  }

  if (typeof o.needs_clarification !== 'boolean') {
    throw new Error(`needs_clarification must be boolean, got: ${typeof o.needs_clarification}`);
  }
  if (!Array.isArray(o.constraints)) {
    throw new Error('constraints must be an array');
  }
  if (typeof o.reasoning !== 'string') {
    throw new Error('reasoning must be a string');
  }

  return o as unknown as ServiceIntent;
}

// ─── Helpers ─────────────────────────────────────────────────

function applyDefaultTimeWindow(intent: ServiceIntent): void {
  if (!intent.time_window.start_iso && !intent.time_window.end_iso) {
    const now = new Date();
    const next24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    intent.time_window = {
      start_iso: now.toISOString(),
      end_iso: next24.toISOString(),
      interpretation: 'anytime in next 24 hours',
    };
  }
}

function parseJsonContent(raw: string): unknown {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/```\s*$/, '');
  }
  return JSON.parse(cleaned);
}

// ─── Main Functions ───────────────────────────────────────────

export interface UserContext {
  city?: string;
  timestamp_iso: string;
}

export async function parseIntent(
  rawText: string,
  userContext: UserContext,
): Promise<{ intent: ServiceIntent; reasoning_step: ReasoningStep }> {
  const userPrompt = `Current timestamp: ${userContext.timestamp_iso}
User's default city: ${userContext.city ?? 'unknown'}

User message: "${rawText}"

Parse this into the JSON intent structure. Return ONLY the JSON.`;

  const startTime = new Date().toISOString();

  const llmRes = await callLLM({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    responseFormat: 'json',
    temperature: 0.1,
  });

  const intent = validateIntent(parseJsonContent(llmRes.content));
  applyDefaultTimeWindow(intent);

  const location_str =
    [intent.location.area, intent.location.city].filter(Boolean).join(', ') ||
    'unknown location';

  const reasoning_step: ReasoningStep = {
    agent: 'IntentAgent',
    timestamp: startTime,
    thought: intent.reasoning,
    tool_called: `${llmRes.provider}.parse`,
    tool_input: { raw_text: rawText, user_context: userContext },
    tool_output: intent as unknown as Record<string, unknown>,
    decision: `Identified ${intent.service_type} in ${location_str}, ${intent.time_window.interpretation || 'unspecified time'}`,
    llm_provider: llmRes.provider,
  };

  return { intent, reasoning_step };
}

export async function enrichIntent(
  clarificationText: string,
  previousIntent: ServiceIntent,
  userContext: UserContext,
): Promise<{ intent: ServiceIntent; reasoning_step: ReasoningStep }> {
  const userPrompt = `Current timestamp: ${userContext.timestamp_iso}
User's default city: ${userContext.city ?? 'unknown'}

We previously detected this intent which was missing information:
${JSON.stringify(previousIntent, null, 2)}

The user has now provided this clarification: "${clarificationText}"

Merge the new information into the intent. Update needs_clarification to false if resolved. Return ONLY the JSON.`;

  const startTime = new Date().toISOString();

  const llmRes = await callLLM({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    responseFormat: 'json',
    temperature: 0.1,
  });

  const intent = validateIntent(parseJsonContent(llmRes.content));
  applyDefaultTimeWindow(intent);

  const location_str =
    [intent.location.area, intent.location.city].filter(Boolean).join(', ') ||
    'unknown location';

  const reasoning_step: ReasoningStep = {
    agent: 'IntentAgent (enriched)',
    timestamp: startTime,
    thought: intent.reasoning,
    tool_called: `${llmRes.provider}.enrich`,
    tool_input: { clarification_text: clarificationText, previous_intent: previousIntent },
    tool_output: intent as unknown as Record<string, unknown>,
    decision: `Merged clarification. Ready for ${intent.service_type} in ${location_str}`,
    llm_provider: llmRes.provider,
  };

  return { intent, reasoning_step };
}
