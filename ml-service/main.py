import os
import json
import re
import logging
from typing import Dict, Any, List
from datetime import datetime, timezone

from pymongo import MongoClient
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
import httpx

# ─── Load Environment Variables ───────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    print("✅ Gemini Key Loaded:", GEMINI_API_KEY[:10])
else:
    print("❌ GEMINI_API_KEY NOT FOUND")

# ─── MongoDB Setup ────────────────────────────────────────────────────────────

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError("❌ MONGO_URI not found in .env")

client = MongoClient(MONGO_URI)
db = client["startupDB"]

predictions_collection = db["predictions"]
analysis_collection = db["analysis"]

print("✅ MongoDB connected")

# ─── Config ───────────────────────────────────────────────────────────────────

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

logging.basicConfig(level=logging.INFO)

# ─── Load ML Model ────────────────────────────────────────────────────────────

try:
    model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
    logging.info("ML model loaded successfully.")
except Exception as e:
    raise RuntimeError(f"Model failed to load: {e}")

# Pre-compute feature importances from the model (works for tree-based & linear models)
try:
    if hasattr(model, "feature_importances_"):
        _raw_importance = model.feature_importances_
    elif hasattr(model, "coef_"):
        _raw_importance = np.abs(model.coef_[0])
    else:
        _raw_importance = np.array([0.25, 0.25, 0.25, 0.25])
    _importance_sum = _raw_importance.sum() or 1.0
    FEATURE_NAMES = ["funding", "teamSize", "marketSize", "founderExperience"]
    FEATURE_IMPORTANCE: Dict[str, float] = {
        name: round(float(val / _importance_sum), 4)
        for name, val in zip(FEATURE_NAMES, _raw_importance)
    }
except Exception as fi_err:
    logging.warning("Could not compute feature importances: %s", fi_err)
    FEATURE_IMPORTANCE = {"funding": 0.40, "teamSize": 0.20, "marketSize": 0.25, "founderExperience": 0.15}

# ─── App Setup ────────────────────────────────────────────────────────────────

app = FastAPI(title="Startup Predictor + AI Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request / Response Models ────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    funding: float = Field(gt=0)
    teamSize: int = Field(gt=0, le=100)
    marketSize: float = Field(gt=0)
    founderExperience: int = Field(ge=0, le=40)

class PredictionResponse(BaseModel):
    successProbability: float
    riskLevel: str
    featureImportance: Dict[str, float]
    breakdown: Dict[str, int]
    report: Dict[str, Any]

class AnalyzeRequest(BaseModel):
    ideaName: str = Field(min_length=1, max_length=200)
    idea: str = Field(min_length=10, max_length=5000)
    industry: str = Field(default="Technology")
    targetMarket: str = Field(default="General")

class AnalyzeResponse(BaseModel):
    swot: Dict[str, List[str]]
    marketSize: Dict[str, str]
    competitors: List[Dict[str, str]]
    viabilityScore: int
    businessBrief: str
    recommendation: str

# ─── Helper: Investor Report ─────────────────────────────────────────────────

def generate_investor_report(
    success_probability: float,
    risk_level: str,
    funding_score: int,
    team_score: int,
    market_score: int,
    experience_score: int,
) -> Dict[str, Any]:
    strengths, risks = [], []

    if funding_score > 70: strengths.append("Strong funding position")
    if team_score > 70: strengths.append("Well-sized, capable team")
    if market_score > 70: strengths.append("Large market opportunity")
    if experience_score > 70: strengths.append("Experienced founders")

    if funding_score < 40: risks.append("Low funding")
    if team_score < 40: risks.append("Small team")
    if market_score < 40: risks.append("Limited market")
    if experience_score < 40: risks.append("Low experience")

    if not strengths: strengths.append("Balanced metrics")
    if not risks: risks.append("No major risks")

    if success_probability > 75:
        rec = "Strong investment opportunity."
    elif success_probability > 60:
        rec = "Moderately promising."
    elif success_probability > 45:
        rec = "Needs improvement."
    else:
        rec = "High risk."

    return {"strengths": strengths, "risks": risks, "recommendation": rec}

# ─── Gemini Helpers ──────────────────────────────────────────────────────────

def clean_json_text(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()

def build_fallback(name: str) -> dict:
    return {
        "swot": {
            "strengths": ["Scalable idea"],
            "weaknesses": ["Early stage"],
            "opportunities": ["Market growth"],
            "threats": ["Competition"],
        },
        "marketSize": {
            "tam": "$50B",
            "sam": "$5B",
            "som": "$50M",
        },
        "competitors": [],
        "viabilityScore": 6,
        "businessBrief": f"{name} has potential.",
        "recommendation": "Validate with MVP.",
    }

async def call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Missing API key")

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7},
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json=payload,
        )

        if resp.status_code == 429:
            raise HTTPException(status_code=429, detail="Rate limit hit")

        resp.raise_for_status()
        data = resp.json()

    return data["candidates"][0]["content"]["parts"][0]["text"]

# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "API running 🚀"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "gemini_configured": bool(GEMINI_API_KEY),
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest):
    features = np.array([[req.funding, req.teamSize, req.marketSize, req.founderExperience]])

    prob = model.predict_proba(features)[0][1]
    score = round(prob * 85 + 10, 2)

    risk = "low" if score > 70 else "medium" if score > 40 else "high"

    breakdown = {
        "fundingScore": min(int(req.funding / 5_000_000 * 100), 100),
        "teamScore": min(int(req.teamSize / 15 * 100), 100),
        "marketScore": min(int(req.marketSize / 500_000_000 * 100), 100),
        "experienceScore": min(int(req.founderExperience / 10 * 100), 100),
    }

    report = generate_investor_report(score, risk, *breakdown.values())

    # Persisting history should not break core prediction response.
    try:
        predictions_collection.insert_one({
            "type": "prediction",
            "successProbability": score,
            "riskLevel": risk,
            "funding": req.funding,
            "teamSize": req.teamSize,
            "marketSize": req.marketSize,
            "founderExperience": req.founderExperience,
            "request": req.dict(),
            "response": {
                "successProbability": score,
                "riskLevel": risk,
                "featureImportance": {},
                "breakdown": breakdown,
                "report": report,
            },
            "createdAt": datetime.now(timezone.utc),
        })
    except Exception as db_error:
        logging.exception("Failed to save prediction to MongoDB: %s", db_error)

    return {
        "successProbability": score,
        "riskLevel": risk,
        "featureImportance": FEATURE_IMPORTANCE,
        "breakdown": breakdown,
        "report": report,
    }

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    prompt = f"""You are a startup business analyst. Analyze the startup idea below and return ONLY a valid JSON object with no markdown, no code fences, no explanation — just raw JSON.

Startup Name: {req.ideaName}
Industry: {req.industry}
Target Market: {req.targetMarket}
Idea Description: {req.idea}

Return this exact JSON schema:
{{
  "swot": {{
    "strengths": ["string", ...],
    "weaknesses": ["string", ...],
    "opportunities": ["string", ...],
    "threats": ["string", ...]
  }},
  "marketSize": {{
    "tam": "e.g. $50B",
    "sam": "e.g. $5B",
    "som": "e.g. $500M"
  }},
  "competitors": [
    {{"name": "string", "description": "string", "differentiator": "string"}},
    {{"name": "string", "description": "string", "differentiator": "string"}},
    {{"name": "string", "description": "string", "differentiator": "string"}}
  ],
  "viabilityScore": 7,
  "businessBrief": "2-3 sentence executive summary",
  "recommendation": "1-2 sentence investor recommendation"
}}
"""

    try:
        raw = await call_gemini(prompt)
        data = json.loads(clean_json_text(raw))

        # Persisting history should not break analysis response.
        try:
            analysis_collection.insert_one({
                "type": "analysis",
                "ideaName": req.ideaName,
                "industry": req.industry,
                "targetMarket": req.targetMarket,
                "viabilityScore": data.get("viabilityScore"),
                "recommendation": data.get("recommendation"),
                "request": req.dict(),
                "response": data,
                "createdAt": datetime.now(timezone.utc),
            })
        except Exception as db_error:
            logging.exception("Failed to save analysis to MongoDB: %s", db_error)

        return data
    except Exception:
        fallback = build_fallback(req.ideaName)
        try:
            analysis_collection.insert_one({
                "type": "analysis",
                "ideaName": req.ideaName,
                "industry": req.industry,
                "targetMarket": req.targetMarket,
                "viabilityScore": fallback.get("viabilityScore"),
                "recommendation": fallback.get("recommendation"),
                "request": req.dict(),
                "response": fallback,
                "createdAt": datetime.now(timezone.utc),
            })
        except Exception as db_error:
            logging.exception("Failed to save fallback analysis to MongoDB: %s", db_error)
        return fallback

@app.get("/predictions")
def get_predictions(limit: int = 20):
    safe_limit = max(1, min(limit, 100))
    cursor = predictions_collection.find({}).sort("createdAt", -1).limit(safe_limit)
    data = []
    for doc in cursor:
        response_data = doc.get("response") or doc.get("output", {})
        request_data = doc.get("request") or doc.get("input", {})
        data.append({
            "_id": str(doc.get("_id")),
            "type": doc.get("type", "prediction"),
            "successProbability": doc.get("successProbability", response_data.get("successProbability")),
            "riskLevel": doc.get("riskLevel", response_data.get("riskLevel")),
            "funding": doc.get("funding", request_data.get("funding")),
            "teamSize": doc.get("teamSize", request_data.get("teamSize")),
            "marketSize": doc.get("marketSize", request_data.get("marketSize")),
            "founderExperience": doc.get("founderExperience", request_data.get("founderExperience")),
            "request": request_data,
            "response": response_data,
            "createdAt": doc.get("createdAt"),
        })
    return data

