# PrepPulse AI — AI Interview Practice & Performance Analytics Platform

PrepPulse AI is a production-ready Web Application designed for engineering candidates and job seekers to simulate high-pressure tech interviews, receive instant multi-dimensional evaluation reports, and manage their preparation roadmap through an interactive calendar with AI schedule generation.

---

## Tech Stack & Architecture

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend & APIs**: Next.js Server Route Handlers (`/api/interview/*`, `/api/schedule/*`).
- **AI Integration**:
  - Google Gemini API (`@google/generative-ai` / `gemini-1.5-flash`).
  - **Contextual Fallback Simulation Engine**: Built-in question generation, follow-ups, evaluation, and study-plan generation when Gemini is not configured or unavailable. The current API response does not identify which engine produced a result.
- **Database & Persistence**:
  - The Prisma schema targets PostgreSQL, including Supabase PostgreSQL through `DATABASE_URL`.
  - Current application profile, interview, and planner state is persisted by Zustand in browser storage; Prisma is not wired to those user flows.
- **Audio, Speech & Video Engine**:
  - Web Audio API (`AudioContext` + `AnalyserNode`) for real-time waveform and frequency visualization.
  - Web Speech API (`SpeechRecognition` for live transcription and `SpeechSynthesis` for spoken interviewer questions).
  - MediaDevices API (`navigator.mediaDevices.getUserMedia`) for live candidate webcam preview with mirror flipping.
- **Calendar & Daily Planner**:
  - Interactive Month, Week, and Day grid with time-blocking slots.
  - Daily goal checklist with streak tracking and celebratory confetti.
  - `.ics` iCalendar generator for Google Calendar and Apple Calendar synchronization.
  - AI Schedule Assistant to auto-generate personalized daily preparation sprints.

---

## Core Modules

### 1. User Profile & Multi-Role Setup
- Target Roles: Software Engineer, Full Stack, Frontend, Backend, Data Scientist, ML/AI, Product Manager, DevOps/SRE, System Architect.
- Experience Levels: Junior (0-2y), Mid-Level (3-5y), Senior (5-8y), Lead/Staff (8+y).
- Tech Stack selector with tag management.
- Resume summary input feeding contextual experience directly into the AI prompt generator.

### 2. Live AI Mock Interview Simulation Room
- **Tracks**: Technical & DSA, Behavioral (STAR Framework), System Design, and HR & Culture Fit.
- **Real-Time Simulation UI**:
  - Live webcam preview with toggle and mirror controls.
  - Audio waveform visualizer responding dynamically to user and AI speech.
  - Live Speech-to-Text continuous transcription with interim preview and WPM pacing counter.
  - Synchronized text typing fallback for non-microphone environments.
  - Contextual hints and question tips.
  - **Dynamic Probing Follow-Ups**: AI listens to candidate answers and asks follow-up questions to test fault tolerance, edge cases, and quantifiable STAR results.

### 3. AI Performance Analytics & Feedback Engine
- Immediate comprehensive evaluation report:
  - **Overall Score** (0-100) with hire recommendation badge (Strong Hire, Leaning Hire, Borderline, Do Not Hire).
  - **Technical Accuracy Score** (0-100).
  - **Behavioral & STAR Compliance Score** (0-100) with Situation, Task, Action, and Result individual ratings.
  - **Acoustic & Speech Metrics**: Words Per Minute (WPM) gauge (optimal 130-160 zone), filler word frequency ("um", "like", "you know", "actually"), vocal clarity, and tone analysis.
  - **Comparative Answer Breakdown**: Side-by-side comparison of candidate's transcribed response against a staff-level benchmark answer, detailing key omissions and critiques.
  - **Actionable Takeaways**: One-click "Add Action Items to Daily Planner".

### 4. Daily Activity & Calendar Schedule Dashboard
- **Interactive Calendar Grid**: Month, Week, and Day views with category filters (Interview, DSA, System Design, Behavioral, Study, Rest).
- **Status Tracking**: Planned, Completed, Missed on every time-blocked event.
- **Daily Checklist**: Interactive tasks with streak counter and progress ring.
- **Activity Heatmap**: GitHub-style 84-day consistency matrix.
- **AI Schedule Assistant**: Inputs target interview date and target company (e.g. Google, Amazon) to auto-generate a structured daily sprint.
- **Calendar Export**: 1-click `.ics` export for Google Calendar / Apple Calendar.

### 5. Skill Vault & Flashcards
- Curated high-signal question repository across algorithms, system design, and behavioral frameworks with interactive flip-to-reveal cards.

### 6. Settings & API Management
- The settings UI accepts Gemini and OpenAI API keys, but the current AI engine only uses the Gemini key and the settings store persists keys in browser storage. Do not enter production credentials until key handling is moved server-side.
- Speech rate, pitch, auto-play TTS toggle, and default webcam preferences.

---

## Database Schema (`prisma/schema.prisma`)

The application defines 6 primary tables:
1. `users`: Candidate profile, target roles, experience tier, tech stack, resume summary, and streak metrics.
2. `interviews`: Interview session metadata, type, mode, status, duration, and overall score.
3. `questions`: Question text, domain, difficulty, candidate answer, ideal answer, WPM, and follow-ups.
4. `feedbacks`: Technical accuracy, STAR compliance, speech metrics, filler words breakdown, comparative breakdown, and key takeaways.
5. `activities`: Daily task checklist items with priority (HIGH, MEDIUM, LOW) and completion timestamps.
6. `calendar_events`: Time-blocked slots with date, start/end times, category, and status.

---

## Getting Started

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Configure Database & Environment
Set `DATABASE_URL` in `.env.local` to your Supabase PostgreSQL connection string. The checked-in Prisma schema has not been verified against the live project. Review the schema and generated changes before applying any database changes; `prisma db push` can modify the database.

### 3. Run Development Server
\`\`\`bash
npm run dev
\`\`\`
Visit [http://localhost:3000](http://localhost:3000) to access the platform.

### 4. Build for Production
\`\`\`bash
npm run build
npm run start
\`\`\`

### 5. Deploy to Vercel
Import the repository into Vercel with the project root set to the repository root. Vercel detects the Next.js app and uses `npm run build`. Add `GEMINI_API_KEY` in the Vercel project environment variables to enable Gemini-powered features; the built-in fallback engine works when it is not configured. Do not upload `.env` files.
