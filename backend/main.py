"""
Credit Card Dispute Resolution — FastAPI Backend
Endpoints: /predict (fast), /predict-full (BERT + RAG + severity), /health, /models
"""

import os, re, logging, joblib
import numpy as np
from pathlib import Path
from contextlib import asynccontextmanager

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from rag_engine import PolicyRAG
from severity_scorer import score_complaint

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ── Model paths ───────────────────────────────────────────────────────────────
_DEFAULT_BASE = Path(__file__).parent / "models"

def get_model_base() -> Path:
    env = os.environ.get("MODEL_BASE_PATH")
    return Path(env) if env else _DEFAULT_BASE

# ── Global holders ────────────────────────────────────────────────────────────
class Models:
    bert_model = bert_tokenizer = bert_le = None
    lr_model = tfidf = lr_le = None
    device = None
    bert_loaded = lr_loaded = False

rag = PolicyRAG()   # initialised here, loaded in lifespan

# ── Text cleaning ─────────────────────────────────────────────────────────────
def clean_for_bert(text: str) -> str:
    text = re.sub(r'\bXX/XX/(?:XXXX|\d{4})\b', 'DATE', text)
    text = re.sub(r'\bXX/XX\b', 'DATE', text)
    text = re.sub(r'\$[\d,]+(?:\.\d{1,2})?', 'AMOUNT', text)
    text = re.sub(r'\bXX+\b', '', text)
    text = re.sub(r'http\S+|www\S+|\S+@\S+', '', text)
    return re.sub(r'\s+', ' ', text).strip()

def clean_for_tfidf(text: str) -> str:
    text = text.lower()
    text = re.sub(r'\bxx+\b', '', text)
    text = re.sub(r'\$[\d,]+\.?\d*', 'amount', text)
    text = re.sub(r'http\S+|www\S+|\S+@\S+', '', text)
    text = re.sub(r'[^a-z\s]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    base = get_model_base()
    Models.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    log.info(f"Device: {Models.device}")

    # DistilBERT
    bert_path = base / "bert_dispute_model"
    if bert_path.exists():
        try:
            Models.bert_tokenizer = AutoTokenizer.from_pretrained(str(bert_path))
            Models.bert_model = AutoModelForSequenceClassification.from_pretrained(
                str(bert_path)).to(Models.device)
            Models.bert_model.eval()
            Models.bert_le = joblib.load(bert_path / "label_encoder.pkl")
            Models.bert_loaded = True
            log.info("✅ DistilBERT loaded")
        except Exception as e:
            log.error(f"DistilBERT failed: {e}")

    # TF-IDF baseline
    lr_path = base / "baseline_lr_model.pkl"
    if lr_path.exists():
        try:
            Models.lr_model = joblib.load(lr_path)
            Models.tfidf    = joblib.load(base / "tfidf_vectorizer.pkl")
            Models.lr_le    = joblib.load(base / "label_encoder.pkl")
            Models.lr_loaded = True
            log.info("✅ Baseline loaded")
        except Exception as e:
            log.error(f"Baseline failed: {e}")

    # RAG engine
    try:
        rag.load()
        log.info(f"✅ RAG engine loaded (ready={rag.ready})")
    except Exception as e:
        log.error(f"RAG load failed: {e}")

    yield
    log.info("Shutdown complete.")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Credit Card Dispute Resolver API",
    description="DistilBERT (89.98%) + LangChain RAG (Groq llama-3.3-70b) + Severity Scoring",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ───────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    complaint_text: str = Field(..., min_length=10, max_length=5000,
        example="I noticed a $299 charge I never made on my statement.")
    model: str = Field(default="bert")

class FullPredictRequest(BaseModel):
    complaint_text: str = Field(..., min_length=10, max_length=5000,
        example="I noticed a $299 charge I never made on my statement.")
    model: str          = Field(default="bert")
    include_rag:        bool = Field(default=True)
    include_severity:   bool = Field(default=True)

class CategoryScore(BaseModel):
    category: str
    score: float

class ClassificationResult(BaseModel):
    predicted_category: str
    confidence: float
    all_scores: list[CategoryScore]
    model_used: str
    text_preview: str

class SeverityResult(BaseModel):
    score: int
    level: str
    color: str
    factors: list[str]

class RAGResult(BaseModel):
    summary: str
    policy_reference: str
    used_llm: bool

class ResolutionResult(BaseModel):
    action: str
    timeline: str
    priority: str
    provisional_credit: bool
    required_docs: list[str]

class FullPredictResponse(BaseModel):
    classification: ClassificationResult
    severity: SeverityResult | None = None
    rag_explanation: RAGResult | None = None
    resolution: ResolutionResult | None = None

# ── Inference ─────────────────────────────────────────────────────────────────
def _run_bert(text: str) -> tuple:
    cleaned = clean_for_bert(text)
    inputs = Models.bert_tokenizer(
        cleaned, return_tensors="pt", truncation=True, max_length=256, padding=True)
    inputs = {k: v.to(Models.device) for k, v in inputs.items()}
    with torch.no_grad():
        probs = torch.softmax(
            Models.bert_model(**inputs).logits, dim=1).cpu().numpy()[0]
    idx   = int(np.argmax(probs))
    label = Models.bert_le.inverse_transform([idx])[0]
    scores = [CategoryScore(
        category=Models.bert_le.inverse_transform([i])[0],
        score=float(p)) for i, p in enumerate(probs)]
    return label, float(probs[idx]), scores

def _run_baseline(text: str) -> tuple:
    cleaned = clean_for_tfidf(text)
    probs   = Models.lr_model.predict_proba(Models.tfidf.transform([cleaned]))[0]
    idx     = int(np.argmax(probs))
    label   = Models.lr_le.inverse_transform([idx])[0]
    scores  = [CategoryScore(
        category=Models.lr_le.inverse_transform([i])[0],
        score=float(p)) for i, p in enumerate(probs)]
    return label, float(probs[idx]), scores

def _classify(complaint_text: str, model_choice: str) -> ClassificationResult:
    choice = model_choice.lower().strip()
    if choice == "bert":
        if not Models.bert_loaded:
            raise HTTPException(503, "DistilBERT not loaded. Use model='baseline'.")
        cat, conf, scores = _run_bert(complaint_text)
        used = "DistilBERT (fine-tuned · 89.98%)"
    elif choice == "baseline":
        if not Models.lr_loaded:
            raise HTTPException(503, "Baseline model not loaded.")
        cat, conf, scores = _run_baseline(complaint_text)
        used = "TF-IDF + Logistic Regression (82.44%)"
    else:
        raise HTTPException(400, f"Unknown model '{choice}'. Use 'bert' or 'baseline'.")

    return ClassificationResult(
        predicted_category=cat,
        confidence=conf,
        all_scores=sorted(scores, key=lambda x: -x.score),
        model_used=used,
        text_preview=complaint_text[:120] + ("..." if len(complaint_text) > 120 else ""),
    )

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message": "Credit Card Dispute Resolver API",
        "docs": "/docs",
        "endpoints": {
            "fast_classify":   "POST /predict",
            "full_analysis":   "POST /predict-full",
            "health":          "GET  /health",
            "models":          "GET  /models",
        }
    }

