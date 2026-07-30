"""
RAG Policy Explainer
Stack: LangChain + ChromaDB + Groq (llama-3.3-70b) + HuggingFace Embeddings

Loads the ChromaDB index built in notebook 05 and provides
policy-grounded explanations for each classified dispute.
"""

import os
import logging
from pathlib import Path

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

log = logging.getLogger(__name__)

# ── Paths ─────────────────────────────────────────────────────────────────────
_BASE       = Path(__file__).parent
COLLECTION  = "policy_docs"
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


def _get_chroma_dir() -> Path:
    base = Path(os.environ.get("MODEL_BASE_PATH", _BASE / "models"))
    return base / "chroma_db"

# ── Resolution rules (instant — no LLM needed) ────────────────────────────────
RESOLUTION_RULES = {
    "Unauthorized Transaction": {
        "action":             "Initiate chargeback investigation immediately",
        "timeline":           "3–10 business days",
        "priority":           "HIGH",
        "provisional_credit": True,
        "required_docs": [
            "Government-issued ID",
            "Credit card statement highlighting the transaction",
            "Police report if amount exceeds $500",
        ],
    },
    "Billing Error": {
        "action":             "Request itemised billing statement from merchant",
        "timeline":           "5–7 business days",
        "priority":           "MEDIUM",
        "provisional_credit": False,
        "required_docs": [
            "Original invoice or receipt",
            "Credit card statement",
        ],
    },
    "Duplicate Charge": {
        "action":             "Verify with merchant and reverse the duplicate charge",
        "timeline":           "2–5 business days",
        "priority":           "MEDIUM",
        "provisional_credit": False,
        "required_docs": [
            "Credit card statement showing both identical charges",
        ],
    },
    "Goods Not Received": {
        "action":             "Contact merchant for delivery proof; escalate chargeback if no response in 5 days",
        "timeline":           "5–15 business days",
        "priority":           "MEDIUM",
        "provisional_credit": False,
        "required_docs": [
            "Order confirmation email",
            "Tracking number",
            "Communication records with merchant",
        ],
    },
    "Service Not Provided": {
        "action":             "Request cancellation confirmation; initiate service-not-rendered chargeback",
        "timeline":           "5–10 business days",
        "priority":           "MEDIUM",
        "provisional_credit": False,
        "required_docs": [
            "Cancellation confirmation email or reference number",
            "Statement showing continued charges after cancellation",
        ],
    },
    "Merchant Fraud": {
        "action":             "Escalate to fraud department; block merchant; initiate full chargeback",
        "timeline":           "3–7 business days",
        "priority":           "URGENT",
        "provisional_credit": True,
        "required_docs": [
            "Screenshots of fraudulent merchant website",
            "All communication records",
            "Transaction records",
        ],
    },
}

# ── Prompt ────────────────────────────────────────────────────────────────────
_PROMPT = ChatPromptTemplate.from_template("""
You are a professional bank dispute resolution officer.

A customer submitted this complaint:
"{complaint}"

Our NLP classifier predicted the dispute category as: {category}

Relevant bank policy (use this as your only reference):
{context}

Write a professional response in exactly 3 sentences:
1. Explain why this complaint falls under "{category}"
2. Describe what the resolution process involves
3. Tell the customer what to expect (timeline and likely outcome)

Be factual, concise, and professional. No bullet points or headers.
""")


