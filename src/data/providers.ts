// ─────────────────────────────────────────────────────────────
// SaathiAI — Mock Provider Data (30 providers)
// 10 AC technicians, 10 electricians, 10 plumbers
// Cities: Islamabad (4), Lahore (3), Karachi (3) per type
// ─────────────────────────────────────────────────────────────

import { Provider } from '../types';

// Generates a PKT (+05:00) slot string N days from today at the given hour
function slot(daysFromNow: number, pktHour: number): string {
  const d = new Date(Date.now() + daysFromNow * 86400000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const h = String(pktHour).padStart(2, '0');
  return `${y}-${m}-${day}T${h}:00:00+05:00`;
}

export const providers: Provider[] = [
  // ═══════════════════════════════════════════════════════════
  // AC TECHNICIANS (10)
  // ═══════════════════════════════════════════════════════════

  // ★ DEMO HAPPY-PATH PROVIDER
  {
    provider_id: 'prov_001', name: 'Ali AC Services',
    service_type: 'ac_technician', city: 'Islamabad', area: 'G-13',
    lat: 33.6499, lng: 72.9638, rating: 4.8, jobs_completed: 210,
    hourly_rate_pkr: 1800, phone: '+92-300-1234567', verified: true,
    available_slots: [slot(1,10),slot(1,14),slot(2,9),slot(2,16),slot(3,11)],
  },
  // ★ DEMO FALLBACK — ranked 2nd by distance from G-13
  {
    provider_id: 'prov_002', name: 'Hamza Cooling Solutions',
    service_type: 'ac_technician', city: 'Islamabad', area: 'G-13',
    lat: 33.6512, lng: 72.9655, rating: 4.5, jobs_completed: 145,
    hourly_rate_pkr: 1600, phone: '+92-301-2345678', verified: true,
    available_slots: [slot(1,11),slot(1,15),slot(2,10),slot(2,17),slot(3,9)],
  },
  {
    provider_id: 'prov_003', name: 'Zubair Cool Tech',
    service_type: 'ac_technician', city: 'Islamabad', area: 'F-10',
    lat: 33.6993, lng: 73.0094, rating: 4.3, jobs_completed: 98,
    hourly_rate_pkr: 1500, phone: '+92-302-3456789', verified: true,
    available_slots: [slot(1,9),slot(1,13),slot(2,8),slot(2,15),slot(3,10)],
  },
  {
    provider_id: 'prov_004', name: 'Shahbaz AC Repair',
    service_type: 'ac_technician', city: 'Islamabad', area: 'I-8',
    lat: 33.6691, lng: 73.0730, rating: 4.1, jobs_completed: 67,
    hourly_rate_pkr: 1400, phone: '+92-303-4567890', verified: false,
    available_slots: [slot(1,10),slot(1,16),slot(2,11),slot(3,9),slot(3,14)],
  },
  {
    provider_id: 'prov_005', name: 'Tariq Refrigeration',
    service_type: 'ac_technician', city: 'Lahore', area: 'Gulberg',
    lat: 31.5378, lng: 74.3478, rating: 4.7, jobs_completed: 189,
    hourly_rate_pkr: 2000, phone: '+92-321-5678901', verified: true,
    available_slots: [slot(1,9),slot(1,14),slot(2,10),slot(2,16),slot(3,12)],
  },
  {
    provider_id: 'prov_006', name: 'Usman Cool Air',
    service_type: 'ac_technician', city: 'Lahore', area: 'DHA',
    lat: 31.5123, lng: 74.4298, rating: 4.6, jobs_completed: 132,
    hourly_rate_pkr: 2200, phone: '+92-322-6789012', verified: true,
    available_slots: [slot(1,8),slot(1,12),slot(2,9),slot(3,10),slot(3,15)],
  },
  {
    provider_id: 'prov_007', name: 'Bilal AC & Cooling',
    service_type: 'ac_technician', city: 'Lahore', area: 'Johar Town',
    lat: 31.4622, lng: 74.2942, rating: 3.9, jobs_completed: 54,
    hourly_rate_pkr: 1300, phone: '+92-323-7890123', verified: false,
    available_slots: [slot(1,10),slot(1,15),slot(2,11),slot(2,17),slot(3,9)],
  },
  {
    provider_id: 'prov_008', name: 'Faraz AC Masters',
    service_type: 'ac_technician', city: 'Karachi', area: 'Clifton',
    lat: 24.8167, lng: 67.0333, rating: 4.9, jobs_completed: 245,
    hourly_rate_pkr: 2500, phone: '+92-333-8901234', verified: true,
    available_slots: [slot(1,9),slot(1,13),slot(2,8),slot(2,14),slot(3,10)],
  },
  {
    provider_id: 'prov_009', name: 'Kamran Cooling Zone',
    service_type: 'ac_technician', city: 'Karachi', area: 'DHA',
    lat: 24.7937, lng: 67.0643, rating: 4.4, jobs_completed: 110,
    hourly_rate_pkr: 2100, phone: '+92-334-9012345', verified: true,
    available_slots: [slot(1,10),slot(1,16),slot(2,9),slot(3,11),slot(3,16)],
  },
  {
    provider_id: 'prov_010', name: 'Nadeem HVAC Services',
    service_type: 'ac_technician', city: 'Karachi', area: 'Gulshan-e-Iqbal',
    lat: 24.9167, lng: 67.0833, rating: 3.8, jobs_completed: 42,
    hourly_rate_pkr: 1200, phone: '+92-335-0123456', verified: false,
    available_slots: [slot(1,11),slot(1,17),slot(2,10),slot(2,15),slot(3,9)],
  },

  // ═══════════════════════════════════════════════════════════
  // ELECTRICIANS (10)
  // ═══════════════════════════════════════════════════════════
  {
    provider_id: 'prov_011', name: 'Bushra Electric Works',
    service_type: 'electrician', city: 'Islamabad', area: 'G-13',
    lat: 33.6485, lng: 72.9620, rating: 4.6, jobs_completed: 178,
    hourly_rate_pkr: 1200, phone: '+92-305-1234567', verified: true,
    available_slots: [slot(1,8),slot(1,12),slot(2,9),slot(2,14),slot(3,10)],
  },
  {
    provider_id: 'prov_012', name: 'Qadir Electrical Solutions',
    service_type: 'electrician', city: 'Islamabad', area: 'F-10',
    lat: 33.6980, lng: 73.0110, rating: 4.2, jobs_completed: 89,
    hourly_rate_pkr: 1100, phone: '+92-306-2345678', verified: true,
    available_slots: [slot(1,9),slot(1,14),slot(2,8),slot(2,16),slot(3,11)],
  },
  {
    provider_id: 'prov_013', name: 'Waqar Power Electric',
    service_type: 'electrician', city: 'Islamabad', area: 'F-11',
    lat: 33.6973, lng: 73.0514, rating: 4.0, jobs_completed: 56,
    hourly_rate_pkr: 1000, phone: '+92-307-3456789', verified: false,
    available_slots: [slot(1,10),slot(1,15),slot(2,10),slot(3,8),slot(3,13)],
  },
  {
    provider_id: 'prov_014', name: 'Rashid Wiring & Repair',
    service_type: 'electrician', city: 'Islamabad', area: 'I-8',
    lat: 33.6705, lng: 73.0745, rating: 4.4, jobs_completed: 112,
    hourly_rate_pkr: 1300, phone: '+92-308-4567890', verified: true,
    available_slots: [slot(1,9),slot(1,13),slot(2,11),slot(2,17),slot(3,10)],
  },
  {
    provider_id: 'prov_015', name: 'Asif Bijli Wala',
    service_type: 'electrician', city: 'Lahore', area: 'Gulberg',
    lat: 31.5390, lng: 74.3490, rating: 4.7, jobs_completed: 201,
    hourly_rate_pkr: 1500, phone: '+92-311-5678901', verified: true,
    available_slots: [slot(1,8),slot(1,12),slot(2,9),slot(2,15),slot(3,11)],
  },
  {
    provider_id: 'prov_016', name: 'Sajid Electric Co.',
    service_type: 'electrician', city: 'Lahore', area: 'Model Town',
    lat: 31.4714, lng: 74.3187, rating: 4.3, jobs_completed: 95,
    hourly_rate_pkr: 1200, phone: '+92-312-6789012', verified: true,
    available_slots: [slot(1,10),slot(1,16),slot(2,8),slot(3,9),slot(3,14)],
  },
  {
    provider_id: 'prov_017', name: 'Faisal Electrician Services',
    service_type: 'electrician', city: 'Lahore', area: 'DHA',
    lat: 31.5135, lng: 74.4310, rating: 3.9, jobs_completed: 48,
    hourly_rate_pkr: 1400, phone: '+92-313-7890123', verified: false,
    available_slots: [slot(1,9),slot(1,14),slot(2,10),slot(2,16),slot(3,12)],
  },
  {
    provider_id: 'prov_018', name: 'Noman Spark Electric',
    service_type: 'electrician', city: 'Karachi', area: 'Clifton',
    lat: 24.8175, lng: 67.0345, rating: 4.8, jobs_completed: 220,
    hourly_rate_pkr: 1800, phone: '+92-332-8901234', verified: true,
    available_slots: [slot(1,8),slot(1,13),slot(2,9),slot(2,15),slot(3,10)],
  },
  {
    provider_id: 'prov_019', name: 'Imran Electrical Hub',
    service_type: 'electrician', city: 'Karachi', area: 'DHA',
    lat: 24.7950, lng: 67.0660, rating: 4.1, jobs_completed: 73,
    hourly_rate_pkr: 1600, phone: '+92-336-9012345', verified: false,
    available_slots: [slot(1,10),slot(1,15),slot(2,11),slot(3,9),slot(3,15)],
  },
  {
    provider_id: 'prov_020', name: 'Zaheer Light & Power',
    service_type: 'electrician', city: 'Karachi', area: 'Gulshan-e-Iqbal',
    lat: 24.9180, lng: 67.0850, rating: 4.0, jobs_completed: 60,
    hourly_rate_pkr: 1000, phone: '+92-337-0123456', verified: true,
    available_slots: [slot(1,9),slot(1,14),slot(2,8),slot(2,14),slot(3,11)],
  },

  // ═══════════════════════════════════════════════════════════
  // PLUMBERS (10)
  // ═══════════════════════════════════════════════════════════
  {
    provider_id: 'prov_021', name: 'Aslam Plumbing Works',
    service_type: 'plumber', city: 'Islamabad', area: 'G-13',
    lat: 33.6510, lng: 72.9645, rating: 4.5, jobs_completed: 156,
    hourly_rate_pkr: 1200, phone: '+92-310-1234567', verified: true,
    available_slots: [slot(1,8),slot(1,13),slot(2,9),slot(2,15),slot(3,10)],
  },
  {
    provider_id: 'prov_022', name: 'Maqsood Pipe Masters',
    service_type: 'plumber', city: 'Islamabad', area: 'F-10',
    lat: 33.6988, lng: 73.0080, rating: 4.2, jobs_completed: 87,
    hourly_rate_pkr: 1100, phone: '+92-315-2345678', verified: true,
    available_slots: [slot(1,9),slot(1,15),slot(2,10),slot(2,16),slot(3,12)],
  },
  {
    provider_id: 'prov_023', name: 'Ghulam Water Solutions',
    service_type: 'plumber', city: 'Islamabad', area: 'F-11',
    lat: 33.6960, lng: 73.0500, rating: 3.8, jobs_completed: 34,
    hourly_rate_pkr: 1000, phone: '+92-316-3456789', verified: false,
    available_slots: [slot(1,10),slot(1,14),slot(2,8),slot(3,9),slot(3,14)],
  },
  {
    provider_id: 'prov_024', name: 'Sohail Sanitary & Plumbing',
    service_type: 'plumber', city: 'Islamabad', area: 'I-8',
    lat: 33.6698, lng: 73.0720, rating: 4.3, jobs_completed: 102,
    hourly_rate_pkr: 1300, phone: '+92-317-4567890', verified: true,
    available_slots: [slot(1,8),slot(1,12),slot(2,11),slot(2,17),slot(3,10)],
  },
  {
    provider_id: 'prov_025', name: 'Rana Plumber & Sons',
    service_type: 'plumber', city: 'Lahore', area: 'Gulberg',
    lat: 31.5365, lng: 74.3465, rating: 4.6, jobs_completed: 175,
    hourly_rate_pkr: 1500, phone: '+92-320-5678901', verified: true,
    available_slots: [slot(1,9),slot(1,14),slot(2,8),slot(2,15),slot(3,11)],
  },
  {
    provider_id: 'prov_026', name: 'Kashif Nalkay Wala',
    service_type: 'plumber', city: 'Lahore', area: 'Johar Town',
    lat: 31.4630, lng: 74.2955, rating: 4.0, jobs_completed: 63,
    hourly_rate_pkr: 1100, phone: '+92-324-6789012', verified: false,
    available_slots: [slot(1,10),slot(1,16),slot(2,9),slot(3,8),slot(3,13)],
  },
  {
    provider_id: 'prov_027', name: 'Ahmed Drainage Expert',
    service_type: 'plumber', city: 'Lahore', area: 'Model Town',
    lat: 31.4725, lng: 74.3200, rating: 4.4, jobs_completed: 128,
    hourly_rate_pkr: 1400, phone: '+92-325-7890123', verified: true,
    available_slots: [slot(1,8),slot(1,13),slot(2,10),slot(2,16),slot(3,12)],
  },
  {
    provider_id: 'prov_028', name: 'Junaid Water Works',
    service_type: 'plumber', city: 'Karachi', area: 'Clifton',
    lat: 24.8155, lng: 67.0320, rating: 4.7, jobs_completed: 198,
    hourly_rate_pkr: 2000, phone: '+92-331-8901234', verified: true,
    available_slots: [slot(1,9),slot(1,14),slot(2,8),slot(2,14),slot(3,10)],
  },
  {
    provider_id: 'prov_029', name: 'Saleem Pipe Fitter',
    service_type: 'plumber', city: 'Karachi', area: 'DHA',
    lat: 24.7945, lng: 67.0655, rating: 4.1, jobs_completed: 76,
    hourly_rate_pkr: 1800, phone: '+92-338-9012345', verified: true,
    available_slots: [slot(1,10),slot(1,15),slot(2,11),slot(3,9),slot(3,16)],
  },
  {
    provider_id: 'prov_030', name: 'Pervaiz Plumbing Centre',
    service_type: 'plumber', city: 'Karachi', area: 'Gulshan-e-Iqbal',
    lat: 24.9175, lng: 67.0840, rating: 3.9, jobs_completed: 45,
    hourly_rate_pkr: 1000, phone: '+92-339-0123456', verified: false,
    available_slots: [slot(1,11),slot(1,17),slot(2,9),slot(2,15),slot(3,10)],
  },
];

// ─── Helper lookups ──────────────────────────────────────────

/** Quick lookup by provider_id */
export const providerById = new Map(
  providers.map((p) => [p.provider_id, p]),
);

/** Filter providers by service type */
export const getProvidersByService = (type: string): Provider[] =>
  providers.filter((p) => p.service_type === type);

/** Filter providers by city */
export const getProvidersByCity = (city: string): Provider[] =>
  providers.filter((p) => p.city.toLowerCase() === city.toLowerCase());

/** Filter providers by city + area */
export const getProvidersByArea = (city: string, area: string): Provider[] =>
  providers.filter(
    (p) =>
      p.city.toLowerCase() === city.toLowerCase() &&
      p.area.toLowerCase() === area.toLowerCase(),
  );