@app.get("/analyses")
def get_analyses(limit: int = 20):
    safe_limit = max(1, min(limit, 100))
    cursor = analysis_collection.find({}).sort("createdAt", -1).limit(safe_limit)
    data = []
    for doc in cursor:
        response_data = doc.get("response") or doc.get("output", {})
        request_data = doc.get("request") or doc.get("input", {})
        data.append({
            "_id": str(doc.get("_id")),
            "type": doc.get("type", "analysis"),
            "ideaName": doc.get("ideaName", request_data.get("ideaName")),
            "industry": doc.get("industry", request_data.get("industry")),
            "targetMarket": doc.get("targetMarket", request_data.get("targetMarket")),
            "viabilityScore": doc.get("viabilityScore", response_data.get("viabilityScore")),
            "recommendation": doc.get("recommendation", response_data.get("recommendation")),
            "request": request_data,
            "response": response_data,
            "createdAt": doc.get("createdAt"),
        })
    return data

@app.get("/test-gemini")
async def test():
    try:
        return {"response": await call_gemini("Test AI")}
    except HTTPException as exc:
        raise exc
    except Exception as exc:
        logging.exception("Gemini test endpoint failed: %s", exc)
        raise HTTPException(status_code=503, detail="Gemini unavailable")


# ═══════════════════════════════════════════════════════════════════════════════
# INVESTOR ENDPOINTS — SQLite persistence
# ═══════════════════════════════════════════════════════════════════════════════

import sqlite3
import datetime
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "startup_db.sqlite")

# ─── Startup seed data (mirrors mock-data.ts) ─────────────────────────────────

