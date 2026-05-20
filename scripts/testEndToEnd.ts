import { config as loadEnv } from 'dotenv';
loadEnv();

import { handleUserRequest } from '../src/agents/orchestrator';
import { config } from '../src/utils/config';
import * as fs from 'fs';
import * as path from 'path';

async function printTrace(trace: any, name: string) {
  console.log("\\n" + "═".repeat(80));
  console.log(`📋 TRACE SUMMARY: ${name}`);
  console.log("═".repeat(80));
  console.log(`Status:       ${trace.final_outcome?.status || 'success'}`);
  
  if (trace.final_outcome?.fallback_used) {
    console.log(`\\n⚠️ FALLBACK TRIGGERED!`);
    console.log(`Explanation given: "${trace.final_outcome.fallback_msg}"`);
  }

  if (trace.final_outcome?.booking) {
    const b = trace.final_outcome.booking as Record<string, unknown>;
    console.log(`\\n🎉 Booking Confirmed:`);
    console.log(`Provider:  ${trace.final_outcome.top_choice_name}`);
  }

  console.log("\\n🕵️  Agent Decisions:");
  trace.steps.forEach((step: any, index: number) => {
    console.log(`  [${index + 1}] ${step.agent}:`);
    console.log(`      ${step.decision}`);
  });
  console.log("═".repeat(80));
  
  const tracesDir = path.resolve(__dirname, '..', 'traces');
  if (!fs.existsSync(tracesDir)) {
    fs.mkdirSync(tracesDir, { recursive: true });
  }
  const tracePath = path.join(tracesDir, `${name}.json`);
  fs.writeFileSync(tracePath, JSON.stringify(trace, null, 2));
}

async function runTest(rawText: string, userId: string, userContext: any, simulateAcceptance: boolean, testName: string) {
  let generator = handleUserRequest(rawText, userId, userContext, simulateAcceptance);
  
  let result;
  while (true) {
    result = await generator.next();
    if (result.done) break;
    const step = result.value as any;
    console.log(`[Stream] Yielded step from: ${step.agent} - ${step.decision}`);
  }
  
  // result.value contains the return value of the generator when done
  await printTrace(result.value, testName);
}

async function main() {
  const rawText = "Mujhe kal subah G-13 mein AC technician chahiye";
  const userId = "user_demo_123";
  const userContext = { city: "Islamabad" };

  console.log("🚀 Running 1: Happy Path...");
  config.SIMULATE_TOP_UNAVAILABLE = false;
  await runTest(rawText, userId, userContext, true, 'run_happy');

  console.log("\\n🚀 Running 2: Fallback Re-ranking Path...");
  config.SIMULATE_TOP_UNAVAILABLE = true;
  await runTest(rawText, userId, userContext, true, 'run_fallback');

  console.log("\\n💾 Both traces saved locally to /traces/run_happy.json and /traces/run_fallback.json");
}

main().catch(err => {
  console.error("Test failed:", err);
});
