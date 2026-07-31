import { useState } from 'react'
import { apiUrl } from '../lib/api'

const SAMPLES = [
  { label: '🚨 Unauthorized',  text: 'I noticed a charge of $299 on my statement that I never made. Someone used my credit card without my permission at an online electronics store. I did not authorize this transaction and have never shopped at this retailer.' },
  { label: '🔁 Charged twice', text: 'I was charged twice for the same $89.99 purchase on the same day from the same merchant. Both transactions appear on my statement with identical amounts and merchant names. This is clearly a duplicate charge error.' },
  { label: '📦 Never arrived', text: 'I ordered a laptop three months ago and it never arrived. The seller stopped responding to my emails and the tracking number shows no movement. I paid $650 and received nothing whatsoever from this merchant.' },
  { label: '📋 Wrong amount',  text: 'The merchant agreed to charge me $45 but I was billed $145 on my credit card statement. This is a clear billing error. I have a receipt showing the correct agreed amount and the merchant is refusing to issue a refund.' },
  { label: '🚫 Cancelled sub', text: 'I cancelled my gym membership in January but the company kept charging my credit card every month for six months after cancellation. I have the cancellation confirmation email but the charges continued regardless.' },
  { label: '⚠️ Fake merchant', text: 'The website was completely fake. I paid $200 for electronics but the merchant never existed. The website disappeared within hours of my purchase. I was scammed by a fraudulent online store and lost my money.' },
]

// text + setText are now lifted to App so other components (DisputeLetter, History) can access them
export default function DisputeForm({ text, setText, onResult, onError, onLoading, loading }) {
  const [model,    setModel]    = useState('bert')
  const [fullMode, setFullMode] = useState(true)

  async function handleSubmit() {
    const trimmed = text.trim()
    if (!trimmed || trimmed.length < 10) return
    onLoading(true)

    const endpoint = apiUrl(fullMode ? '/api/predict-full' : '/api/predict')
    const body     = fullMode
      ? { complaint_text: trimmed, model, include_rag: true, include_severity: true }
      : { complaint_text: trimmed, model }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Server error ${res.status}`)
      }
      onResult(await res.json())
    } catch (e) {
      onError(e.message || 'Cannot reach API. Is the Colab backend running?')
    } finally {
      onLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-title">Complaint description</div>

      <textarea
        className="textarea"
        placeholder="Describe the dispute in plain language — e.g. I found a $299 charge on my statement I never made..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleSubmit()}
        disabled={loading}
        rows={5}
      />

      <div className="form-row" style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="model-toggle">
            <button className={`toggle-btn ${model === 'bert' ? 'active' : ''}`}
              onClick={() => setModel('bert')} disabled={loading}>
              DistilBERT · 90%
            </button>
            <button className={`toggle-btn ${model === 'baseline' ? 'active' : ''}`}
              onClick={() => setModel('baseline')} disabled={loading}>
              TF-IDF · 82%
            </button>
          </div>

          <div className="model-toggle">
            <button className={`toggle-btn ${fullMode ? 'active' : ''}`}
              onClick={() => setFullMode(true)} disabled={loading}
              title="Classification + Severity + RAG Explanation + Resolution (~2–3s)">
              Full analysis
            </button>
            <button className={`toggle-btn ${!fullMode ? 'active' : ''}`}
              onClick={() => setFullMode(false)} disabled={loading}
              title="Classification only (~100ms)">
              Fast only
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="char-hint">
            {text.length}/5000 &nbsp;·&nbsp; Ctrl+Enter
            {fullMode && <span style={{ color: 'var(--accent)' }}> · RAG ON</span>}
          </span>
          <button
            className="submit-btn full-btn"
            onClick={handleSubmit}
            disabled={loading || text.trim().length < 10}
          >
            {loading
              ? <><div className="spinner" /> Analyzing…</>
              : fullMode ? 'Full Analysis →' : 'Classify →'
            }
          </button>
        </div>
      </div>

      <div className="samples-label">Try a sample:</div>
      <div className="sample-row">
        {SAMPLES.map(s => (
          <button key={s.label} className="sample-btn" disabled={loading}
            onClick={() => setText(s.text)}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}