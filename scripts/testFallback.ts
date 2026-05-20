import { config } from 'dotenv';
config();

// Important: set the simulate flag BEFORE importing orchestrator/config
process.env.EXPO_PUBLIC_SIMULATE_FALLBACK = 'true';

import { handleUserRequest } from '../src/agents/orchestrator';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log("────────────────────────────────────────────────────────────────────────────");
  console.log("🤖 Running Full Orchestrator Pipeline with Fallback Simulation");
  const phrase = "Mujhe kal subah G-13 mein AC technician chahiye";
  console.log(`💬 User Phrase: "${phrase}"`);
  
  // We pass simulateAcceptance = true to the orchestrator to automatically proceed
  const generator = handleUserRequest(phrase, "demo_user", { city: 'Islamabad', timestamp_iso: '2026-05-16T12:00:00+05:00' } as any, true);
  
  let finalTrace: any;
  let stepsCount = 0;

  while (true) {
    const result = await generator.next();
    if (result.done) {
      finalTrace = result.value;
      break;
    }
    const step = result.value as any;
    console.log(`[${step.agent}] -> ${step.decision}`);
    stepsCount++;
  }

  console.log("\\n────────────────────────────────────────────────────────────────────────────");
  console.log("✅ Pipeline completed.");
  console.log(`Total Steps Logged: ${finalTrace.steps.length}`);
  
  const hasRerankStep = finalTrace.steps.some((s: any) => s.agent === 'RankingAgent (re-run)');
  const hasFallbackStep = finalTrace.steps.some((s: any) => s.agent === 'FallbackAgent');
  
  console.assert(hasRerankStep, "❌ Trace should contain a 'RankingAgent (re-run)' step");
  console.assert(hasFallbackStep, "❌ Trace should contain a 'FallbackAgent' step");
  console.assert(finalTrace.steps.length === 7, `❌ Expected 7 steps, got ${finalTrace.steps.length}`);
  console.assert(finalTrace.final_outcome.booking.provider_id === 'prov_002', "❌ Final booking should use prov_002");
  
  if (hasRerankStep && hasFallbackStep && finalTrace.steps.length === 7 && finalTrace.final_outcome.booking.provider_id === 'prov_002') {
    console.log("✅ All fallback assertions passed!");
  } else {
    console.error("❌ Some fallback assertions failed. Check trace output.");
  }

  const tracesDir = path.resolve(__dirname, '..', 'traces', 'submission');
  if (!fs.existsSync(tracesDir)) {
    fs.mkdirSync(tracesDir, { recursive: true });
  }

  const tracePath = path.join(tracesDir, 'fallback.json');
  fs.writeFileSync(tracePath, JSON.stringify(finalTrace, null, 2));
  console.log(`\\n💾 Trace saved to: ${tracePath}`);
}

main().catch(err => {
  console.error("Pipeline failed:", err);
});
