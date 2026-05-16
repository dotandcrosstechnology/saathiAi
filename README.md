# 🤝 SaathiAI

> Agentic service orchestrator for Pakistan's informal economy — connecting users with AC technicians, electricians, and plumbers through intelligent, multi-lingual AI agents.

---

## 📋 Project

SaathiAI is a mobile-first platform that uses an **agentic AI pipeline** to understand natural-language service requests (in Urdu, Roman Urdu, or English), match users with verified local providers, and manage the full booking lifecycle — including reminders, receipts, and follow-ups.

**Key Features**
- 🗣️ Multi-lingual voice & text input (Urdu / Roman Urdu / English)
- 🧠 Agentic reasoning with transparent trace playback
- 📍 Location-aware provider matching
- 📅 Smart scheduling with conflict detection
- 🔔 Push-notification reminders
- 🧾 Digital receipts

---

## 🏗️ Architecture

```
User Input (voice / text)
        │
        ▼
┌─────────────────┐
│   IntentAgent    │  ← NLU: parse service type, location, urgency
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MatchingAgent   │  ← Filter & rank providers
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  BookingAgent    │  ← Confirm, schedule, notify
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ FollowUpAgent    │  ← Reminders, receipts, feedback
└─────────────────┘
```

**Tech Stack:** Expo (React Native) · TypeScript · Firebase · Gemini API

---

## 🔮 Antigravity Integration

> _How we used the Antigravity coding assistant during development._

- Project scaffolding and boilerplate generation
- Agent pipeline design and iteration
- Type-safe interface definitions
- Debugging and refactoring assistance

---

## 🤖 Agents

| Agent | Responsibility |
|-------|----------------|
| **IntentAgent** | Parses natural-language requests into structured `ServiceIntent` |
| **MatchingAgent** | Scores and ranks providers by proximity, rating, availability |
| **BookingAgent** | Confirms bookings, handles scheduling conflicts |
| **FollowUpAgent** | Sends reminders, generates receipts, collects feedback |

Each agent emits `ReasoningStep` objects that are collected into an `AgentTrace` for full transparency and demo playback.

---

## 🚀 Setup

```bash
# 1. Clone the repo
git clone https://github.com/<your-org>/saathi-ai.git
cd saathi-ai

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Fill in your API keys in .env

# 4. Start the dev server
npx expo start
```

### Prerequisites
- Node.js ≥ 18
- Expo CLI (`npm i -g expo-cli`)
- Firebase project with Firestore enabled
- Google Gemini API key

---

## 🎬 Demo

> _Add demo video link / screenshots here._

1. **Voice Input** — User says "AC thik karna hai, Gulberg mein, kal subah"
2. **Intent Parsing** — Agent extracts: AC technician, Gulberg, tomorrow morning
3. **Provider Match** — Top 3 providers ranked by proximity & rating
4. **Booking** — User confirms, provider notified
5. **Trace Playback** — Full reasoning trace visible in-app

---

## ✅ Submission Checklist

- [ ] All agents implemented and tested
- [ ] Voice input working (Expo AV)
- [ ] Firebase integration complete
- [ ] Push notifications configured
- [ ] Agent trace playback UI
- [ ] Demo video recorded
- [ ] README finalized
- [ ] Code pushed to GitHub
- [ ] `.env.example` up to date
- [ ] Presentation deck ready
