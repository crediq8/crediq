# Crediq Production Walkthrough

This report tracks production rollout for the voice-first, multilingual experience with full manual-mode continuity.

## 1) What was implemented

### Backend (FastAPI)
- Added production provider config and env-driven models in `backend/main.py`.
- Added secure CORS allowlist through `FRONTEND_ORIGINS`.
- Added voice endpoints:
  - `POST /voice/stt` for speech-to-text via external provider.
  - `POST /voice/intent` for command + financial intent orchestration.
  - `POST /voice/orchestrate` alias for explicit frontend contract.
  - `POST /voice/tts` for text-to-speech audio stream.

### Frontend (Next.js)
- Added central API client in `frontend/src/lib/api.ts`.
- Homepage `frontend/src/app/page.tsx` now uses backend voice flow:
  - MediaRecorder capture
  - backend STT
  - backend orchestration
  - backend TTS playback
- Dashboard `frontend/src/app/dashboard/page.tsx` now uses:
  - backend STT for mic input
  - centralized backend base URL for `/ai/chat` and `/ai/analyze`

## 2) Required environment variables

### Render (Backend)
- `OPENAI_API_KEY`
- `OPENAI_CHAT_MODEL` (default `gpt-4o-mini`)
- `OPENAI_STT_MODEL` (default `gpt-4o-mini-transcribe`)
- `OPENAI_TTS_MODEL` (default `gpt-4o-mini-tts`)
- `FRONTEND_ORIGINS` (comma-separated)
  - Example: `https://crediq.vercel.app,http://localhost:3000`

### Vercel (Frontend)
- `NEXT_PUBLIC_API_BASE_URL`
  - Example: `https://crediq-backend.onrender.com`

## 3) Production verification checklist

- [ ] Backend health endpoint returns status and providers.
- [ ] STT endpoint transcribes Hindi/English/Hinglish.
- [ ] Orchestration endpoint maps commands and numeric values.
- [ ] TTS endpoint returns playable audio for Hindi and English.
- [ ] Homepage mic flow updates UI and speaks backend response.
- [ ] Manual mode still works with scroll/click interactions.
- [ ] Dashboard chat + analyze requests resolve to backend base URL.
- [ ] No wildcard CORS in production.

## 4) Step-by-step deployment

1. Push code to `main` branch.
2. Confirm Render service auto-deploy starts for backend.
3. Confirm Vercel auto-deploy starts for frontend.
4. Validate backend health at `/`.
5. Validate frontend env `NEXT_PUBLIC_API_BASE_URL` points to backend URL.
6. Run smoke test:
   - voice input on homepage
   - command-driven section navigation
   - dashboard voice dictation

## 5) Rollback plan

If production incident occurs:
- Revert to previous stable commit in GitHub.
- Redeploy backend and frontend from stable revision.
- Keep failed provider disabled and fallback to manual mode while fixing.

## 6) Notes for launch operations

- Prefer monitoring STT/TTS latency and error rates from first 24 hours.
- Keep concise fallback prompts for unclear speech.
- Record top failed utterances to improve orchestration prompts.
