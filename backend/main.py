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
    allow_origins=["http://localhost:3001", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

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
                {"role": "system", "content": "You are the Crediq AI Core, handling financial platform routing. Analyze the user prompt. Classify 'intent' as either: 'fd', 'compare', 'plan', 'fraud', or 'general'. Extract any numerical values like amount, years, or rate if provided into a 'data' dictionary as numbers. Return a JSON response exactly: {\"intent\": \"str\", \"data\": {\"amount\": number|null, \"years\": number|null}}"},
                {"role": "user", "content": request.message}
            ],
            response_format={ "type": "json_object" }
        )
        
        return {
            "status": "success",
            "reply": response.choices[0].message.content,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