SEED_STARTUPS = [
    {"id": "ent-001", "name": "NexusAI", "founder": "Sarah Jenkins", "photo_url": "https://i.pravatar.cc/150?u=sarahj", "industry": "AI / SaaS", "stage": "Seed", "pitch": "Automating B2B sales development using LLMs.", "market_size": "$12B SAM", "traction": "$15k MRR", "team_size": 6, "revenue_status": "Post-revenue", "monthly_growth": "22%", "score": 87, "risk_level": "Medium", "ai_recommendation": "High probability of Series A within 12 months. Recommend introductory meeting.", "verified": True, "likes": 0},
    {"id": "ent-002", "name": "MediSync", "founder": "David Kim", "photo_url": "https://i.pravatar.cc/150?u=davidk", "industry": "HealthTech", "stage": "Pre-seed", "pitch": "Unified patient data platform connecting local clinics.", "market_size": "$5B SAM", "traction": "12 pilot clinics", "team_size": 3, "revenue_status": "Pre-revenue", "monthly_growth": "N/A", "score": 65, "risk_level": "High", "ai_recommendation": "Monitor for 3 months before committing capital.", "verified": True, "likes": 0},
    {"id": "ent-003", "name": "FinPulse", "founder": "Aarav Patel", "photo_url": "https://i.pravatar.cc/150?u=aarav", "industry": "FinTech", "stage": "Series A", "pitch": "API first payment gateway for Southeast Asia.", "market_size": "$25B SAM", "traction": "$150k MRR", "team_size": 24, "revenue_status": "Post-revenue", "monthly_growth": "15%", "score": 92, "risk_level": "Low", "ai_recommendation": "Strong traction in an expanding market. Ready for Series A scaling.", "verified": True, "likes": 3},
    {"id": "ent-004", "name": "LearnLoop", "founder": "Chloe Smith", "photo_url": "https://i.pravatar.cc/150?u=chloe", "industry": "EdTech", "stage": "Seed", "pitch": "AI tutor that adapts to neurodivergent learning patterns.", "market_size": "$8B SAM", "traction": "5k active users", "team_size": 8, "revenue_status": "Post-revenue", "monthly_growth": "30%", "score": 78, "risk_level": "Medium", "ai_recommendation": "Good viral user growth, needs clearer monetization strategy.", "verified": True, "likes": 1},
    {"id": "ent-005", "name": "AgroSense", "founder": "Luis Garcia", "photo_url": "https://i.pravatar.cc/150?u=luis", "industry": "AgriTech", "stage": "Pre-seed", "pitch": "IoT soil monitoring for smallholder farmers.", "market_size": "$3B SAM", "traction": "50 farms", "team_size": 4, "revenue_status": "Pre-revenue", "monthly_growth": "10%", "score": 60, "risk_level": "High", "ai_recommendation": "Hardware dependency increases risk. Proceed with caution.", "verified": False, "likes": 0},
    {"id": "ent-006", "name": "CreatorKit", "founder": "Emma Watson", "photo_url": "https://i.pravatar.cc/150?u=emma", "industry": "FinTech", "stage": "Seed", "pitch": "All-in-one financial dashboard for YouTube/TikTok creators.", "market_size": "$15B SAM", "traction": "$20k MRR", "team_size": 5, "revenue_status": "Post-revenue", "monthly_growth": "25%", "score": 85, "risk_level": "Low", "ai_recommendation": "Highly engaged niche. Solid unit economics.", "verified": True, "likes": 5},
    {"id": "ent-007", "name": "Polymer3D", "founder": "Hiroshi Tanaka", "photo_url": "https://i.pravatar.cc/150?u=hiroshi", "industry": "DeepTech", "stage": "Series A", "pitch": "Next-gen 3D printing resin that cures 10x faster.", "market_size": "$10B SAM", "traction": "$80k MRR", "team_size": 18, "revenue_status": "Post-revenue", "monthly_growth": "12%", "score": 88, "risk_level": "Medium", "ai_recommendation": "Defensible IP and strong B2B contracts. Solid bet.", "verified": True, "likes": 2},
    {"id": "ent-008", "name": "LogiChain", "founder": "Aisha Mohammed", "photo_url": "https://i.pravatar.cc/150?u=aisha", "industry": "Logistics", "stage": "Seed", "pitch": "Blockchain verified supply chain for halal products.", "market_size": "$20B SAM", "traction": "$8k MRR", "team_size": 7, "revenue_status": "Post-revenue", "monthly_growth": "18%", "score": 72, "risk_level": "Medium", "ai_recommendation": "Good early adoption but faces regulatory hurdles.", "verified": True, "likes": 1},
    {"id": "ent-009", "name": "VR-Therapy", "founder": "Carlos Mateo", "photo_url": "https://i.pravatar.cc/150?u=carlos", "industry": "HealthTech", "stage": "Pre-seed", "pitch": "VR exposure therapy for anxiety disorders.", "market_size": "$4B SAM", "traction": "2 clinics", "team_size": 3, "revenue_status": "Pre-revenue", "monthly_growth": "0%", "score": 68, "risk_level": "High", "ai_recommendation": "High risk due to clinical trials. Long time to market.", "verified": False, "likes": 0},
    {"id": "ent-010", "name": "CodeCompanion", "founder": "Jessica Fox", "photo_url": "https://i.pravatar.cc/150?u=jessica", "industry": "DevTools", "stage": "Seed", "pitch": "AI rubber duck debugging tool for junior devs.", "market_size": "$6B SAM", "traction": "$30k MRR", "team_size": 4, "revenue_status": "Post-revenue", "monthly_growth": "40%", "score": 90, "risk_level": "Low", "ai_recommendation": "Exceptional organic growth loop. Immediate investment target.", "verified": True, "likes": 8},
    {"id": "ent-011", "name": "StreamSec", "founder": "Tyler Brooks", "photo_url": "https://i.pravatar.cc/150?u=tyler", "industry": "Cybersecurity", "stage": "Series A", "pitch": "Real-time threat detection for live video streams.", "market_size": "$18B SAM", "traction": "$110k MRR", "team_size": 30, "revenue_status": "Post-revenue", "monthly_growth": "14%", "score": 94, "risk_level": "Low", "ai_recommendation": "Enterprise dominance in niche. Very strong metrics.", "verified": True, "likes": 6},
    {"id": "ent-012", "name": "EcoPack", "founder": "Nadia Kozlov", "photo_url": "https://i.pravatar.cc/150?u=nadia", "industry": "ClimateTech", "stage": "Seed", "pitch": "Biodegradable mushroom-based packaging for D2C brands.", "market_size": "$22B SAM", "traction": "$12k MRR", "team_size": 9, "revenue_status": "Post-revenue", "monthly_growth": "20%", "score": 81, "risk_level": "Medium", "ai_recommendation": "Strong ESG narrative and early B2B pilots are promising.", "verified": True, "likes": 4},
    {"id": "ent-013", "name": "RentRadar", "founder": "Jordan Lee", "photo_url": "https://i.pravatar.cc/150?u=jordan", "industry": "PropTech", "stage": "Pre-seed", "pitch": "Aggregating unlisted rental properties using AI.", "market_size": "$14B SAM", "traction": "10k waitlist", "team_size": 2, "revenue_status": "Pre-revenue", "monthly_growth": "N/A", "score": 70, "risk_level": "Medium", "ai_recommendation": "Good consumer demand signal but scraping viability is questionable.", "verified": False, "likes": 0},
    {"id": "ent-014", "name": "PetWell", "founder": "Mia Santos", "photo_url": "https://i.pravatar.cc/150?u=mia", "industry": "HealthTech", "stage": "Seed", "pitch": "Subscription telehealth specifically for exotic pets.", "market_size": "$2B SAM", "traction": "$5k MRR", "team_size": 3, "revenue_status": "Post-revenue", "monthly_growth": "15%", "score": 64, "risk_level": "Medium", "ai_recommendation": "Niche is too small for VC scale. Better lifestyle business.", "verified": True, "likes": 0},
    {"id": "ent-015", "name": "QuantumDB", "founder": "Wei Chen", "photo_url": "https://i.pravatar.cc/150?u=weichen", "industry": "DeepTech", "stage": "Series B", "pitch": "Database optimized for quantum computing environments.", "market_size": "$40B SAM", "traction": "$500k MRR", "team_size": 85, "revenue_status": "Post-revenue", "monthly_growth": "10%", "score": 96, "risk_level": "Low", "ai_recommendation": "Category defining technology. Strong strategic investment.", "verified": True, "likes": 12},
    {"id": "ent-016", "name": "ShiftDesk", "founder": "Lucas Müller", "photo_url": "https://i.pravatar.cc/150?u=lucas", "industry": "SaaS", "stage": "Seed", "pitch": "Workforce management for deskless shift workers.", "market_size": "$9B SAM", "traction": "$22k MRR", "team_size": 7, "revenue_status": "Post-revenue", "monthly_growth": "28%", "score": 86, "risk_level": "Low", "ai_recommendation": "High retention rates. Clear path to Series A.", "verified": True, "likes": 3},
    {"id": "ent-017", "name": "PaySwap", "founder": "Amina Diallo", "photo_url": "https://i.pravatar.cc/150?u=amina", "industry": "FinTech", "stage": "Pre-seed", "pitch": "Cross-border B2B payments optimized for African corridors.", "market_size": "$30B SAM", "traction": "$2k MRR", "team_size": 4, "revenue_status": "Post-revenue", "monthly_growth": "50%", "score": 75, "risk_level": "Medium", "ai_recommendation": "Massive market but high regulatory execution risk.", "verified": False, "likes": 1},
    {"id": "ent-018", "name": "AutoInspect", "founder": "Samir Gupta", "photo_url": "https://i.pravatar.cc/150?u=samir", "industry": "AI", "stage": "Series A", "pitch": "Computer vision for manufacturing defect detection.", "market_size": "$12B SAM", "traction": "$180k MRR", "team_size": 22, "revenue_status": "Post-revenue", "monthly_growth": "8%", "score": 91, "risk_level": "Low", "ai_recommendation": "Sticky enterprise contracts. Solid revenue base.", "verified": True, "likes": 7},
    {"id": "ent-019", "name": "GlowUp", "founder": "Olivia Thomas", "photo_url": "https://i.pravatar.cc/150?u=oliviat", "industry": "D2C", "stage": "Seed", "pitch": "AI driven personalized skincare formulation.", "market_size": "$16B SAM", "traction": "$45k MRR", "team_size": 10, "revenue_status": "Post-revenue", "monthly_growth": "20%", "score": 83, "risk_level": "Medium", "ai_recommendation": "CAC slightly high, but LTV makes unit economics work.", "verified": True, "likes": 5},
    {"id": "ent-020", "name": "ChainGov", "founder": "Ben Horowitz II", "photo_url": "https://i.pravatar.cc/150?u=ben", "industry": "Crypto", "stage": "Seed", "pitch": "DAO governance tooling for traditional corporations.", "market_size": "$5B SAM", "traction": "$0 MRR", "team_size": 5, "revenue_status": "Pre-revenue", "monthly_growth": "0%", "score": 55, "risk_level": "High", "ai_recommendation": "Market timing seems wrong. Needs strong pivot.", "verified": True, "likes": 0},
    {"id": "ent-021", "name": "RoboChef", "founder": "Yuki Sato", "photo_url": "https://i.pravatar.cc/150?u=yuki", "industry": "FoodTech", "stage": "Series A", "pitch": "Automated modular kitchens for quick-service restaurants.", "market_size": "$25B SAM", "traction": "$90k MRR", "team_size": 40, "revenue_status": "Post-revenue", "monthly_growth": "15%", "score": 89, "risk_level": "Medium", "ai_recommendation": "Capital intensive but solves a massive labor shortage issue.", "verified": True, "likes": 9},
]