@app.get("/health")
def health():
    return {
        "status": "ok" if (Models.bert_loaded or Models.lr_loaded) else "degraded",
        "models_loaded": {
            "bert":     Models.bert_loaded,
            "baseline": Models.lr_loaded,
        },
        "rag_ready":    rag.ready,
        "cuda":         torch.cuda.is_available(),
        "device":       str(Models.device),
    }

@app.get("/models")
def list_models():
    return {"available": [
        {"id": "bert",     "name": "DistilBERT (fine-tuned)", "accuracy": "89.98%", "loaded": Models.bert_loaded, "recommended": True},
        {"id": "baseline", "name": "TF-IDF + LR",             "accuracy": "82.44%", "loaded": Models.lr_loaded,  "recommended": False},
    ]}

@app.post("/predict", response_model=ClassificationResult)
def predict(req: PredictRequest):
    """Fast classification only — no RAG, no severity. ~100ms."""
    result = _classify(req.complaint_text, req.model)
    log.info(f"/predict → {result.predicted_category} ({result.confidence:.2%})")
    return result

@app.post("/predict-full", response_model=FullPredictResponse)
def predict_full(req: FullPredictRequest):
    """
    Full analysis pipeline:
      1. DistilBERT classification   (~100ms)
      2. Severity scoring            (~5ms, rule-based)
      3. RAG policy explanation      (~1-2s, Groq LLM)
      4. Resolution recommendation   (~1ms, lookup table)
    """
    # Step 1 — classify
    classification = _classify(req.complaint_text, req.model)
    category       = classification.predicted_category
    log.info(f"/predict-full → {category} ({classification.confidence:.2%})")

    # Step 2 — severity
    severity = None
    if req.include_severity:
        raw = score_complaint(req.complaint_text, category)
        severity = SeverityResult(**raw)

    # Step 3 — RAG explanation
    rag_explanation = None
    if req.include_rag and rag.ready:
        try:
            raw_rag      = rag.explain(req.complaint_text, category)
            rag_explanation = RAGResult(**raw_rag)
        except Exception as e:
            log.error(f"RAG explain failed: {e}")

    # Step 4 — resolution
    raw_res = rag.get_resolution(category)
    resolution = ResolutionResult(
        action             = raw_res.get("action", "Review manually"),
        timeline           = raw_res.get("timeline", "5–10 business days"),
        priority           = raw_res.get("priority", "MEDIUM"),
        provisional_credit = raw_res.get("provisional_credit", False),
        required_docs      = raw_res.get("required_docs", []),
    )

    return FullPredictResponse(
        classification=classification,
        severity=severity,
        rag_explanation=rag_explanation,
        resolution=resolution,
    )

@app.post("/batch-predict")
def batch_predict(requests: list[PredictRequest]):
    """Classify up to 20 complaints at once (no RAG)."""
    if len(requests) > 20:
        raise HTTPException(400, "Max 20 items per batch.")
    return [predict(r) for r in requests]