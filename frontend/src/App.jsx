import { useState } from 'react'
import DisputeForm from './components/DisputeForm'
import ResultCard  from './components/ResultCard'
import PDFUpload   from './components/PDFUpload'
import Dashboard   from './components/Dashboard'

const TABS = [
  { id: 'analyze',   label: '⚡ Analyze Dispute' },
  { id: 'pdf',       label: '📄 PDF Batch Upload' },
  { id: 'dashboard', label: '📊 Model Dashboard' },
]

export default function App() {
  const [tab,     setTab]     = useState('analyze')
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="app">
      <div className="header">
        <h1>Credit Card Dispute Resolver</h1>
        <p>
          NLP pipeline trained on 83,349 real CFPB complaints.
          Classifies, scores severity, and generates resolution guidance in under 3 seconds.
        </p>
        <div className="stat-strip">
          <span className="stat-chip">🗄️ <strong>83,349</strong> complaints trained</span>
          <span className="stat-chip">🤖 BERT <strong>89.98%</strong> accuracy</span>
          <span className="stat-chip">📊 Baseline <strong>82.44%</strong> accuracy</span>
          <span className="stat-chip">📂 <strong>6</strong> dispute categories</span>
          <span className="stat-chip">🧠 RAG · Groq <strong>llama-3.3-70b</strong></span>
        </div>
      </div>

      <div className="tab-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'analyze' && (
        <>
          <DisputeForm
            onResult={r => { setResult(r); setError(null) }}
            onError={e  => { setError(e);  setResult(null) }}
            onLoading={setLoading}
            loading={loading}
          />
          {error  && <div className="error-box">⚠️ {error}</div>}
          {result && !error && <ResultCard result={result} />}
        </>
      )}

      {tab === 'pdf'       && <PDFUpload />}
      {tab === 'dashboard' && <Dashboard />}

      <div className="footer">
        Automated Credit Card Dispute Resolution via NLP &nbsp;·&nbsp;
        <a href="/api/docs" target="_blank" rel="noreferrer">API Docs ↗</a>
        &nbsp;·&nbsp;
        <a href="/api/health" target="_blank" rel="noreferrer">Health ↗</a>
      </div>
    </div>
  )
}