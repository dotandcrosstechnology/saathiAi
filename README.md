# SaathiAI — Agentic AI Service Orchestrator

> Built for #AISeekho 2026 Google Antigravity Hackathon — Challenge 2: AI Service Orchestrator for Informal Economy

**SaathiAI** is a multi-agent service orchestrator that automates the end-to-end lifecycle of an informal service request in Pakistan — from a free-form Roman Urdu message like *"Mujhe kal subah G-13 mein AC technician chahiye"* to a confirmed booking with scheduled follow-up reminders.

The system is orchestrated entirely on **Google Antigravity**, with five specialised agents collaborating through a shared workplan and a transparent reasoning trace.

---

## 📱 Quick Links

- 🎬 **Demo Video (3-5 min):** [PASTE_YOUTUBE_OR_DRIVE_LINK_HERE]
- 🛠️ **Antigravity Usage Video (2-3 min):** [PASTE_YOUTUBE_OR_DRIVE_LINK_HERE]
- 📥 **APK Download:** [PASTE_GOOGLE_DRIVE_LINK_HERE]
- 🗂️ **Antigravity Traces (zipped):** [PASTE_GOOGLE_DRIVE_LINK_HERE]

---

## 🎯 The Problem

Pakistan's informal service economy — plumbers, electricians, AC technicians, tutors — runs on WhatsApp, phone calls, and word-of-mouth. Four recurring failure modes:

1. **Discovery friction:** users call 4-5 contacts before finding someone available.
2. **Trust gap:** no ratings, no verification, no recourse.
3. **Language gap:** apps assume English; real users mix Roman Urdu, Urdu, and English.
4. **No follow-through:** no reminders, no status updates, no completion confirmation.

---

## 🤖 The Solution: Five Agents on Antigravity

| Agent | Responsibility | Tools |
|-------|----------------|-------|
| **Intent Agent** | Parse Roman Urdu / English request into structured intent | Gemini 2.5 Flash |
| **Discovery Agent** | Find candidate providers near user | Firestore query |
| **Ranking Agent** | Score & justify top choice in user's language | Weighted formula + Gemini |
| **Booking Agent** | Confirm slot, generate booking, fire notification | Firestore write + Expo Notifications |
| **Follow-up Agent** | Schedule reminder + arrival check + completion check | Expo scheduled notifications |

### The "Agentic Moment"

When the top-ranked provider becomes unavailable mid-booking, the orchestrator autonomously re-ranks the remaining candidates, generates a natural-language explanation in the user's language (Roman Urdu / English), and offers a fallback. This decision is visible in the agent trace and proves the system reasons rather than executes a fixed workflow.

---

## 🏗️ Architecture
┌─────────────────────────────────────────────────────────────┐
│              REACT NATIVE (EXPO) MOBILE APP                 │
│  Auth · Chat · Bookings Tab · Profile Tab · Trace Viewer    │
└──────────────────────┬──────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│         GOOGLE ANTIGRAVITY  (Orchestration Layer)           │
│                                                             │
│   [Workplan] ──▶ [Tasks Plan] ──▶ [Agent Traces & Logs]     │
│                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│   │ Intent   │─▶│Discovery │─▶│ Ranking  │                  │
│   └──────────┘  └──────────┘  └────┬─────┘                  │
│                                    ▼                        │
│                              ┌──────────┐  ┌──────────┐     │
│                              │ Booking  │─▶│Follow-up │     │
│                              └──────────┘  └──────────┘     │
└────────┬────────────────────────┬──────────────┬────────────┘
▼                        ▼              ▼
┌────────────┐         ┌──────────────┐  ┌──────────┐
│ Gemini API │         │ Firestore    │  │ Expo     │
│ + Groq     │         │ Auth + DB    │  │ Notifs   │
│ (fallback) │         │              │  │          │
└────────────┘         └──────────────┘  └──────────┘

---

## 🚀 How Google Antigravity Is Used

Antigravity is the brain of SaathiAI — not a wrapper:

- **Workplan & Tasks Plan** — generated per user request, decomposing the goal into agent dispatches
- **Five agents** — each registered with its own prompt, input/output schema, and toolset
- **Tool routing** — Firestore reads/writes, LLM calls, and notifications all routed through Antigravity's tool interface
- **Agent traces** — reasoning string, tool inputs, and tool outputs persisted at every step
- **Visible reasoning** — the mobile app surfaces each agent's `thought` and `decision` as "agent thinking" bubbles in the chat UI, making the agentic workflow visible to the user

Trace exports for the three demo scenarios are in `/traces/submission/`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Orchestration | Google Antigravity |
| Reasoning model (primary) | Gemini 2.5 Flash |
| Reasoning model (fallback) | Groq Llama 3.3 70B |
| Mobile framework | React Native (Expo SDK 50+) |
| Authentication | Firebase Auth (email/password) |
| Database | Firebase Firestore |
| Notifications | Expo Notifications |
| Language | TypeScript |

### Why a multi-provider LLM layer?
The `src/services/llm.ts` abstraction tries Gemini first (preserving the Google ecosystem story), falls back to Groq on quota/rate-limit errors, and caches demo phrases for guaranteed offline behavior. Every reasoning step records which provider was used.

---

## 📋 Demo Scenarios

Three end-to-end scenarios are documented as runtime traces in `/traces/submission/`:

### 1. Happy Path — `traces/submission/happy_path.json`
**Input:** *"Mujhe kal subah G-13 mein AC technician chahiye"*
**Outcome:** All 5 agents execute. Books Ali AC Services at 10:00 AM with Roman Urdu justification.

### 2. Fallback — `traces/submission/fallback.json` (The Agentic Moment)
**Input:** Same as above, but top provider unavailable.
**Outcome:** Agent autonomously re-ranks, generates a Roman Urdu explanation, suggests Hamza Cooling Solutions, books on user confirmation.

### 3. Emergency — `traces/submission/emergency.json`
**Input:** *"yaar urgent plumber chahye, paani leak ho raha hai"*
**Outcome:** Agent detects emergency urgency, requests location clarification, then books a Lahore plumber.

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- Expo CLI
- A Firebase project (Firestore, Auth, Cloud Messaging enabled)
- Gemini API key (Google AI Studio)
- Groq API key (console.groq.com) — for fallback path

### Steps

```bash
git clone https://github.com/dotandcrosstechnology/saathiAi.git
cd saathiAi
npm install
cp .env.example .env
# Fill in your API keys in .env

# Seed Firestore with 30 mock providers across Islamabad, Lahore, Karachi
npm run seed

# Start the dev server
npx expo start
```

Scan the QR code with **Expo Go** on Android, or install the APK from the download link above.

### Environment Variables

See `.env.example` for the complete list. All keys are required except `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (we use Firestore as the primary discovery source).

---

## 🧪 Testing the Agent Pipeline

```bash
npm run test:intent          # Intent Agent against 20 Roman Urdu test phrases
npm run test:e2e             # Full pipeline, happy path
npm run test:e2e:fallback    # Fallback scenario
```

Each test script writes a trace to `/traces/` for inspection.

---

## 📦 Submission Deliverables Map

| # | Required | Location |
|---|----------|----------|
| 1 | Mobile App APK | Google Drive link above |
| 2 | GitHub Repository | This repo |
| 3 | Demo Video (3-5 min) | YouTube link above |
| 4 | Antigravity Usage Video (2-3 min) | YouTube link above |
| 5 | README / Documentation | This file |
| 6 | Antigravity Traces (zip) | Google Drive link above |

---




---