# ── Engine class ──────────────────────────────────────────────────────────────
class PolicyRAG:
    """
    RAG engine that loads a pre-built ChromaDB index and generates
    policy-grounded explanations using Groq's Llama 3.3 70B.

    Lifecycle:
        rag = PolicyRAG()
        rag.load()          # call once at FastAPI startup
        result = rag.explain(complaint, category)
    """

    def __init__(self):
        self._vectorstore = None
        self._llm         = None
        self._embeddings  = None
        self.ready        = False

    def load(self) -> None:
        """Load ChromaDB index and connect to Groq. Call at app startup."""
        groq_key = os.environ.get("GROQ_API_KEY", "")
        chroma_dir = _get_chroma_dir()

        # 1. Embedding model (local, free, no API key)
        log.info("Loading embedding model...")
        self._embeddings = HuggingFaceEmbeddings(
            model_name=EMBED_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )

        # 2. Load ChromaDB from disk
        if not chroma_dir.exists():
            log.error(
                f"ChromaDB not found at {chroma_dir}. "
                "Run notebook 05_rag_setup.ipynb first to build the index."
            )
            return

        log.info(f"Loading ChromaDB from {chroma_dir}...")
        self._vectorstore = Chroma(
            persist_directory=str(chroma_dir),
            embedding_function=self._embeddings,
            collection_name=COLLECTION,
        )
        count = self._vectorstore._collection.count()
        log.info(f"✅ ChromaDB loaded — {count} vectors")

        # 3. Connect Groq LLM
        if groq_key:
            self._llm = ChatGroq(
                model="llama-3.3-70b-versatile",
                temperature=0.2,
                max_tokens=512,
                api_key=groq_key,
            )
            log.info("✅ Groq LLM connected (llama-3.3-70b-versatile)")
        else:
            log.warning("GROQ_API_KEY not set — explanations will use rule-based fallback")

        self.ready = True

    # ── Internal helpers ──────────────────────────────────────────────────────
    def _retrieve(self, complaint: str, category: str) -> str:
        """Retrieve top-3 policy chunks for the given category."""
        retriever = self._vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={
                "k": 3,
                "filter": {"category": category},
            },
        )
        docs = retriever.invoke(complaint)

        # Fallback: if category filter returns nothing, search without filter
        if not docs:
            retriever_nofilter = self._vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 3},
            )
            docs = retriever_nofilter.invoke(f"{category} {complaint}")

        return "\n\n".join(doc.page_content for doc in docs)

    def _generate(self, complaint: str, category: str, context: str) -> str:
        """Generate explanation via Groq LLM."""
        chain = _PROMPT | self._llm | StrOutputParser()
        return chain.invoke({
            "complaint": complaint,
            "category":  category,
            "context":   context,
        })

    def _fallback_explanation(self, category: str) -> str:
        """Rule-based explanation when Groq is unavailable."""
        r = RESOLUTION_RULES.get(category, {})
        action   = r.get("action", "review the complaint")
        timeline = r.get("timeline", "5–10 business days")
        return (
            f"This complaint has been classified as '{category}' based on the key "
            f"details and language provided by the customer. "
            f"Our team will {action.lower()} to address the issue promptly. "
            f"You can expect a resolution within {timeline}."
        )

    # ── Public API ────────────────────────────────────────────────────────────
    def explain(self, complaint: str, category: str) -> dict:
        """
        Full RAG pipeline: retrieve policy → generate explanation.

        Returns:
            {
                "summary":          str,   # 3-sentence Groq explanation
                "policy_reference": str,   # source .md filename
                "used_llm":         bool,  # True = Groq, False = fallback
            }
        """
        if not self.ready:
            return {
                "summary":          self._fallback_explanation(category),
                "policy_reference": f"{category.lower().replace(' ', '_')}.md",
                "used_llm":         False,
            }

        context = self._retrieve(complaint, category)

        if self._llm and context:
            try:
                summary  = self._generate(complaint, category, context)
                used_llm = True
            except Exception as e:
                log.error(f"Groq generation failed: {e}")
                summary  = self._fallback_explanation(category)
                used_llm = False
        else:
            summary  = self._fallback_explanation(category)
            used_llm = False

        return {
            "summary":          summary,
            "policy_reference": f"{category.lower().replace(' ', '_')}.md",
            "used_llm":         used_llm,
        }

    def get_resolution(self, category: str) -> dict:
        """Return structured resolution rules for a category (no LLM needed)."""
        return RESOLUTION_RULES.get(category, {
            "action":             "Review complaint manually",
            "timeline":           "5–10 business days",
            "priority":           "MEDIUM",
            "provisional_credit": False,
            "required_docs":      ["Supporting documentation"],
        })