from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from io import BytesIO
from uuid import uuid4
import json
import os
import requests
from dotenv import load_dotenv
from supabase import Client, create_client

# Load Environment Variables from .env file
load_dotenv()


def parse_origins() -> list[str]:
    return ["*"]


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o")
OPENAI_STT_MODEL = os.getenv("OPENAI_STT_MODEL", "whisper-1")
OPENAI_TTS_MODEL = os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID_HI = os.getenv("ELEVENLABS_VOICE_ID_HI")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

REQUIRED_ENV_VARS = ["OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
missing_vars = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]

if missing_vars:
    print(f"CRITICAL ERROR: Missing environment variables: {', '.join(missing_vars)}")
    # We will let the app start but fail on endpoints to prevent total crash on boot if possible, 
    # OR we raise a descriptive error.
    # raise RuntimeError(f"Missing: {', '.join(missing_vars)}")

client = OpenAI(api_key=OPENAI_API_KEY or "dummy")
supabase: Client | None = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    except Exception as e:
        print(f"Supabase init error: {e}")

# Local fallback keeps app usable even if Supabase is not configured yet.
local_memory_store: dict[str, dict] = {}
local_history_store: dict[str, list[dict]] = {}

app = FastAPI(title="Crediq Intelligence API")

# Setup CORS to allow Next.js frontend to communicate with FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None

class AnalysisRequest(BaseModel):
    amount: float
    years: float
    rate: float
    maturity: float
    intent: str


class VoiceIntentRequest(BaseModel):
    transcript: str
    ui_language: str = "en"
    session_id: str | None = None


class VoiceTTSRequest(BaseModel):
    text: str
    language: str = "en"


class MemoryUpsertRequest(BaseModel):
    session_id: str
    income: float | None = None
    savings: float | None = None
    goals: list[str] | None = None


class SessionRequest(BaseModel):
    session_id: str


def read_json_file(file_path: str, default_value):
    try:
        with open(file_path, "r", encoding="utf-8") as file_obj:
            return json.load(file_obj)
    except Exception:
        return default_value


def read_text_file(file_path: str, default_value: str) -> str:
    try:
        with open(file_path, "r", encoding="utf-8") as file_obj:
            return file_obj.read().strip()
    except Exception:
        return default_value


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
FD_RATES = read_json_file(os.path.join(DATA_DIR, "fd_rates.json"), {"banks": []})
BANK_COMPARISON = read_json_file(os.path.join(DATA_DIR, "bank_comparison.json"), {"products": []})
FINANCIAL_RULES = read_json_file(os.path.join(DATA_DIR, "financial_rules.json"), {"rules": []})
SYSTEM_PROMPT_HI = read_text_file(
    os.path.join(DATA_DIR, "system_prompt_hi.txt"),
    "Aap Crediq ke financial guide ho. Hamesha simple Hindi mein madad karo.",
)

@app.get("/")
def health_check():
    return {
        "status": "systems online",
        "version": "2.0.0",
        "origins": parse_origins(),
        "providers": {
            "chat": "openai",
            "stt": "openai",
            "tts": "elevenlabs_or_openai",
            "database": "supabase" if supabase else "local_fallback",
        },
    }


def lang_name(code: str) -> str:
    return "Hindi" if code == "hi" else "English"


def get_or_create_session_id(session_id: str | None) -> str:
    return session_id or str(uuid4())


def rulebook_text() -> str:
    return (
        f"FD Rates: {json.dumps(FD_RATES, ensure_ascii=False)}\n"
        f"Bank Comparison: {json.dumps(BANK_COMPARISON, ensure_ascii=False)}\n"
        f"Financial Rules: {json.dumps(FINANCIAL_RULES, ensure_ascii=False)}"
    )


def supabase_upsert_memory(session_id: str, income: float | None, savings: float | None, goals: list[str] | None):
    payload = {
        "session_id": session_id,
        "income": income,
        "savings": savings,
        "goals": goals or [],
    }
    if supabase:
        supabase.table("user_memory").upsert(payload).execute()
        return

    existing = local_memory_store.get(session_id, {})
    merged = {
        "session_id": session_id,
        "income": income if income is not None else existing.get("income"),
        "savings": savings if savings is not None else existing.get("savings"),
        "goals": goals if goals is not None else existing.get("goals", []),
    }
    local_memory_store[session_id] = merged


def get_memory(session_id: str) -> dict:
    if supabase:
        result = supabase.table("user_memory").select("*").eq("session_id", session_id).limit(1).execute()
        if result.data:
            return result.data[0]
        return {"session_id": session_id, "income": None, "savings": None, "goals": []}

    return local_memory_store.get(session_id, {"session_id": session_id, "income": None, "savings": None, "goals": []})


def add_history(session_id: str, user_text: str, ai_text: str, intent: str):
    payload = {
        "session_id": session_id,
        "user_text": user_text,
        "ai_text": ai_text,
        "intent": intent,
    }
    if supabase:
        supabase.table("interaction_history").insert(payload).execute()
        return

    local_history_store.setdefault(session_id, []).append(payload)


