// Unified LLM abstraction: Gemini → Groq fallback → cache.
// All agents call callLLM() — never touch provider SDKs directly.

import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { getDemoIntent, computeKey, getFromCache, setInCache } from './llmCache';

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  responseFormat: 'json' | 'text';
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  provider: 'gemini' | 'groq' | 'cache';
  latencyMs: number;
}

// ─── Gemini ───────────────────────────────────────────────────

async function tryGemini(req: LLMRequest): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('No Gemini API key');

  const genAI = new GoogleGenerativeAI(apiKey);
  const generationConfig: Record<string, unknown> = {
    temperature: req.temperature ?? 0.1,
    maxOutputTokens: 1024,
  };
  if (req.responseFormat === 'json') {
    generationConfig.responseMimeType = 'application/json';
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: generationConfig as any,
  });

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Gemini timeout after 5s')), 5000)
  );

  const call = model.generateContent({
    contents: [{ role: 'user', parts: [{ text: req.userPrompt }] }],
    systemInstruction: { role: 'system', parts: [{ text: req.systemPrompt }] },
  });

  const result = await Promise.race([call, timeout]);
  return result.response.text();
}

// ─── Groq ─────────────────────────────────────────────────────

async function tryGroq(req: LLMRequest): Promise<string> {
  const apiKey =
    process.env.EXPO_PUBLIC_GROQ_API_KEY ?? process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('No Groq API key');

  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: req.systemPrompt },
      { role: 'user', content: req.userPrompt },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: req.temperature ?? 0.3,
    ...(req.responseFormat === 'json'
      ? { response_format: { type: 'json_object' } }
      : {}),
  });

  return completion.choices[0]?.message?.content ?? '';
}

// ─── Main entry point ─────────────────────────────────────────

export async function callLLM(req: LLMRequest): Promise<LLMResponse> {
  const start = Date.now();

  // 1. Demo phrase cache — always wins, works fully offline
  if (req.responseFormat === 'json') {
    const demo = getDemoIntent(req.userPrompt);
    if (demo) {
      const latencyMs = Date.now() - start;
      console.log(`[LLM] cache:demo — ${latencyMs}ms`);
      return { content: demo, provider: 'cache', latencyMs };
    }
  }

  // 2. Session cache
  const key = computeKey(req.systemPrompt, req.userPrompt);
  const cached = getFromCache(key);
  if (cached) {
    const latencyMs = Date.now() - start;
    console.log(`[LLM] cache:session — ${latencyMs}ms`);
    return { content: cached.content, provider: 'cache', latencyMs };
  }

  // 3. Try Gemini (5 s timeout)
  try {
    const content = await tryGemini(req);
    const latencyMs = Date.now() - start;
    console.log(`[LLM] gemini ✓ — ${latencyMs}ms`);
    setInCache(key, content);
    return { content, provider: 'gemini', latencyMs };
  } catch (err: any) {
    console.warn(
      `[LLM] gemini ✗ (${err?.message?.slice(0, 80)}) → trying groq`
    );
  }

  // 4. Fall back to Groq
  try {
    const content = await tryGroq(req);
    const latencyMs = Date.now() - start;
    console.log(`[LLM] groq ✓ — ${latencyMs}ms`);
    setInCache(key, content);
    return { content, provider: 'groq', latencyMs };
  } catch (err: any) {
    console.error(`[LLM] groq ✗ — ${err?.message}`);
  }

  throw new Error('[LLM] All providers failed — Gemini and Groq both unavailable');
}
