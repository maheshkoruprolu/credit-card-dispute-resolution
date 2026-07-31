import { useState } from 'react'
import { apiUrl } from './lib/api'
import DisputeForm   from './components/DisputeForm'
import ResultCard    from './components/ResultCard'
import DisputeLetter from './components/DisputeLetter'
import PDFUpload     from './components/PDFUpload'
import Dashboard     from './components/Dashboard'
import HistoryPanel, { saveToHistory } from './components/HistoryPanel'
import Toast         from './components/Toast'

const TABS = [
  { id: 'analyze',   label: '⚡ Analyze Dispute' },
  { id: 'pdf',       label: '📄 PDF Batch Upload' },
  { id: 'dashboard', label: '📊 Model Dashboard' },
  { id: 'history',   label: '🕐 History' },
]

export default function App() {
  const [tab,     setTab]     = useState('analyze')
  const [text,    setText]    = useState('')        // lifted from DisputeForm
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [toasts,  setToasts]  = useState([])

  function addToast(message, type = 'success') {
    setToasts(prev => [...prev, { id: Date.now(), message, type }])
  }

  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  function handleResult(r) {
    setResult(r)
    setError(null)
    saveToHistory(text, r)
    addToast('Analysis complete!', 'success')
  }

  function handleError(msg) {
    setError(msg)
    setResult(null)
    addToast(msg, 'error')
  }

  return (
    <div className="app">
      {/* ── Header ── */}
      <div className="header">
        <div className="header-eyebrow">
          <span>●</span> G38 AIML · Mahesh · Project #3
        </div>
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

      {/* ── Tab nav ── */}
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

      {/* ── Analyze tab ── */}
      {tab === 'analyze' && (
        <>
          <DisputeForm
            text={text}
            setText={setText}
            onResult={handleResult}
            onError={handleError}
            onLoading={setLoading}
            loading={loading}
          />

          {error && (
            <div className="error-box">⚠️ {error}</div>
          )}

          {result && !error && (
            <>
              <ResultCard result={result} />
              <DisputeLetter
                result={result}
                complaintText={text}
                onToast={addToast}
              />
            </>
          )}
        </>
      )}

      {/* ── PDF tab ── */}
      {tab === 'pdf' && <PDFUpload />}

      {/* ── Dashboard tab ── */}
      {tab === 'dashboard' && <Dashboard />}

      {/* ── History tab ── */}
      {tab === 'history' && (
        <HistoryPanel onToast={addToast} />
      )}

      {/* ── Footer ── */}
      <div className="footer">
        Automated Credit Card Dispute Resolution via NLP &nbsp;·&nbsp;
        G38 AIML Project &nbsp;·&nbsp;
        <a href={apiUrl("/api/docs")} target="_blank" rel="noreferrer">API Docs ↗</a>
        &nbsp;·&nbsp;
        <a href={apiUrl("/api/health")} target="_blank" rel="noreferrer">Health ↗</a>
      </div>

      {/* ── Toast notifications ── */}
      {toasts.map(t => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </div>
  )
}