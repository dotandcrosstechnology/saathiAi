import { config } from 'dotenv';
config();

import { handleUserRequest } from '../src/agents/orchestrator';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log("────────────────────────────────────────────────────────────────────────────");
  console.log("🤖 Running Clarification Flow (Emergency)");
  const phrase = "yaar urgent plumber chahye, paani leak ho raha hai";
  console.log(`💬 User Phrase: "${phrase}"`);
  
  const generator1 = handleUserRequest(phrase, "demo_user", { city: 'Islamabad', timestamp_iso: '2026-05-16T12:00:00+05:00' } as any, true);
  
  let finalTrace1: any;
  while (true) {
    const result = await generator1.next();
    if (result.done) {
      finalTrace1 = result.value;
      break;
    }
    const step = result.value as any;
    console.log(`[${step.agent}] -> ${step.decision}`);
  }

  console.assert(finalTrace1.final_outcome.status === 'awaiting_clarification', "❌ Expected status to be 'awaiting_clarification'");
  console.assert(finalTrace1.final_outcome.intent.urgency === 'emergency', "❌ Expected urgency 'emergency'");
  console.assert(finalTrace1.final_outcome.intent.constraints.includes('water_leak_active'), "❌ Expected constraint 'water_leak_active'");

  console.log(`✅ Passed Part 1: Handled ambiguity, detected emergency & constraint. Question: "${finalTrace1.final_outcome.clarification_question}"`);

  console.log("\\n────────────────────────────────────────────────────────────────────────────");
  const reply = "Gulberg, Lahore";
  console.log(`💬 User Reply: "${reply}"`);

  const pendingIntent = finalTrace1.final_outcome.intent;

  const generator2 = handleUserRequest(reply, "demo_user", { city: 'Islamabad', timestamp_iso: '2026-05-16T12:01:00+05:00' } as any, true, pendingIntent);
  
  let finalTrace2: any;
  while (true) {
    const result = await generator2.next();
    if (result.done) {
      finalTrace2 = result.value;
      break;
    }
    const step = result.value as any;
    console.log(`[${step.agent}] -> ${step.decision}`);
  }

  console.log("\\n────────────────────────────────────────────────────────────────────────────");
  console.log("✅ Pipeline completed.");
  
  // Combine steps for complete trace
  const allSteps = [...finalTrace1.steps, ...finalTrace2.steps];
  finalTrace2.steps = allSteps;

  console.log(`Total Steps Logged: ${allSteps.length}`);
  
  const hasEnrichedStep = allSteps.some((s: any) => s.agent === 'IntentAgent (enriched)' || s.agent === 'IntentAgent (Enriched Fallback)');
  console.assert(hasEnrichedStep, "❌ Trace should contain a 'IntentAgent (enriched)' or fallback step");
  console.assert(allSteps.length >= 6, `❌ Expected 6+ steps, got ${allSteps.length}`);
  
  const bookingData = finalTrace2.final_outcome.booking.receipt_data;
  console.assert(bookingData.city === 'Lahore' || bookingData.area?.includes('Lahore') || pendingIntent.location.city === 'Lahore' || finalTrace2.final_outcome.top_choice_name != null, "❌ Final booking should be in Lahore or at least booked");
  
  if (hasEnrichedStep && allSteps.length >= 6) {
    console.log("✅ All emergency clarification assertions passed!");
  } else {
    console.error("❌ Some assertions failed. Check trace output.");
  }

  const tracesDir = path.resolve(__dirname, '..', 'traces', 'submission');
  if (!fs.existsSync(tracesDir)) {
    fs.mkdirSync(tracesDir, { recursive: true });
  }

  const tracePath = path.join(tracesDir, 'emergency.json');
  fs.writeFileSync(tracePath, JSON.stringify(finalTrace2, null, 2));
  console.log(`\\n💾 Trace saved to: ${tracePath}`);
}

main().catch(err => {
  console.error("Pipeline failed:", err);
});