# ─── DB Init ──────────────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_investor_db():
    conn = get_db()
    c = conn.cursor()

    # Drop existing startups to recreate with new schema if developing
    c.execute("DROP TABLE IF EXISTS startups")

    c.execute("""
        CREATE TABLE IF NOT EXISTS startups (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            founder TEXT,
            photo_url TEXT,
            industry TEXT,
            stage TEXT,
            pitch TEXT,
            market_size TEXT,
            traction TEXT,
            team_size INTEGER,
            revenue_status TEXT,
            monthly_growth TEXT,
            score INTEGER,
            risk_level TEXT,
            ai_recommendation TEXT,
            verified INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            confidence_score INTEGER,
            burn_rate TEXT,
            founder_experience TEXT,
            previous_startups INTEGER,
            credibility_score INTEGER,
            is_trending INTEGER DEFAULT 0,
            strengths TEXT,
            red_flags TEXT,
            why_score_reasons TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS investor_saves (
            investor_id TEXT NOT NULL,
            startup_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (investor_id, startup_id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS investor_likes (
            investor_id TEXT NOT NULL,
            startup_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (investor_id, startup_id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS investor_connects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            investor_id TEXT NOT NULL,
            startup_id TEXT NOT NULL,
            message TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS investor_pipeline (
            investor_id TEXT NOT NULL,
            startup_id TEXT NOT NULL,
            stage TEXT NOT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (investor_id, startup_id)
        )
    """)

    # Seed startups if empty
    existing = c.execute("SELECT COUNT(*) FROM startups").fetchone()[0]
    if existing == 0:
        for s in SEED_STARTUPS:
            c.execute("""
                INSERT OR IGNORE INTO startups
                (id, name, founder, photo_url, industry, stage, pitch,
                 market_size, traction, team_size, revenue_status,
                 monthly_growth, score, risk_level, ai_recommendation, verified, likes,
                 confidence_score, burn_rate, founder_experience, previous_startups,
                 credibility_score, is_trending, strengths, red_flags, why_score_reasons)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                s["id"], s["name"], s["founder"], s["photo_url"], s["industry"],
                s["stage"], s["pitch"], s["market_size"], s["traction"],
                s["team_size"], s["revenue_status"], s["monthly_growth"],
                s["score"], s["risk_level"], s["ai_recommendation"],
                1 if s.get("verified") else 0, s.get("likes", 0),
                s.get("confidence_score", 85), s.get("burn_rate", "$50k/mo"),
                s.get("founder_experience", "First Time Founder"), s.get("previous_startups", 0),
                s.get("credibility_score", 80), s.get("is_trending", 0),
                s.get("strengths", ""), s.get("red_flags", ""), s.get("why_score_reasons", "")
            ))

    conn.commit()
    conn.close()
    logging.info("Investor DB initialized.")

# Run init on startup
init_investor_db()

# ─── Pydantic models ──────────────────────────────────────────────────────────

class InvestorActionRequest(BaseModel):
    investor_id: str
    startup_id: str

class ConnectRequest(BaseModel):
    investor_id: str
    startup_id: str
    message: Optional[str] = None

class PipelineStageRequest(BaseModel):
    investor_id: str
    startup_id: str
    stage: str

# ─── /startups ────────────────────────────────────────────────────────────────

@app.get("/startups")
def get_startups(
    stage: Optional[str] = None,
    industry: Optional[str] = None,
    min_score: Optional[int] = None,
    risk: Optional[str] = None,
    search: Optional[str] = None,
    investor_id: Optional[str] = None,
):
    conn = get_db()
    try:
        query = "SELECT * FROM startups WHERE 1=1"
        params: list = []

        if stage:
            query += " AND stage = ?"
            params.append(stage)
        if industry:
            query += " AND industry LIKE ?"
            params.append(f"%{industry}%")
        if min_score is not None:
            query += " AND score >= ?"
            params.append(min_score)
        if risk:
            query += " AND risk_level = ?"
            params.append(risk)
        if search:
            query += " AND (name LIKE ? OR pitch LIKE ? OR founder LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

        query += " ORDER BY score DESC"
        rows = conn.execute(query, params).fetchall()

        # Get saved + liked + connected + pipeline for this investor
        saved_ids: set = set()
        liked_ids: set = set()
        connected_ids: set = set()
        pipeline_stages: Dict[str, str] = {}
        if investor_id:
            for row in conn.execute("SELECT startup_id FROM investor_saves WHERE investor_id=?", (investor_id,)):
                saved_ids.add(row["startup_id"])
            for row in conn.execute("SELECT startup_id FROM investor_likes WHERE investor_id=?", (investor_id,)):
                liked_ids.add(row["startup_id"])
            for row in conn.execute("SELECT DISTINCT startup_id FROM investor_connects WHERE investor_id=?", (investor_id,)):
                connected_ids.add(row["startup_id"])
            for row in conn.execute("SELECT startup_id, stage FROM investor_pipeline WHERE investor_id=?", (investor_id,)):
                pipeline_stages[row["startup_id"]] = row["stage"]

        result = []
        for row in rows:
            d = dict(row)
            d["verified"] = bool(d["verified"])
            d["is_trending"] = bool(d.get("is_trending", 0))
            d["is_saved"] = d["id"] in saved_ids
            d["is_liked"] = d["id"] in liked_ids
            d["is_connected"] = d["id"] in connected_ids
            d["pipeline_stage"] = pipeline_stages.get(d["id"])
            result.append(d)

        return result
    finally:
        conn.close()

# ─── /investor/save ───────────────────────────────────────────────────────────

@app.post("/investor/save")
def toggle_save(req: InvestorActionRequest):
    conn = get_db()
    try:
        existing = conn.execute(
            "SELECT 1 FROM investor_saves WHERE investor_id=? AND startup_id=?",
            (req.investor_id, req.startup_id)
        ).fetchone()

        if existing:
            conn.execute(
                "DELETE FROM investor_saves WHERE investor_id=? AND startup_id=?",
                (req.investor_id, req.startup_id)
            )
            conn.commit()
            return {"saved": False, "message": "Removed from saved"}
        else:
            conn.execute(
                "INSERT INTO investor_saves (investor_id, startup_id) VALUES (?, ?)",
                (req.investor_id, req.startup_id)
            )
            conn.commit()
            return {"saved": True, "message": "Saved to your list"}
    finally:
        conn.close()

# ─── /investor/like ───────────────────────────────────────────────────────────

@app.post("/investor/like")
def toggle_like(req: InvestorActionRequest):
    conn = get_db()
    try:
        existing = conn.execute(
            "SELECT 1 FROM investor_likes WHERE investor_id=? AND startup_id=?",
            (req.investor_id, req.startup_id)
        ).fetchone()

        startup = conn.execute("SELECT likes FROM startups WHERE id=?", (req.startup_id,)).fetchone()
        current_likes = startup["likes"] if startup else 0

        if existing:
            conn.execute(
                "DELETE FROM investor_likes WHERE investor_id=? AND startup_id=?",
                (req.investor_id, req.startup_id)
            )
            new_likes = max(0, current_likes - 1)
            conn.execute("UPDATE startups SET likes=? WHERE id=?", (new_likes, req.startup_id))
            conn.commit()
            return {"liked": False, "likes": new_likes, "message": "Like removed"}
        else:
            conn.execute(
                "INSERT INTO investor_likes (investor_id, startup_id) VALUES (?, ?)",
                (req.investor_id, req.startup_id)
            )
            new_likes = current_likes + 1
            conn.execute("UPDATE startups SET likes=? WHERE id=?", (new_likes, req.startup_id))
            conn.commit()
            return {"liked": True, "likes": new_likes, "message": "Liked!"}
    finally:
        conn.close()

# ─── /investor/connect ────────────────────────────────────────────────────────

@app.post("/investor/connect")
def send_connect(req: ConnectRequest):
    conn = get_db()
    try:
        existing = conn.execute(
            "SELECT 1 FROM investor_connects WHERE investor_id=? AND startup_id=?",
            (req.investor_id, req.startup_id)
        ).fetchone()

        if existing:
            return {"connected": True, "message": "Connection request already sent"}

        conn.execute(
            "INSERT INTO investor_connects (investor_id, startup_id, message) VALUES (?, ?, ?)",
            (req.investor_id, req.startup_id, req.message or "")
        )
        conn.commit()
        startup = conn.execute("SELECT name FROM startups WHERE id=?", (req.startup_id,)).fetchone()
        name = startup["name"] if startup else "this startup"
        return {"connected": True, "message": f"Connection request sent to {name}!"}
    finally:
        conn.close()

# ─── /investor/pipeline ────────────────────────────────────────────────────────

@app.post("/investor/pipeline/update-stage")
def update_pipeline_stage(req: PipelineStageRequest):
    conn = get_db()
    try:
        if req.stage == "Remove" or not req.stage:
            conn.execute(
                "DELETE FROM investor_pipeline WHERE investor_id=? AND startup_id=?",
                (req.investor_id, req.startup_id)
            )
            msg = "Removed from pipeline"
        else:
            conn.execute("""
                INSERT INTO investor_pipeline (investor_id, startup_id, stage, updated_at) 
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(investor_id, startup_id) 
                DO UPDATE SET stage=excluded.stage, updated_at=CURRENT_TIMESTAMP
            """, (req.investor_id, req.startup_id, req.stage))
            msg = f"Moved to {req.stage}"
            
        conn.commit()
        return {"message": msg, "stage": req.stage}
    finally:
        conn.close()

@app.get("/investor/pipeline")
def get_pipeline(investor_id: str):
    conn = get_db()
    try:
        rows = conn.execute("""
            SELECT p.stage, s.* 
            FROM investor_pipeline p
            JOIN startups s ON p.startup_id = s.id
            WHERE p.investor_id = ?
        """, (investor_id,)).fetchall()
        
        result = []
        for r in rows:
            d = dict(r)
            d["is_trending"] = bool(d.get("is_trending", 0))
            result.append(d)
        return result
    finally:
        conn.close()

# ─── /ai/query (Floating Assistant) ───────────────────────────────────────────

class AIQueryRequest(BaseModel):
    query: str
    context: Optional[str] = None
    investor_id: Optional[str] = None

@app.post("/ai/query")
async def ai_query(req: AIQueryRequest):
    # Retrieve top 5 saved/pipeline startups for context if requested
    context_str = ""
    if req.investor_id:
        conn = get_db()
        rows = conn.execute("""
            SELECT s.name, s.industry, s.score, s.ai_recommendation, s.pitch
            FROM startups s
            LEFT JOIN investor_saves v ON s.id = v.startup_id AND v.investor_id = ?
            WHERE v.investor_id IS NOT NULL OR s.score > 90
            LIMIT 5
        """, (req.investor_id,)).fetchall()
        conn.close()
        
        if rows:
            context_str += "Context Startups:\n"
            for r in rows:
                context_str += f"- {r['name']} ({r['industry']}, Score: {r['score']}): {r['ai_recommendation']}\n"
    
    prompt = f'''
    You are an elite VC AI Co-pilot assistant.
    A venture capital investor is asking you: "{req.query}"
    
    Data they are looking at (if relevant):
    {req.context or 'No specific UI context provided.'}
    {context_str}
    
    Provide a professional, extremely concise, and insightful answer. Format cleanly in markdown, prioritizing signals over noise. Say what you think factually. Keep it under 150 words.
    '''
    
    return {"reply": await call_gemini(prompt)}

# ─── /investor/dashboard-stats ────────────────────────────────────────────────

@app.get("/investor/dashboard-stats")
def get_dashboard_stats(investor_id: Optional[str] = None):
    conn = get_db()
    try:
        all_startups = conn.execute("SELECT * FROM startups").fetchall()

        total = len(all_startups)
        avg_score = round(sum(r["score"] for r in all_startups) / total, 1) if total else 0
        high_risk = sum(1 for r in all_startups if r["risk_level"] == "High")
        low_risk = sum(1 for r in all_startups if r["risk_level"] == "Low")

        # Industry distribution
        industry_counts: Dict[str, int] = {}
        for r in all_startups:
            ind = r["industry"]
            industry_counts[ind] = industry_counts.get(ind, 0) + 1
        industry_distribution = [{"name": k, "value": v} for k, v in
            sorted(industry_counts.items(), key=lambda x: -x[1])[:8]]

        # Stage distribution
        stage_counts: Dict[str, int] = {}
        for r in all_startups:
            s = r["stage"]
            stage_counts[s] = stage_counts.get(s, 0) + 1
        stage_distribution = [{"stage": k, "count": v} for k, v in stage_counts.items()]

        # Avg score by industry
        industry_scores: Dict[str, list] = {}
        for r in all_startups:
            industry_scores.setdefault(r["industry"], []).append(r["score"])
        avg_by_industry = [
            {"industry": k, "avgScore": round(sum(v) / len(v), 1)}
            for k, v in sorted(industry_scores.items(), key=lambda x: -sum(x[1]) / len(x[1]))[:6]
        ]

        # Investor-specific data
        saved_count = 0
        liked_count = 0
        connected_count = 0
        if investor_id:
            saved_count = conn.execute("SELECT COUNT(*) FROM investor_saves WHERE investor_id=?", (investor_id,)).fetchone()[0]
            liked_count = conn.execute("SELECT COUNT(*) FROM investor_likes WHERE investor_id=?", (investor_id,)).fetchone()[0]
            connected_count = conn.execute("SELECT COUNT(DISTINCT startup_id) FROM investor_connects WHERE investor_id=?", (investor_id,)).fetchone()[0]

        return {
            "total_startups": total,
            "avg_score": avg_score,
            "high_risk_count": high_risk,
            "low_risk_count": low_risk,
            "saved_count": saved_count,
            "liked_count": liked_count,
            "connected_count": connected_count,
            "industry_distribution": industry_distribution,
            "stage_distribution": stage_distribution,
            "avg_score_by_industry": avg_by_industry,
        }
    finally:
        conn.close()

# ─── /investor/investments ────────────────────────────────────────────────────

@app.get("/investor/investments")
def get_investments(investor_id: Optional[str] = None):
    # Mock portfolio returns tailored for VC view
    return [
        {
            "id": "inv-1",
            "name": "NexusAI",
            "invested_amount": "$250,000",
            "current_valuation": "$15M",
            "roi_percent": "+120%",
            "status": "Growing"
        },
        {
            "id": "inv-2",
            "name": "FinPulse",
            "invested_amount": "$1,200,000",
            "current_valuation": "$40M",
            "roi_percent": "+210%",
            "status": "Exit"
        },
        {
            "id": "inv-3",
            "name": "EcoPack",
            "invested_amount": "$500,000",
            "current_valuation": "$4.5M",
            "roi_percent": "-10%",
            "status": "Risk"
        },
        {
            "id": "inv-4",
            "name": "CodeCompanion",
            "invested_amount": "$150,000",
            "current_valuation": "$12M",
            "roi_percent": "+350%",
            "status": "Growing"
        }
    ]

# ─── /notifications ───────────────────────────────────────────────────────────

@app.get("/notifications")
def get_notifications(investor_id: Optional[str] = None):
    # Instagram-like activity feed for VC
    return [
        {
            "id": 1,
            "type": "view",
            "user": "Aarav Patel",
            "avatar": "https://i.pravatar.cc/150?u=aarav",
            "action": "viewed your saved startup",
            "time": "10m ago",
            "read": False
        },
        {
            "id": 2,
            "type": "like",
            "user": "Sequoia Capital",
            "avatar": "https://i.pravatar.cc/150?u=sequoia",
            "action": "liked QuantumDB",
            "time": "2h ago",
            "read": False
        },
        {
            "id": 3,
            "type": "accept",
            "user": "Sarah Jenkins",
            "avatar": "https://i.pravatar.cc/150?u=sarahj",
            "action": "accepted your connection request",
            "time": "4h ago",
            "read": False
        },
        {
            "id": 4,
            "type": "pitch",
            "user": "StreamSec",
            "avatar": "https://i.pravatar.cc/150?u=tyler",
            "action": "uploaded a new pitch video",
            "time": "5h ago",
            "read": True
        },
        {
            "id": 5,
            "type": "fund",
            "user": "FinPulse",
            "avatar": "https://i.pravatar.cc/150?u=aarav",
            "action": "raised Series A round",
            "time": "1d ago",
            "read": True
        }
    ]

