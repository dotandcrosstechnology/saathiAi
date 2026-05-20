import { callLLM, LLMResponse } from '../services/llm';
import { Provider, ServiceIntent, ReasoningStep } from '../types';
import { isWithinInterval, parseISO } from 'date-fns';

export async function rankProviders(
  intent: ServiceIntent,
  candidates: (Provider & { distance_km?: number })[]
): Promise<{
  ranked: Array<Provider & { score: number; justification: string }>;
  top_choice: Provider & { score: number; justification: string };
  reasoning_step: ReasoningStep
}> {
  const startTime = new Date().toISOString();

  if (candidates.length === 0) {
    throw new Error('No candidates to rank');
  }

  // Calculate median rate
  const rates = candidates.map(c => c.hourly_rate_pkr).sort((a, b) => a - b);
  const median_rate = rates[Math.floor(rates.length / 2)] || 1000;

  // Score each candidate
  let scoredCandidates = candidates.map(c => {
    const distance_km = c.distance_km !== undefined ? c.distance_km : 5; // fallback
    const dist_score = 0.35 * Math.max(0, (1 - distance_km / 10));
    
    const rating_score = 0.25 * (c.rating / 5.0);
    
    // Check if slot in window
    let availability_score = 0.5;
    if (intent.time_window.start_iso && intent.time_window.end_iso) {
      const start = parseISO(intent.time_window.start_iso);
      const end = parseISO(intent.time_window.end_iso);
      const hasSlot = c.available_slots.some(slot => isWithinInterval(parseISO(slot), { start, end }));
      if (hasSlot) availability_score = 1.0;
    }
    const avail_weighted = 0.20 * availability_score;

    const jobs_score = 0.10 * Math.min(c.jobs_completed / 100, 1.0);
    
    const price_fit_val = Math.max(0, 1 - Math.abs(c.hourly_rate_pkr - median_rate) / median_rate);
    const price_score = 0.10 * price_fit_val;

    const score = dist_score + rating_score + avail_weighted + jobs_score + price_score;
    
    return {
      ...c,
      score,
      justification: '',
      _breakdown: { dist_score, rating_score, avail_weighted, jobs_score, price_score }
    };
  });

  // Sort by score DESC
  scoredCandidates.sort((a, b) => b.score - a.score);

  const topChoice = scoredCandidates[0];

  // LLM justification for top choice
  let llmJustification = 'Best matched provider based on location and rating.';
  let llmProvider: LLMResponse['provider'] = 'cache';

  try {
    const justificationPrompt = `You are a helpful assistant for SaathiAI, a service booking platform in Pakistan.
User's language: ${intent.language_detected}
Service requested: ${intent.service_type} in ${intent.location.city}, ${intent.location.area}
Selected Provider: ${topChoice.name}
Rating: ${topChoice.rating}
Distance: ${topChoice.distance_km?.toFixed(1) || '?'} km

Write a ONE SENTENCE justification IN THE USER'S DETECTED LANGUAGE explaining why this provider was chosen.
Make it natural and friendly. Example for Roman Urdu: "${topChoice.name} aapke sab se kareeb hai, ${topChoice.rating} rating ke saath aur aapke time par free hai."`;

    const llmRes = await callLLM({
      systemPrompt: 'You are a helpful assistant for SaathiAI, a service booking platform in Pakistan.',
      userPrompt: justificationPrompt,
      responseFormat: 'text',
      temperature: 0.3,
    });
    llmJustification = llmRes.content.trim();
    llmProvider = llmRes.provider;
  } catch (err) {
    console.warn('[RankingAgent] LLM justification failed:', err);
  }

  topChoice.justification = llmJustification;

  const reasoning_step: ReasoningStep = {
    agent: 'RankingAgent',
    timestamp: startTime,
    thought: 'Calculated score based on distance, rating, availability, jobs, and price.',
    tool_called: `${llmProvider}.generateJustification`,
    tool_input: { top_choice_name: topChoice.name, language: intent.language_detected },
    tool_output: { scored_candidates: scoredCandidates.map(c => ({ id: c.provider_id, score: c.score, breakdown: c._breakdown })), justification: llmJustification },
    decision: `Ranked ${scoredCandidates.length} providers. Top choice is ${topChoice.name} with score ${topChoice.score.toFixed(3)}.`,
    llm_provider: llmProvider,
  };

  const finalRanked = scoredCandidates.map(c => {
    const { _breakdown, distance_km, ...rest } = c;
    return rest as Provider & { score: number; justification: string };
  });

  const finalTopChoice = { ...finalRanked[0] };

  return {
    ranked: finalRanked,
    top_choice: finalTopChoice,
    reasoning_step
  };
}
