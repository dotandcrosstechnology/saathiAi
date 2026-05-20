// ─────────────────────────────────────────────────────────────
// SaathiAI — Intent Agent Test Runner
//
// Usage:  npx ts-node scripts/testIntent.ts
//
// Runs all 20 test phrases through parseIntent(), compares
// against expected fields, prints a results table, and saves
// full reasoning steps to traces/intent_test_run.json.
// ─────────────────────────────────────────────────────────────

import { config } from 'dotenv';
config();

import { testPhrases, TestPhrase } from '../src/data/testPhrases';
import { parseIntent } from '../src/agents/intentAgent';
import { ReasoningStep } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';

// ─── Helpers ─────────────────────────────────────────────────

function truncate(s: string, len: number): string {
  return s.length > len ? s.slice(0, len - 1) + '…' : s.padEnd(len);
}

function checkPass(
  expected: TestPhrase['expected'],
  actual: { service_type: string; city: string | null; area: string | null; urgency: string },
): boolean {
  // Service type must match
  if (expected.service_type !== actual.service_type) return false;
  // City: if expected is set, must match (case-insensitive)
  if (expected.city !== null) {
    if (!actual.city || actual.city.toLowerCase() !== expected.city.toLowerCase()) return false;
  }
  // Area: if expected is set, must match (case-insensitive)
  if (expected.area !== null) {
    if (!actual.area || actual.area.toLowerCase() !== expected.area.toLowerCase()) return false;
  }
  // Urgency must match
  if (expected.urgency !== actual.urgency) return false;
  return true;
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  const timestamp = new Date().toISOString();
  const results: {
    idx: number;
    phrase: string;
    expected: TestPhrase['expected'];
    actual: { service_type: string; city: string | null; area: string | null; urgency: string; language: string };
    pass: boolean;
    error?: string;
  }[] = [];

  const reasoningSteps: ReasoningStep[] = [];
  let passCount = 0;

  console.log('\n🧠 SaathiAI — Intent Agent Test Run');
  console.log('═'.repeat(110));
  console.log(
    '#  '.padEnd(4) +
    'Phrase'.padEnd(52) +
    'Expected'.padEnd(22) +
    'Got'.padEnd(22) +
    'Urgency'.padEnd(12) +
    'Result',
  );
  console.log('─'.repeat(110));

  for (let i = 0; i < testPhrases.length; i++) {
    const tp = testPhrases[i];
    const idx = i + 1;

    try {
      const { intent, reasoning_step } = await parseIntent(tp.phrase, {
        city: undefined, // no default city — agent must infer
        timestamp_iso: timestamp,
      });

      reasoningSteps.push(reasoning_step);

      const actual = {
        service_type: intent.service_type,
        city: intent.location.city,
        area: intent.location.area,
        urgency: intent.urgency,
        language: intent.language_detected,
      };

      const pass = checkPass(tp.expected, actual);
      if (pass) passCount++;

      results.push({ idx, phrase: tp.phrase, expected: tp.expected, actual, pass });

      const expectedStr = `${tp.expected.service_type}/${tp.expected.area ?? '?'}`;
      const gotStr = `${actual.service_type}/${actual.area ?? '?'}`;

      console.log(
        `${String(idx).padStart(2)}. ` +
        truncate(tp.phrase, 50) +
        '  ' +
        truncate(expectedStr, 20) +
        '  ' +
        truncate(gotStr, 20) +
        '  ' +
        truncate(actual.urgency, 10) +
        '  ' +
        (pass ? '✅ PASS' : '❌ FAIL'),
      );
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      results.push({
        idx,
        phrase: tp.phrase,
        expected: tp.expected,
        actual: { service_type: 'ERROR', city: null, area: null, urgency: 'ERROR', language: 'ERROR' },
        pass: false,
        error: errMsg,
      });

      console.log(
        `${String(idx).padStart(2)}. ` +
        truncate(tp.phrase, 50) +
        '  ' +
        '—'.padEnd(20) +
        '  ' +
        'ERROR'.padEnd(20) +
        '  ' +
        '—'.padEnd(10) +
        '  ' +
        `❌ ERROR: ${errMsg.slice(0, 40)}`,
      );
    }

    // Small delay to avoid rate limiting
    if (i < testPhrases.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log('─'.repeat(110));
  console.log(`\n📊 Results: ${passCount}/${testPhrases.length} PASS`);
  console.log(`   Target:  16/20`);
  console.log(`   Status:  ${passCount >= 16 ? '✅ TARGET MET' : '⚠️  BELOW TARGET'}\n`);

  // Save traces
  const tracesDir = path.resolve(__dirname, '..', 'traces');
  if (!fs.existsSync(tracesDir)) {
    fs.mkdirSync(tracesDir, { recursive: true });
  }

  const traceOutput = {
    test_run_at: timestamp,
    total: testPhrases.length,
    passed: passCount,
    failed: testPhrases.length - passCount,
    results: results.map((r) => ({
      idx: r.idx,
      phrase: r.phrase,
      expected: r.expected,
      actual: r.actual,
      pass: r.pass,
      error: r.error,
    })),
    reasoning_steps: reasoningSteps,
  };

  const tracePath = path.join(tracesDir, 'intent_test_run.json');
  fs.writeFileSync(tracePath, JSON.stringify(traceOutput, null, 2));
  console.log(`💾 Full trace saved to: ${tracePath}\n`);
}

main().catch((err) => {
  console.error('❌ Test run failed:', err);
  process.exit(1);
});
