# Crediq

## Core Value
A premium, modern, startup-level fintech platform designed to guide both novice and advanced users through financial journeys using a multi-modal (Voice + Guided + Manual) workflow engine. It provides high-end 3D-inspired aesthetics (glassmorphism, smooth animations) while acting as a seamless assistant for calculating Fixed Deposits, comparing banks, goal planning, and checking for fraud.

## Context
The user has zero coding experience and expects a fully functional end-to-end platform featuring a Next.js frontend, a FastAPI backend, and Voice intelligence integrations (Whisper). The objective is to make the system highly robust with zero dead-ends and excellent error handling.

## Requirements

### Validated
(None yet — ship to validate)

### Active
- [ ] **Unified Interaction Engine**: System must support 4 modes (Direct, Guided, Voice, Hybrid) uniformly without segregated UIs.
- [ ] **Routing Module**: Backend AI to parse intent and route to correct flow (FD, Comparison, Goals, Fraud).
- [ ] **Premium UI (Stitch Principles)**: Deep neutral background, soft gradients, glassmorphism, depth, Framer motion animations.
- [ ] **3D / Interactive Experience**: Animated orb, floating cards, hover lifts.
- [ ] **Specific Financial Modules**: FD Calculator, Compare Banks, Goal Planning, Fraud Checker, Financial Health Score.
- [ ] **Voice Interface**: Whisper for Speech-to-Text inference, auto-fill of UI fields from voice context.
- [ ] **Backend Integration**: FastAPI serving as the connective logic layer to Next.js.
- [ ] **Persistence**: Database connection via Vercel Postgres / Render Postgres / Supabase to save user states (income, goals, sessions).
- [ ] **Continuous Flow**: Each module outcome must suggest logical next actions (no dead ends).

### Out of Scope
- [ ] Separate UIs for beginners vs advanced users — we will use layered complexity in a single UI instead.
- [ ] Typical/basic/old-fashioned fintech colors (flat UI, plain red/blue/green).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + Tailwind + Framer Motion | Provides the premium 3D/glassmorphic aesthetics required. | — Pending |
| FastAPI Backend | Excellent for AI orchestration and handling async voice parsing. | — Pending |
| Vercel / Render Postgres (Database) | Supabase is an option, but standard Vercel/Render Postgres integrates perfectly as well. | — Pending |
| Module-Based Architecture | Future-proofs the app for adding new features (Stocks, Crypto, etc). | — Pending |

---
*Last updated: 2026-04-13 after initialization*
