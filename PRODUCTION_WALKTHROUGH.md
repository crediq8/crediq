# Crediq: Simple Production Setup Guide (Hindi)

Ye guide bilkul beginner-friendly hai. Aap step-by-step follow karein.

---

## Step 0: Aapko kya mil chuka hai (already integrated)

Is project me ab ye sab connected hai:

1. AI model: GPT-4o (conversation + intent detection + explanation)
2. Speech-to-Text: Whisper API (Hindi + Hinglish/mixed input)
3. Text-to-Speech: ElevenLabs (Hindi voice), fallback OpenAI TTS
4. Database: Supabase (session memory + interaction history)
5. Session memory (without login): auto-generated session ID
6. Intent routing: calculation, comparison, planning, fraud, general
7. Clarification flow: unclear input pe simple Hindi follow-up question
8. Greeting flow: first visit pe ek baar Hindi greeting + mute button

---

## Step 1: Accounts bana lo (one-time)

### 1) OpenAI account
- OpenAI pe account banaiye.
- API key generate kijiye.
- Is key ka use AI + Whisper + OpenAI fallback TTS me hoga.

### 2) ElevenLabs account
- ElevenLabs me account banaiye.
- API key generate kijiye.
- Voice library se Hindi/multilingual soft voice choose kijiye.
- Us voice ka `voice_id` copy kijiye.

### 3) Supabase account
- Supabase pe new project banaiye.
- Project settings se `Project URL` aur `service_role key` copy kijiye.

---

## Step 2: Supabase tables banaiye

Project me file hai:
- [backend/supabase_schema.sql](backend/supabase_schema.sql)

Kya karein:
1. Supabase dashboard kholo.
2. SQL Editor kholo.
3. [backend/supabase_schema.sql](backend/supabase_schema.sql) ka pura content run karo.

Ye 2 tables banayega:
1. `user_memory` (income, savings, goals)
2. `interaction_history` (previous conversations)

---

## Step 3: Backend env variables set karo

Project me example file hai:
- [backend/.env.example](backend/.env.example)

Aap backend folder me `.env` file banao aur values paste karo:

1. `OPENAI_API_KEY`
2. `OPENAI_CHAT_MODEL=gpt-4o`
3. `OPENAI_STT_MODEL=whisper-1`
4. `OPENAI_TTS_MODEL=gpt-4o-mini-tts`
5. `ELEVENLABS_API_KEY`
6. `ELEVENLABS_VOICE_ID_HI`
7. `SUPABASE_URL`
8. `SUPABASE_SERVICE_ROLE_KEY`
9. `FRONTEND_ORIGINS=http://localhost:3000`

Important:
- Kabhi bhi key ko public mat karo.
- `service_role key` sirf backend me use karo, frontend me nahi.

---

## Step 4: Frontend env variable set karo

Frontend folder me `.env.local` banao:

1. `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

Production me isko backend deployed URL se replace karna hai.

---

## Step 5: Local run karo

### Backend run
1. Terminal open karo.
2. `backend` folder me jao.
3. Install: `pip install -r requirements.txt`
4. Run: `uvicorn main:app --reload --port 8000`

### Frontend run
1. New terminal open karo.
2. `frontend` folder me jao.
3. Install: `npm install`
4. Run: `npm run dev`
5. Browser me open: `http://localhost:3000`

---

## Step 6: Voice greeting test

Open karte hi:
1. Hindi me greeting sunayi deni chahiye.
2. Ye sirf first visit me ek baar play hoti hai.
3. Navbar me `Mute Voice` button diya gaya hai.

Agar auto-play block ho:
1. Page pe click karo.
2. Greeting play ho jayegi.

---

## Step 7: Voice assistant flow test

Mic dabaiye aur boliye:
1. "Mujhe 50 hazar 2 saal ke liye invest karna hai"
2. "Best option dikhao"
3. "Ye scheme double return bol rahi hai, safe hai kya?"

Expected behavior:
1. Speech text me convert hogi.
2. AI intent detect karega.
3. Module route hoga (calculation/comparison/planning/fraud).
4. Hindi me simple response aayega.
5. Voice me response बोलेगा.
6. Result cards update hongi.

---

## Step 8: AI training prompt + knowledge update ka simple tareeka

Aap ye files edit karke AI behavior train kar sakte ho:

1. Main Hindi behavior prompt:
- [backend/data/system_prompt_hi.txt](backend/data/system_prompt_hi.txt)

2. FD rates:
- [backend/data/fd_rates.json](backend/data/fd_rates.json)

3. Bank comparison:
- [backend/data/bank_comparison.json](backend/data/bank_comparison.json)

4. Financial rules + fraud patterns:
- [backend/data/financial_rules.json](backend/data/financial_rules.json)

Update process:
1. File values badlo.
2. Backend restart karo.
3. Naya behavior live ho jayega.

---

## Step 9: User memory kaise kaam karta hai

Without login bhi memory kaam karti hai:
1. Frontend auto `session_id` banata hai.
2. Session ID browser local storage me save hota hai.
3. Income/savings/goals AI extract kare to Supabase me save hota hai.
4. Purani interactions `interaction_history` me save hoti hain.

---

## Step 10: Error handling behavior

System ab ye handle karta hai:
1. unclear speech -> Hindi clarification question
2. empty/invalid audio -> friendly retry
3. missing financial data -> simple follow-up prompts
4. DB fail ho to local fallback memory se app band nahi hota

---

## Deploy karne se pehle quick checklist

1. Backend health open karo: `GET /`
2. Mic test Hindi me karo
3. Fraud query test karo
4. Supabase me rows insert ho rahi hain check karo
5. Frontend se API URL correct hai check karo

---

## Aapko kya edit karna hoga future me

Regular updates ke liye bas ye 4 cheezein:
1. FD rates JSON
2. Bank comparison JSON
3. Financial rules JSON
4. System prompt text

Ye update karte hi AI zyada accurate aur local-context friendly hota jayega.
