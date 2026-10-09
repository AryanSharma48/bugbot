# VoiceBugBot Live Status Dashboard

A real-time, 4-column reactive Kanban board built with **Next.js 16**, **TypeScript**, and **SWR** to monitor voice-reported issues and autonomous coding agent fixes for [aryanSharma48/smoothapi](https://github.com/aryanSharma48/smoothapi).

---

## Features

- **4 Reactive Columns:**
  - `Reported` (Cyan) — Newly filed voice bug reports awaiting triage.
  - `In Progress` (Amber) — Automated fix running via GitHub Actions + Aider (animated pulsing indicator).
  - `Needs Review` (Emerald) — Passing tests verified; pull request open for human review.
  - `Fix Failed` (Rose) — Fix attempt failed or timed out; one-click prompt to retry.
- **Upstream Rate-Limit Shield:** `/api/issues` proxies GitHub API calls with a server-side 3-second cache.
- **Embedded Voice Assistant:** Directly integrates the ElevenLabs Conversational AI custom web embed.
- **Interactive Issue Modals:** Click any card to inspect full steps to reproduce, environment info, and spoken command hints.
- **Custom Dark Glassmorphic Design:** Smooth animations, severity badges, and zero third-party CSS dependencies.

---

## Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your variables:
```env
# Target GitHub repository
GITHUB_REPO=aryanSharma48/smoothapi

# Optional: GitHub fine-grained PAT (read-only: Issues & Pull Requests) to increase rate limits to 5,000/hr
GITHUB_TOKEN=

# ElevenLabs Conversational AI Agent ID
NEXT_PUBLIC_AGENT_ID=
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the board.

### 3. Production Build

```bash
npm run build
npm start
```
