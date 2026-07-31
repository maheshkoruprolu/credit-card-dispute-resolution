import { useState, useEffect } from 'react'
import { apiUrl } from '../lib/api'

const F1_DATA = [
  { category: '🚨 Unauthorized Transaction', baseline: 0.77, bert: 0.88 },
  { category: '📋 Billing Error',            baseline: 0.70, bert: 0.83 },
  { category: '🔁 Duplicate Charge',         baseline: 0.94, bert: 0.98 },
  { category: '📦 Goods Not Received',       baseline: 0.89, bert: 0.91 },
  { category: '🚫 Service Not Provided',     baseline: 0.84, bert: 0.92 },
  { category: '⚠️ Merchant Fraud',           baseline: 0.79, bert: 0.88 },
]

const ARCH_STEPS = [
  { label: 'Input',         name: 'Complaint text' },
  { label: 'NLP Model',     name: 'DistilBERT' },
  { label: 'Vector Search', name: 'ChromaDB' },
  { label: 'LLM',           name: 'Groq llama-70b' },
  { label: 'Output',        name: 'Full analysis' },
]

export default function Dashboard() {
  const [health, setHealth] = useState(null)
  const [hError, setHError] = useState(false)

useEffect(() => {
  fetch(apiUrl('/api/health'), {
    signal: AbortSignal.timeout(10000),
    headers: {
      "ngrok-skip-browser-warning": "1"
    }
  })
    .then(r => r.json())
    .then(setHealth)
    .catch(e => {
      console.error(e);
      setHError(true);
    });
}, []);

  return (
    <div>
      {/* ── Live status ── */}
      <div className="card">
        <div className="section-title">🟢 Live Backend Status</div>
        {!health && !hError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="spinner" />
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Checking backend…</span>
          </div>
        )}
        {hError && (
          <div className="error-box">⚠️ Cannot reach backend. Check that the API deployment is running.</div>
        )}
        {health && (
          <div className="metrics-row" style={{ marginBottom: 0 }}>
            <div className="metric-card">
              <div className="metric-value" style={{ color: health.status === 'ok' ? 'var(--green)' : 'var(--yellow)' }}>
                {health.status === 'ok' ? '✓' : '⚠'}
              </div>
              <div className="metric-label">API Status</div>
              <div className="metric-sub">{health.status.toUpperCase()}</div>
            </div>
            <div className="metric-card">
              <div className="metric-value" style={{ color: health.models_loaded?.bert ? 'var(--green)' : 'var(--red)' }}>
                {health.models_loaded?.bert ? '✓' : '✗'}
              </div>
              <div className="metric-label">DistilBERT</div>
              <div className="metric-sub">{health.models_loaded?.bert ? 'Loaded' : 'Not loaded'}</div>
            </div>
            <div className="metric-card">
              <div className="metric-value" style={{ color: health.models_loaded?.baseline ? 'var(--green)' : 'var(--red)' }}>
                {health.models_loaded?.baseline ? '✓' : '✗'}
              </div>
              <div className="metric-label">TF-IDF Baseline</div>
              <div className="metric-sub">{health.models_loaded?.baseline ? 'Loaded' : 'Not loaded'}</div>
            </div>
            <div className="metric-card">
              <div className="metric-value" style={{ color: health.rag_ready ? 'var(--green)' : 'var(--yellow)' }}>
                {health.rag_ready ? '✓' : '—'}
              </div>
              <div className="metric-label">RAG Engine</div>
              <div className="metric-sub">{health.rag_ready ? 'Ready' : 'Not ready'}</div>
            </div>
            <div className="metric-card">
              <div className="metric-value" style={{ color: health.cuda ? 'var(--accent)' : 'var(--text-muted)' }}>
                {health.cuda ? '⚡' : '💻'}
              </div>
              <div className="metric-label">Device</div>
              <div className="metric-sub">{health.cuda ? 'GPU (CUDA)' : 'CPU'}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Dataset stats ── */}
      <div className="card">
        <div className="section-title">🗄️ Dataset Statistics</div>
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-value">83,590</div>
            <div className="metric-label">Raw CFPB complaints</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">83,349</div>
            <div className="metric-label">After cleaning</div>
            <div className="metric-sub">−241 removed</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">30,000</div>
            <div className="metric-label">Balanced training set</div>
            <div className="metric-sub">5,000 × 6 categories</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">98%</div>
            <div className="metric-label">Label coverage</div>
            <div className="metric-sub">81,672 labeled</div>
          </div>
        </div>
      </div>

      {/* ── Model comparison ── */}
      <div className="card">
        <div className="section-title">🤖 Model Comparison</div>
        <div className="model-compare">
          <div className="model-box recommended">
            <div className="model-name">DistilBERT (fine-tuned)</div>
            <div className="model-acc">89.98%</div>
            <div className="model-f1">F1 Score: 90.00%</div>
            <div className="model-rec">⭐ Recommended</div>
          </div>
          <div className="model-box">
            <div className="model-name">TF-IDF + Logistic Regression</div>
            <div className="model-acc" style={{ color: 'var(--text-muted)' }}>82.44%</div>
            <div className="model-f1">F1 Score: 82.29%</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Baseline · ~10× faster</div>
          </div>
        </div>

        <div className="section-title" style={{ marginTop: 4 }}>Per-category F1 scores</div>
        <table className="f1-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Baseline</th>
              <th>BERT</th>
              <th>Improvement</th>
            </tr>
          </thead>
          <tbody>
            {F1_DATA.map(row => (
              <tr key={row.category}>
                <td>{row.category}</td>
                <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{row.baseline.toFixed(2)}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.bert.toFixed(2)}</td>
                <td><span className="f1-improve">+{(row.bert - row.baseline).toFixed(2)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Architecture ── */}
      <div className="card">
        <div className="section-title">🏗️ RAG Pipeline Architecture</div>
        <div className="arch-flow">
          {ARCH_STEPS.map((step, i) => (
            <div key={step.name} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <div className="arch-step" style={{ flex: 1 }}>
                <div className="arch-step-label">{step.label}</div>
                <div className="arch-step-name">{step.name}</div>
              </div>
              {i < ARCH_STEPS.length - 1 && <div className="arch-arrow">→</div>}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Classification latency', value: '~100ms', note: 'DistilBERT on GPU' },
            { label: 'Full analysis latency',  value: '~2–3s',  note: 'incl. Groq API' },
            { label: 'ChromaDB chunks',        value: '40–60',  note: 'from 6 policy docs' },
            { label: 'Policy docs',            value: '5,612 words', note: '6 categories' },
          ].map(m => (
            <div key={m.label} className="res-stat">
              <div className="res-stat-label">{m.label}</div>
              <div className="res-stat-value">{m.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tech stack ── */}
      <div className="card">
        <div className="section-title">🔧 Tech Stack</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            ['Dataset', 'CFPB (83K complaints)'],
            ['Classical ML', 'scikit-learn · TF-IDF + LR'],
            ['Deep Learning', 'HuggingFace DistilBERT'],
            ['RAG', 'LangChain + ChromaDB + Groq'],
            ['LLM', 'llama-3.3-70b-versatile'],
            ['Embeddings', 'all-MiniLM-L6-v2 (local)'],
            ['Backend', 'FastAPI + Uvicorn'],
            ['Frontend', 'React + Vite'],
            ['Runtime', 'Google Colab T4 GPU'],
            ['Orchestration', 'DataBricks Community Edition'],
            ['Deployment', 'Railway → AWS EC2'],
          ].map(([role, tech]) => (
            <div key={role} style={{
              background: 'var(--bg-card2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 12,
            }}>
              <span style={{ color: 'var(--text-muted)' }}>{role}: </span>
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>{tech}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}