def get_history(session_id: str) -> list[dict]:
    if supabase:
        result = (
            supabase.table("interaction_history")
            .select("session_id,user_text,ai_text,intent,created_at")
            .eq("session_id", session_id)
            .order("created_at", desc=True)
            .limit(30)
            .execute()
        )
        return result.data or []

    return list(reversed(local_history_store.get(session_id, [])))[:30]


@app.get("/session/new")
def create_session():
    return {"status": "success", "session_id": str(uuid4())}


@app.post("/memory/upsert")
def upsert_memory(request: MemoryUpsertRequest):
    try:
        supabase_upsert_memory(request.session_id, request.income, request.savings, request.goals)
        return {"status": "success", "session_id": request.session_id}
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"memory_upsert_failed: {str(error)}")


@app.post("/memory/get")
def fetch_memory(request: SessionRequest):
    try:
        return {"status": "success", "memory": get_memory(request.session_id)}
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"memory_get_failed: {str(error)}")


@app.post("/history/get")
def fetch_history(request: SessionRequest):
    try:
        return {"status": "success", "items": get_history(request.session_id)}
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"history_get_failed: {str(error)}")


def build_router_prompt() -> str:
    return (
        f"{SYSTEM_PROMPT_HI}\n"
        "Aapko intent classification karna hai. Intent categories: calculation, comparison, planning, fraud, general.\n"
        "Hindi, Hinglish, broken Hindi, regional dialect samajhkar normalized meaning pakdo.\n"
        "Agar user input unclear ho to clarification_needed=true karo.\n"
        "Return strict JSON with keys: intent_category, module_intent(fd|compare|plan|fraud|general), "
        "clarification_needed(boolean), clarification_question_hi, data({amount_in_rupees, years, rate, income, savings, goal}), "
        "reply_hi, reply_en.\n"
        "Financial constraints and examples:\n"
        f"{rulebook_text()}"
    )


def safe_hindi_clarification() -> str:
    return "मुझे आपकी बात पूरी तरह समझ नहीं आई। कृपया राशि, समय और लक्ष्य सरल शब्दों में दोबारा बताएं।"

