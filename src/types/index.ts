// ─────────────────────────────────────────────────────────────
// SaathiAI — Core TypeScript Interfaces
// ─────────────────────────────────────────────────────────────

/**
 * Parsed intent from a user's natural-language service request.
 * Produced by the IntentAgent after NLU processing.
 */
export interface ServiceIntent {
  service_type: 'ac_technician' | 'electrician' | 'plumber' | 'unknown';
  sub_type: string | null;
  location: {
    city: string | null;
    area: string | null;
    confidence: 'high' | 'medium' | 'low';
  };
  time_window: {
    start_iso: string | null;
    end_iso: string | null;
    interpretation: string;
  };
  urgency: 'emergency' | 'high' | 'normal' | 'flexible';
  language_detected: 'urdu' | 'roman_urdu' | 'english' | 'mixed';
  constraints: string[];
  needs_clarification: boolean;
  clarification_question: string | null;
  reasoning: string;
}

/**
 * A service provider (technician / electrician / plumber) in the
 * SaathiAI network.
 */
export interface Provider {
  provider_id: string;
  name: string;
  service_type: string;
  city: string;
  area: string;
  lat: number;
  lng: number;
  /** Rating from 1 to 5 */
  rating: number;
  jobs_completed: number;
  hourly_rate_pkr: number;
  /** ISO-8601 timestamps of available slots */
  available_slots: string[];
  phone: string;
  verified: boolean;
}

/**
 * A confirmed (or in-progress) booking between a user and a provider.
 */
export interface Booking {
  booking_id: string;
  user_id: string;
  provider_id: string;
  service_type: string;
  scheduled_iso: string;
  status:
    | 'confirmed'
    | 'reminded'
    | 'in_progress'
    | 'completed'
    | 'cancelled';
  created_at: string;
  receipt_data: Record<string, unknown>;
}

/**
 * A single step inside an agent reasoning trace.
 */
export interface ReasoningStep {
  agent: string;
  timestamp: string;
  thought: string;
  tool_called: string | null;
  tool_input: Record<string, unknown> | null;
  tool_output: Record<string, unknown> | null;
  decision: string;
}

/**
 * Full trace of an agentic pipeline run — from user request to
 * final outcome. Stored in /traces for debugging & demo playback.
 */
export interface AgentTrace {
  trace_id: string;
  user_request: string;
  started_at: string;
  completed_at: string | null;
  steps: ReasoningStep[];
  final_outcome: Record<string, unknown> | null;
}
