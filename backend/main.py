from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv

# Load Environment Variables from .env file
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="Crediq Intelligence API")

# Setup CORS to allow Next.js frontend to communicate with FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
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

@app.get("/")
def health_check():
    return {"status": "systems online", "version": "1.0.0"}

@app.post("/ai/chat")
async def chat_intent(request: ChatRequest):
    """
    Core AI Router. Takes a text string and returns the module routing intent + data state variables.
    """
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
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
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
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

