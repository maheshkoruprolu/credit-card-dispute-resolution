import { useState, useRef } from 'react'

const ICONS = {
  'Unauthorized Transaction': '🚨',
  'Billing Error':            '📋',
  'Duplicate Charge':         '🔁',
  'Goods Not Received':       '📦',
  'Service Not Provided':     '🚫',
  'Merchant Fraud':           '⚠️',
}
const PRIORITY_COLOR = {
  URGENT: '#f87171', HIGH: '#fb923c', MEDIUM: '#fbbf24', LOW: '#34d399'
}

// Split a big PDF text into individual complaint paragraphs
function splitIntoComplaints(text) {
  // Split on double newlines or numbered patterns
  const chunks = text
    .split(/\n{2,}|(?=\d+\.\s)/g)
    .map(c => c.replace(/\s+/g, ' ').trim())
    .filter(c => c.length > 40 && c.length < 5000)
  return chunks.length ? chunks : [text.slice(0, 4000)]
}

export default function PDFUpload() {
  const [dragging,  setDragging]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [results,   setResults]   = useState([])
  const [error,     setError]     = useState(null)
  const [progress,  setProgress]  = useState('')
  const inputRef = useRef()

  async function processFile(file) {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')
        && file.type !== 'text/plain' && !file.name.endsWith('.txt')
        && file.type !== 'text/csv'   && !file.name.endsWith('.csv')) {
      setError('Please upload a PDF, TXT, or CSV file.')
      return
    }

    setLoading(true)
    setError(null)
    setResults([])

    try {
      let text = ''
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // Read PDF as text via FileReader (plain text extraction — works for text-based PDFs)
        // For a demo, we read the raw text. In production, use pdf.js or the backend /extract endpoint.
        setProgress('Reading PDF…')
        text = await new Promise((res, rej) => {
          const reader = new FileReader()
          reader.onload = e => res(e.target.result)
          reader.onerror = rej
          reader.readAsText(file)
        })
        // If text is mostly garbage (binary), show a message
        const printable = text.replace(/[^\x20-\x7E\n]/g, '').length
        if (printable < text.length * 0.5) {
          throw new Error('This PDF appears to be scanned or image-based. Please use a text-selectable PDF, or paste the text in the Analyze tab.')
        }
      } else {
        setProgress('Reading file…')
        text = await file.text()
      }

      setProgress('Splitting into complaints…')
      const complaints = splitIntoComplaints(text)
      setProgress(`Found ${complaints.length} complaint(s) — classifying…`)

      // Batch classify — max 20 at a time (backend limit)
      const batch = complaints.slice(0, 20).map(c => ({
        complaint_text: c.slice(0, 2000),
        model: 'bert',
      }))

      const res = await fetch('/api/batch-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Server error ${res.status}`)
      }

      const predictions = await res.json()

      // Merge text + prediction
      setResults(predictions.map((p, i) => ({
        text: complaints[i],
        ...p,
      })))
      setProgress('')
    } catch (e) {
      setError(e.message || 'Failed to process file.')
      setProgress('')
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  function exportCSV() {
    const header = 'Complaint Preview,Category,Confidence,Model\n'
    const rows   = results.map(r =>
      `"${r.text.slice(0,100).replace(/"/g,'""')}","${r.predicted_category}",` +
      `${(r.confidence*100).toFixed(1)}%,"${r.model_used}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'dispute_batch_results.csv' })
    a.click(); URL.revokeObjectURL(url)
  }

  // Category summary counts
  const summary = results.reduce((acc, r) => {
    acc[r.predicted_category] = (acc[r.predicted_category] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div className="card">
        <div className="card-title">PDF / TXT / CSV Batch Analysis</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
          Upload a PDF bank statement, a .txt file with complaints, or a .csv file.
          Each paragraph or row is classified automatically. Up to 20 complaints per file.
        </p>

        <div
          className={`drop-zone ${dragging ? 'drag-over' : ''}`}
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <input ref={inputRef} type="file" accept=".pdf,.txt,.csv"
            onChange={e => processFile(e.target.files[0])} />
          <div className="drop-zone-icon">📂</div>
          <div className="drop-zone-title">
            {loading ? progress || 'Processing…' : 'Drop a file here or click to upload'}
          </div>
          <div className="drop-zone-sub">PDF · TXT · CSV &nbsp;·&nbsp; Max 20 complaints per batch</div>
          {loading && <div className="spinner" style={{ margin: '12px auto 0' }} />}
        </div>
      </div>

      {error && <div className="error-box">⚠️ {error}</div>}

      {results.length > 0 && (
        <>
          {/* Summary strip */}
          <div className="card">
            <div className="section-title">📊 Batch Summary — {results.length} complaint{results.length !== 1 ? 's' : ''}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {Object.entries(summary).sort((a,b) => b[1]-a[1]).map(([cat, cnt]) => (
                <span key={cat} style={{
                  fontSize: 12, fontWeight: 600,
                  background: 'var(--bg-card2)',
                  border: '1px solid var(--border)',
                  borderRadius: 99, padding: '3px 12px',
                  color: 'var(--text)',
                }}>
                  {ICONS[cat]} {cat} <span style={{ color: 'var(--accent)' }}>×{cnt}</span>
                </span>
              ))}
            </div>
            <button className="export-btn" onClick={exportCSV}>
              📥 Export results as CSV
            </button>
          </div>

          {/* Per-complaint results */}
          <div className="pdf-results">
            {results.map((r, i) => {
              const pct       = (r.confidence * 100).toFixed(1)
              const confClass = r.confidence >= 0.80 ? 'conf-high' : r.confidence >= 0.60 ? 'conf-mid' : 'conf-low'
              return (
                <div key={i} className="pdf-result-item">
                  <div className="pdf-result-icon">{ICONS[r.predicted_category] || '📄'}</div>
                  <div className="pdf-result-body">
                    <div className="pdf-result-title">#{i + 1} — {r.predicted_category}</div>
                    <div className="pdf-result-sub" style={{ marginTop: 3 }}>
                      {r.text.slice(0, 140)}{r.text.length > 140 ? '…' : ''}
                    </div>
                  </div>
                  <span className={`pdf-result-badge conf-badge ${confClass}`}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {results.length === 0 && !loading && !error && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 24px' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No file uploaded yet</div>
          <div style={{ fontSize: 12 }}>Upload a PDF or text file to batch-classify multiple complaints at once</div>
        </div>
      )}
    </div>
  )
}