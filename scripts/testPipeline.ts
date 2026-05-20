import { config } from 'dotenv';
config();

import { parseIntent } from '../src/agents/intentAgent';
import { discoverProviders } from '../src/agents/discoveryAgent';
import { rankProviders } from '../src/agents/rankingAgent';
import * as fs from 'fs';
import * as path from 'path';
import { ServiceIntent } from '../src/types';

async function main() {
  const phrase = "Mujhe kal subah G-13 mein AC technician chahiye";
  const userContext = { city: 'Islamabad', timestamp_iso: new Date().toISOString() };
  
  console.log("────────────────────────────────────────────────────────────────────────────");
  console.log("🤖 1. Running Intent Agent...");
  console.log(`💬 User Phrase: "${phrase}"`);
  
  let intent: ServiceIntent;
  let intentReasoning;
  try {
    const res = await parseIntent(phrase, userContext);
    intent = res.intent;
    intentReasoning = res.reasoning_step;
    console.log("✅ Intent successfully parsed by Gemini.");
  } catch (err) {
    console.warn("⚠️ Intent Agent failed (likely missing GEMINI_API_KEY). Using fallback intent.");
    intent = {
      service_type: 'ac_technician',
      sub_type: null,
      location: { city: 'Islamabad', area: 'G-13', confidence: 'high' },
      // Note: 'kal subah' fallback assumes slot 2026-05-17T10:00:00 will fall in this window
      time_window: { start_iso: '2026-05-17T06:00:00+05:00', end_iso: '2026-05-17T11:59:59+05:00', interpretation: 'kal subah' },
      urgency: 'normal',
      language_detected: 'roman_urdu',
      constraints: [],
      needs_clarification: false,
      clarification_question: null,
      reasoning: "Mock reasoning due to missing API key."
    };
    intentReasoning = {
      agent: 'IntentAgent',
      timestamp: new Date().toISOString(),
      thought: 'Fallback intent because Gemini failed.',
      tool_called: null,
      tool_input: null,
      tool_output: intent as unknown as Record<string, unknown>,
      decision: 'Used fallback intent for testing.'
    };
  }
  
  console.log("Result:", JSON.stringify(intent, null, 2));

  console.log("\\n────────────────────────────────────────────────────────────────────────────");
  console.log("🔍 2. Running Discovery Agent...");
  const { candidates, reasoning_step: discoveryReasoning } = await discoverProviders(intent);
  console.log(`✅ Discovered ${candidates.length} candidates.`);
  console.log("Filtering trace:", JSON.stringify(discoveryReasoning.tool_output, null, 2));

  if (candidates.length === 0) {
    console.log("❌ No candidates found. Aborting pipeline.");
    return;
  }

  console.log("\\n────────────────────────────────────────────────────────────────────────────");
  console.log("🏆 3. Running Ranking Agent...");
  const { ranked, top_choice, reasoning_step: rankingReasoning } = await rankProviders(intent, candidates);
  console.log(`✅ Ranked ${ranked.length} candidates.`);
  
  console.log("\\n🥇 Top Choice:");
  console.log(`Provider: ${top_choice.name}`);
  console.log(`Score: ${top_choice.score.toFixed(3)}`);
  console.log(`Rating: ${top_choice.rating} (${top_choice.jobs_completed} jobs)`);
  console.log(`Justification: "${top_choice.justification}"`);
  
  console.log("\\n🥈 Runner up:");
  if (ranked[1]) {
    console.log(`Provider: ${ranked[1].name} (Score: ${ranked[1].score.toFixed(3)})`);
  }

  const traceOutput = {
    test_run_at: new Date().toISOString(),
    phrase,
    steps: [intentReasoning, discoveryReasoning, rankingReasoning],
    final_outcome: top_choice
  };

  const tracesDir = path.resolve(__dirname, '..', 'traces');
  if (!fs.existsSync(tracesDir)) {
    fs.mkdirSync(tracesDir, { recursive: true });
  }

  const tracePath = path.join(tracesDir, 'pipeline_happy_path.json');
  fs.writeFileSync(tracePath, JSON.stringify(traceOutput, null, 2));
  console.log(`\\n💾 Full trace saved to: ${tracePath}`);
}

main().catch(err => {
  console.error("Pipeline failed:", err);
});
