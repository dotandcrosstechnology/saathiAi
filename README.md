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
