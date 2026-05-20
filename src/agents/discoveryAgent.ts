import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Provider, ServiceIntent, ReasoningStep } from '../types';
import { areaCentroids, getDistanceKm } from '../utils/areaCoords';
import { isWithinInterval, parseISO } from 'date-fns';

export async function discoverProviders(
  intent: ServiceIntent
): Promise<{ candidates: Provider[]; reasoning_step: ReasoningStep }> {
  const startTime = new Date().toISOString();
  
  // 1. Query Firestore /providers where service_type matches intent.service_type
  const providersRef = collection(db, 'providers');
  const q = query(providersRef, where('service_type', '==', intent.service_type));
  
  let candidates: Provider[] = [];
  try {
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      candidates.push(doc.data() as Provider);
    });
    
    const now = new Date();
    const hasValidFutureSlots = candidates.some(p =>
      p.available_slots.some(s => {
        try { return parseISO(s) > now; } catch { return false; }
      })
    );
    if (candidates.length === 0 || !hasValidFutureSlots) {
      throw new Error('Firestore providers have no future slots — falling back to mock data.');
    }
  } catch (err) {
    // Fallback to mock data if Firestore is uninitialized, fails, or is empty
    console.warn('⚠️ Firestore query failed or returned empty (missing Firebase config). Falling back to mock providers.');
    const mockProviders = require('../data/providers').providers;
    candidates = mockProviders.filter((p: Provider) => p.service_type === intent.service_type);
  }

  const initialCount = candidates.length;

  // 2. Filter to providers in intent.location.city (if specified)
  if (intent.location.city) {
    candidates = candidates.filter(
      p => p.city.toLowerCase() === intent.location.city!.toLowerCase()
    );
  }
  const cityFilteredCount = candidates.length;

  // 3. Compute distance_km for each provider from intent.location.area centroid
  const areaKey = intent.location.area ? intent.location.area.toLowerCase() : '';
  const centroid = areaCentroids[areaKey] || null;

  let candidatesWithDistance = candidates.map(p => {
    let distance_km = 1000; // default large distance
    if (centroid) {
      distance_km = getDistanceKm(centroid.lat, centroid.lng, p.lat, p.lng);
    } else if (p.city.toLowerCase() === intent.location.city?.toLowerCase()) {
      distance_km = 5; // fallback within city if area unknown
    }
    return { ...p, distance_km };
  });

  // 4. Filter to providers within 10km
  candidatesWithDistance = candidatesWithDistance.filter(p => p.distance_km <= 10);
  const distanceFilteredCount = candidatesWithDistance.length;

  // 5. Filter to providers with at least one available_slot inside intent.time_window
  if (intent.time_window.start_iso && intent.time_window.end_iso) {
    const start = parseISO(intent.time_window.start_iso);
    const end = parseISO(intent.time_window.end_iso);
    
    candidatesWithDistance = candidatesWithDistance.filter(p => {
      return p.available_slots.some(slotStr => {
        const slotTime = parseISO(slotStr);
        return isWithinInterval(slotTime, { start, end });
      });
    });
  }
  const timeFilteredCount = candidatesWithDistance.length;

  // 6. Return up to 10 candidates sorted by distance
  candidatesWithDistance.sort((a, b) => a.distance_km - b.distance_km);
  const finalCandidates = candidatesWithDistance.slice(0, 10).map(p => {
    const { distance_km, ...rest } = p; 
    // We include distance_km dynamically so the ranking agent can use it
    return p as Provider & { distance_km: number };
  });

  const areaLabel = intent.location.area ? intent.location.area : 'any area';
  const cityLabel = intent.location.city || 'any city';
  const timeLabel = (intent.time_window.start_iso && intent.time_window.end_iso) ? 'within time window' : 'any time';

  const reasoning_step: ReasoningStep = {
    agent: 'DiscoveryAgent',
    timestamp: startTime,
    thought: `Filtering providers for ${intent.service_type} in ${areaLabel}, ${cityLabel} ${timeLabel}.`,
    tool_called: 'firestore.query',
    tool_input: { service_type: intent.service_type, location: intent.location, time_window: intent.time_window },
    tool_output: { initialCount, cityFilteredCount, distanceFilteredCount, timeFilteredCount, finalCount: finalCandidates.length },
    decision: `Found ${finalCandidates.length} eligible candidates within 10km and available time.`
  };

  return { candidates: finalCandidates, reasoning_step };
}
