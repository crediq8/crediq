from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from io import BytesIO
import json
import os
from dotenv import load_dotenv

# Load Environment Variables from .env file
load_dotenv()


def parse_origins() -> list[str]:
    origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:3000")
    return [origin.strip() for origin in origins.split(",") if origin.strip()]


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")
OPENAI_STT_MODEL = os.getenv("OPENAI_STT_MODEL", "gpt-4o-mini-transcribe")
OPENAI_TTS_MODEL = os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is required")

client = OpenAI(api_key=OPENAI_API_KEY)

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

class AnalysisRequest(BaseModel):
    amount: float
    years: float
    rate: float
    maturity: float
    intent: str


class VoiceIntentRequest(BaseModel):
    transcript: str
    ui_language: str = "en"


class VoiceTTSRequest(BaseModel):
    text: str
    language: str = "en"

@app.get("/")
def health_check():
    return {
        "status": "systems online",
        "version": "2.0.0",
        "origins": parse_origins(),
        "providers": {
            "chat": "openai",
            "stt": "openai",
            "tts": "openai",
        },
    }


def lang_name(code: str) -> str:
    return "Hindi" if code == "hi" else "English"

@app.post("/ai/chat")
async def chat_intent(request: ChatRequest):
    """
    Core AI Router. Takes a text string and returns the module routing intent + data state variables.
    """
    try:
        response = client.chat.completions.create(
            model=OPENAI_CHAT_MODEL,
            messages=[
                {"role": "system", "content": "You are the Crediq AI Core, handling financial platform routing tailored for the Indian market. Analyze the user prompt. Classify 'intent' as: 'fd', 'compare', 'plan', 'fraud', or 'general'. Extract numerical values like amount (convert Lakhs/Crores to standard Rupees/numbers), years/months, or interest rate if provided into a 'data' dictionary. Return a JSON response exactly: {\"intent\": \"str\", \"data\": {\"amount_in_rupees\": number|null, \"years\": number|null, \"rate\": number|null}}"},
                {"role": "user", "content": f"{request.message} (Context: Indian rupees, FD rates like SBI/HDFC)"}
            ],
            response_format={ "type": "json_object" }
        )

        return {
            "status": "success",
            "reply": response.choices[0].message.content,
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
        response = client.chat.completions.create(
            model=OPENAI_CHAT_MODEL,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Crediq voice orchestrator. Output valid JSON only with keys: "
                        "language (en|hi), intent (fd|compare|plan|fraud|navigate|general), "
                        "command (next_section|open_compare|low_risk|best_option|open_dashboard|none), "
                        "data ({amount_in_rupees:number|null, years:number|null, rate:number|null}), "
                        "spoken_response (short, guided), ui_response (short, guided). "
                        "Detect Hindi/English/Hinglish automatically and adapt language in spoken_response and ui_response."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"User transcript: {request.transcript}. "
                        f"Current UI language: {request.ui_language}. "
                        "Context: India retail investors, keep advice simple and trustworthy."
                    ),
                },
            ],
        )

        raw = response.choices[0].message.content or "{}"
        parsed = json.loads(raw)

        lang = parsed.get("language", "en")
        if lang not in ["en", "hi"]:
            lang = request.ui_language if request.ui_language in ["en", "hi"] else "en"

        return {
            "status": "success",
            "language": lang,
            "intent": parsed.get("intent", "general"),
            "command": parsed.get("command", "none"),
            "data": parsed.get("data", {}),
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
    return await voice_intent(request)


@app.post("/voice/tts")
async def voice_tts(request: VoiceTTSRequest):
    """
    Text-to-Speech endpoint using external provider.
    """
    try:
        language = "hi" if request.language == "hi" else "en"
        voice = "alloy" if language == "en" else "sage"
        response = client.audio.speech.create(
            model=OPENAI_TTS_MODEL,
            voice=voice,
            input=request.text,
            format="mp3",
        )

        audio_bytes = response.read()
        return StreamingResponse(BytesIO(audio_bytes), media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"tts_failed: {str(e)}")

