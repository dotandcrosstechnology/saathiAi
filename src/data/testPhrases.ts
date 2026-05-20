// ─────────────────────────────────────────────────────────────
// SaathiAI — Test Phrases for Intent Agent
// 20 Roman Urdu / mixed-language test inputs with expected intents
// ─────────────────────────────────────────────────────────────

export interface TestPhrase {
  /** The raw user input */
  phrase: string;
  /** Expected parsed fields (for validation / unit tests) */
  expected: {
    service_type: string;
    city: string | null;
    area: string | null;
    urgency: string;
    language_detected: string;
  };
}

export const testPhrases: TestPhrase[] = [
  // ────────────────────────────────────────────────
  // 5 MANDATORY phrases
  // ────────────────────────────────────────────────

  // 1. Roman Urdu — AC tech, specific area + time
  // Expected: ac_technician, Islamabad, G-13, normal, roman_urdu
  {
    phrase: 'Mujhe kal subah G-13 mein AC technician chahiye',
    expected: {
      service_type: 'ac_technician',
      city: 'Islamabad',
      area: 'G-13',
      urgency: 'normal',
      language_detected: 'roman_urdu',
    },
  },

  // 2. Roman Urdu — urgent plumber, no specific area
  // Expected: plumber, null, null, emergency, roman_urdu
  {
    phrase: 'yaar urgent plumber chahye, paani leak ho raha hai',
    expected: {
      service_type: 'plumber',
      city: null,
      area: null,
      urgency: 'emergency',
      language_detected: 'roman_urdu',
    },
  },

  // 3. English — electrician, specific area + time
  // Expected: electrician, Islamabad, F-10, normal, english
  {
    phrase: 'Need an electrician in F-10 tomorrow morning',
    expected: {
      service_type: 'electrician',
      city: 'Islamabad',
      area: 'F-10',
      urgency: 'normal',
      language_detected: 'english',
    },
  },

  // 4. Roman Urdu — AC tech, specific area + time (evening)
  // Expected: ac_technician, Lahore, Gulberg, normal, roman_urdu
  {
    phrase: 'AC technician aaj sham ko Gulberg mein',
    expected: {
      service_type: 'ac_technician',
      city: 'Lahore',
      area: 'Gulberg',
      urgency: 'normal',
      language_detected: 'roman_urdu',
    },
  },

  // 5. Mixed — electrician, urgency implied by situation
  // Expected: electrician, null, null, emergency, mixed
  {
    phrase: 'Electrician kab milay ga? main switch board phat gaya hai',
    expected: {
      service_type: 'electrician',
      city: null,
      area: null,
      urgency: 'emergency',
      language_detected: 'mixed',
    },
  },

  // ────────────────────────────────────────────────
  // 15 ADDITIONAL varied phrases
  // ────────────────────────────────────────────────

  // 6. Roman Urdu — plumber, specific city + area
  // Expected: plumber, Karachi, Clifton, normal, roman_urdu
  {
    phrase: 'Clifton mein plumber chahiye, kitchen ka nalkaa kharab hai',
    expected: {
      service_type: 'plumber',
      city: 'Karachi',
      area: 'Clifton',
      urgency: 'normal',
      language_detected: 'roman_urdu',
    },
  },

  // 7. English — AC technician, flexible timing
  // Expected: ac_technician, Karachi, DHA, flexible, english
  {
    phrase: 'Looking for an AC repair guy in DHA Karachi, anytime this week',
    expected: {
      service_type: 'ac_technician',
      city: 'Karachi',
      area: 'DHA',
      urgency: 'flexible',
      language_detected: 'english',
    },
  },

  // 8. Roman Urdu — emergency electrician, location mentioned
  // Expected: electrician, Islamabad, I-8, emergency, roman_urdu
  {
    phrase: 'I-8 mein bijli chali gayi, abhi electrician bhejo',
    expected: {
      service_type: 'electrician',
      city: 'Islamabad',
      area: 'I-8',
      urgency: 'emergency',
      language_detected: 'roman_urdu',
    },
  },

  // 9. Mixed — plumber, time specified
  // Expected: plumber, Lahore, DHA, normal, mixed
  {
    phrase: 'DHA Lahore mein plumber tomorrow 2pm, pipe burst ho gaya',
    expected: {
      service_type: 'plumber',
      city: 'Lahore',
      area: 'DHA',
      urgency: 'high',
      language_detected: 'mixed',
    },
  },

  // 10. Roman Urdu — AC service with sub-type hint
  // Expected: ac_technician, Islamabad, F-11, normal, roman_urdu
  {
    phrase: 'AC ki gas bharwani hai, F-11 Islamabad, parson chalega',
    expected: {
      service_type: 'ac_technician',
      city: 'Islamabad',
      area: 'F-11',
      urgency: 'flexible',
      language_detected: 'roman_urdu',
    },
  },

  // 11. English — electrician, vague location
  // Expected: electrician, Lahore, null, normal, english
  {
    phrase: 'I need someone to fix my wiring in Lahore',
    expected: {
      service_type: 'electrician',
      city: 'Lahore',
      area: null,
      urgency: 'normal',
      language_detected: 'english',
    },
  },

  // 12. Roman Urdu — plumber, emergency flooding
  // Expected: plumber, Islamabad, G-13, emergency, roman_urdu
  {
    phrase: 'G-13 mein ghar mein paani bhar gaya hai, plumber foran chahiye!',
    expected: {
      service_type: 'plumber',
      city: 'Islamabad',
      area: 'G-13',
      urgency: 'emergency',
      language_detected: 'roman_urdu',
    },
  },

  // 13. Mixed — AC, casual tone, Lahore
  // Expected: ac_technician, Lahore, Johar Town, normal, mixed
  {
    phrase: 'Johar Town mein AC repair karwana hai, koi acha banda bhejo',
    expected: {
      service_type: 'ac_technician',
      city: 'Lahore',
      area: 'Johar Town',
      urgency: 'normal',
      language_detected: 'roman_urdu',
    },
  },

  // 14. English — plumber, Karachi
  // Expected: plumber, Karachi, Gulshan-e-Iqbal, high, english
  {
    phrase: 'Urgent plumber needed in Gulshan-e-Iqbal for bathroom leak',
    expected: {
      service_type: 'plumber',
      city: 'Karachi',
      area: 'Gulshan-e-Iqbal',
      urgency: 'high',
      language_detected: 'english',
    },
  },

  // 15. Roman Urdu — electrician, Model Town
  // Expected: electrician, Lahore, Model Town, normal, roman_urdu
  {
    phrase: 'Model Town mein electrician chahiye, naya meter lagwana hai',
    expected: {
      service_type: 'electrician',
      city: 'Lahore',
      area: 'Model Town',
      urgency: 'normal',
      language_detected: 'roman_urdu',
    },
  },

  // 16. Mixed — ambiguous service type (needs clarification)
  // Expected: unknown, Islamabad, F-10, normal, mixed
  {
    phrase: 'F-10 mein kuch repair kaam hai, kal aa saktay ho?',
    expected: {
      service_type: 'unknown',
      city: 'Islamabad',
      area: 'F-10',
      urgency: 'normal',
      language_detected: 'mixed',
    },
  },

  // 17. Roman Urdu — AC, night emergency
  // Expected: ac_technician, Karachi, Clifton, emergency, roman_urdu
  {
    phrase: 'Raat ko AC band ho gaya Clifton mein, bohat garmi hai, koi bhejo!',
    expected: {
      service_type: 'ac_technician',
      city: 'Karachi',
      area: 'Clifton',
      urgency: 'emergency',
      language_detected: 'roman_urdu',
    },
  },

  // 18. English — electrician, scheduled
  // Expected: electrician, Islamabad, F-10, normal, english
  {
    phrase: 'Schedule an electrician visit to F-10 Islamabad next Monday at 3pm',
    expected: {
      service_type: 'electrician',
      city: 'Islamabad',
      area: 'F-10',
      urgency: 'normal',
      language_detected: 'english',
    },
  },

  // 19. Roman Urdu — plumber with constraints
  // Expected: plumber, Lahore, Gulberg, normal, roman_urdu
  {
    phrase: 'Gulberg mein plumber chahiye lekin sirf verified wala, budget 1500 tak',
    expected: {
      service_type: 'plumber',
      city: 'Lahore',
      area: 'Gulberg',
      urgency: 'normal',
      language_detected: 'roman_urdu',
    },
  },

  // 20. Mixed — multi-service hint
  // Expected: electrician, Islamabad, G-13, high, mixed
  {
    phrase: 'G-13 mein short circuit ho gaya, electrician aur maybe plumber bhi chahiye',
    expected: {
      service_type: 'electrician',
      city: 'Islamabad',
      area: 'G-13',
      urgency: 'high',
      language_detected: 'mixed',
    },
  },
];
