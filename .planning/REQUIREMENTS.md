# Crediq Requirements

## System Constraints
- **Language**: Next.js (Frontend), Python FastAPI (Backend)
- **Deployment**: Vercel (Next.js) + Render (FastAPI) or similar.
- **Database**: Vercel Postgres / Render Postgres / Supabase
- **Styling**: Tailwind CSS + Framer Motion (Deep dark, glassmorphic, 3D elements)
- **Voice**: Whisper for Speech-to-Text inference

## Required Capabilities

1. **Intelligent Chat Module** (Core Interaction)
   - Accepts text and voice.
   - Parses intent and extracts required data points (amount, tenure, goals).
   - Serves as the central command hub.

2. **FD Calculator & Comparison**
   - Interactive FD calculation inputs.
   - List, compare, and sort dynamic bank data based on returns.

3. **Goal Planning & Insights**
   - Financial health scoring engine.
   - Visual progress indicators for saving.

4. **Multi-modal Workflow**
   - The UI auto-updates based on backend response processing (Voice -> Text -> Intent -> UI State Update).

5. **Data Persistence**
   - Store user states, session data, and specific financial goals in PostgreSQL.