@app.post("/ai/chat")
async def chat_intent(request: ChatRequest):
    """
    Core AI Router. Takes a text string and returns the module routing intent + data state variables.
    """
    try:
        session_id = get_or_create_session_id(request.session_id)
        memory = get_memory(session_id)
        response = client.chat.completions.create(
            model=OPENAI_CHAT_MODEL,
            messages=[
                {"role": "system", "content": build_router_prompt()},
                {
                    "role": "user",
                    "content": (
                        f"User message: {request.message}\n"
                        f"Known user memory: {json.dumps(memory, ensure_ascii=False)}\n"
                        "Need simple Hindi response for rural users."
                    ),
                },
            ],
            response_format={ "type": "json_object" }
        )

        raw_reply = response.choices[0].message.content or "{}"
        parsed = json.loads(raw_reply)
        intent = parsed.get("module_intent", "general")
        add_history(session_id, request.message, parsed.get("reply_hi", ""), intent)

        return {
            "status": "success",
            "session_id": session_id,
            "reply": raw_reply,
            "intent": intent,
            "intent_category": parsed.get("intent_category", "general"),
            "reply_hi": parsed.get("reply_hi", safe_hindi_clarification()),
            "clarification_needed": parsed.get("clarification_needed", False),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/analyze")
async def analyze_state(request: AnalysisRequest):
    """
    Live mathematical reasoning engine.
    """
    try:
        response = client.chat.completions.create(
            model=OPENAI_CHAT_MODEL,
            messages=[
                {"role": "system", "content": "You are Crediq's Financial AI. The user is actively moving sliders on our UI. Read their exact math context and provide a highly compact 2-sentence insight. E.g. 'By keeping ₹X at Y%, you generate ₹Z in pure interest. Standard Indian inflation is 6%, making this a solid safe-haven.' Use Rupees ₹ and Lakhs/Crores if applicable."},
                {"role": "user", "content": f"Context: Principal=₹{request.amount}, Years={request.years}, Rate={request.rate}%, Projected Maturity=₹{request.maturity}, Tool Active={request.intent}. Give me a 2 sentence dynamic insight."}
            ]
        )
        return {
            "status": "success",
            "insight": response.choices[0].message.content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/voice/stt")
async def voice_stt(audio: UploadFile = File(...)):
    """
    Production Speech-to-Text endpoint using external provider.
    """
    try:
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Audio payload is empty")

        in_memory_audio = BytesIO(audio_bytes)
        in_memory_audio.name = audio.filename or "voice.webm"

        transcript = client.audio.transcriptions.create(
            model=OPENAI_STT_MODEL,
            file=in_memory_audio,
            response_format="json",
            prompt="Hindi, Hinglish, Indian regional dialect, financial planning conversation.",
        )

        text = getattr(transcript, "text", "").strip()
        if not text:
            raise HTTPException(status_code=422, detail="Could not transcribe audio")

        return {
            "status": "success",
            "transcript": text,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"stt_failed: {str(e)}")


@app.post("/voice/intent")
async def voice_intent(request: VoiceIntentRequest):
    """
    One-shot voice orchestration endpoint.
    Returns language, command intent, extracted financial values, and spoken response.
    """
    try:
        session_id = get_or_create_session_id(request.session_id)
        memory = get_memory(session_id)
        response = client.chat.completions.create(
            model=OPENAI_CHAT_MODEL,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"{SYSTEM_PROMPT_HI}\n"
                        "You are Crediq voice orchestrator. Understand Hindi, Hinglish, broken Hindi, mixed dialects. "
                        "If user input is unclear ask a short clarification question in Hindi. "
                        "Output valid JSON only with keys: "
                        "language (ISO code e.g. hi, en, mr, bho), intent_category (calculation|comparison|planning|fraud|general), "
                        "intent (fd|compare|plan|fraud|navigate|general), "
                        "command (next_section|open_compare|low_risk|best_option|open_dashboard|none), "
                        "data ({amount_in_rupees:number|null, years:number|null, rate:number|null, income:number|null, savings:number|null, goal:string|null}), "
                        "clarification_needed(boolean), clarification_question_hi(string), spoken_response (short, guided), ui_response (short, guided). "
                        "Detect the dialect/language automatically (like Marathi, UP slang, Hindi) and respond in the SAME dialect/language. "
                        f"Use these rules and data: {rulebook_text()}"
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"User transcript: {request.transcript}. "
                        f"Current UI language: {request.ui_language}. "
                        f"Known memory: {json.dumps(memory, ensure_ascii=False)}. "
                        "Context: India retail investors, keep advice simple and trustworthy."
                    ),
                },
            ],
        )

        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)

        lang = parsed.get("language", request.ui_language)

        return {
            "status": "success",
            "session_id": session_id,
            "language": lang,
            "intent": parsed.get("intent", "general"),
            "intent_category": parsed.get("intent_category", "general"),
            "command": parsed.get("command", "none"),
            "data": parsed.get("data", {}),
            "clarification_needed": parsed.get("clarification_needed", False),
            "clarification_question_hi": parsed.get("clarification_question_hi", safe_hindi_clarification()),
            "spoken_response": parsed.get(
                "spoken_response",
                "I heard you. Updating your plan now." if lang == "en" else "मैंने आपकी बात सुनी। अभी प्लान अपडेट कर रहा हूं।",
            ),
            "ui_response": parsed.get(
                "ui_response",
                "Updated." if lang == "en" else "अपडेट किया गया।",
            ),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"voice_intent_failed: {str(e)}")


@app.post("/voice/orchestrate")
async def voice_orchestrate(request: VoiceIntentRequest):
    """
    Alias for production orchestration flow.
    Keeps frontend contract explicit while reusing intent engine.
    """
    result = await voice_intent(request)

    data = result.get("data") or {}
    try:
        if data.get("income") is not None or data.get("savings") is not None or data.get("goal"):
            goals = [data["goal"]] if data.get("goal") else None
            supabase_upsert_memory(result["session_id"], data.get("income"), data.get("savings"), goals)

        add_history(
            result["session_id"],
            request.transcript,
            result.get("spoken_response", ""),
            result.get("intent", "general"),
        )
    except Exception:
        # Non-blocking persistence keeps voice UX smooth even on temporary DB failures.
        pass

    return result


@app.post("/voice/tts")
async def voice_tts(request: VoiceTTSRequest):
    """
    Text-to-Speech endpoint using external provider.
    """
    try:
        language = "hi" if request.language == "hi" else "en"

        if ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID_HI and language == "hi":
            eleven_response = requests.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID_HI}/stream",
                headers={
                    "xi-api-key": ELEVENLABS_API_KEY,
                    "Content-Type": "application/json",
                    "Accept": "audio/mpeg",
                },
                json={
                    "text": request.text,
                    "model_id": "eleven_multilingual_v2",
                    "voice_settings": {
                        "stability": 0.45,
                        "similarity_boost": 0.75,
                        "style": 0.2,
                        "use_speaker_boost": True,
                    },
                },
                timeout=30,
            )

            if not eleven_response.ok:
                raise HTTPException(status_code=502, detail=f"elevenlabs_failed: {eleven_response.text}")

            return StreamingResponse(BytesIO(eleven_response.content), media_type="audio/mpeg")

        voice = "alloy" if language == "en" else "sage"
        openai_tts = client.audio.speech.create(
            model=OPENAI_TTS_MODEL,
            voice=voice,
            input=request.text,
            format="mp3",
        )

        return StreamingResponse(BytesIO(openai_tts.read()), media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"tts_failed: {str(e)}")

