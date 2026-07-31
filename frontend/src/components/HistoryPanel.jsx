import { useState, useEffect } from 'react'

const STORAGE_KEY = 'dispute_history'
const MAX_ITEMS   = 50

const ICONS = {
  'Unauthorized Transaction': '🚨',
  'Billing Error':            '📋',
  'Duplicate Charge':         '🔁',
  'Goods Not Received':       '📦',
  'Service Not Provided':     '🚫',
  'Merchant Fraud':           '⚠️',
}

const SEV_COLOR = {
  URGENT: '#f87171', HIGH: '#fb923c', MEDIUM: '#fbbf24', LOW: '#34d399'
}

// ── Public helpers used by App to save entries ─────────────────────────────
export function saveToHistory(complaintText, result) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const category  = result?.classification?.predicted_category || result?.predicted_category || 'Unknown'
    const confidence= result?.classification?.confidence         || result?.confidence         || 0
    const severity  = result?.severity || null
    const entry = {
      id:          Date.now(),
      timestamp:   new Date().toISOString(),
      complaintPreview: complaintText.slice(0, 120),
      category,
      confidence,
      severity:    severity ? { score: severity.score, level: severity.level } : null,
      modelUsed:   result?.classification?.model_used || result?.model_used || '',
      hasRag:      !!result?.rag_explanation,
    }
    const updated = [entry, ...existing].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (_) {}
}

export function getHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch (_) { return [] }
}

// ── Component ──────────────────────────────────────────────────────────────
export default function HistoryPanel({ onRestore, onToast }) {
  const [history, setHistory] = useState([])
  const [filter,  setFilter]  = useState('All')
  const [search,  setSearch]  = useState('')

  useEffect(() => { setHistory(getHistory()) }, [])

  function clearAll() {
    if (!window.confirm('Clear all dispute history? This cannot be undone.')) return
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
    onToast?.('History cleared', 'info')
  }

  function deleteOne(id) {
    const updated = history.filter(h => h.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setHistory(updated)
  }

  function exportHistoryCSV() {
    const header = 'Timestamp,Category,Confidence,Severity,Model,Has RAG,Preview\n'
    const rows   = history.map(h =>
      `"${h.timestamp}","${h.category}",${(h.confidence*100).toFixed(1)}%,` +
      `"${h.severity?.level || '-'}","${h.modelUsed}",${h.hasRag},"${h.complaintPreview.replace(/"/g,'""')}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'dispute_history.csv' })
    a.click(); URL.revokeObjectURL(url)
    onToast?.('History exported!', 'success')
  }

  const categories = ['All', ...Array.from(new Set(history.map(h => h.category)))]

  const filtered = history.filter(h => {
    const matchCat    = filter === 'All' || h.category === filter
    const matchSearch = !search || h.complaintPreview.toLowerCase().includes(search.toLowerCase())
                                || h.category.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // ── Stats ──
  const total      = history.length
  const avgConf    = total ? (history.reduce((s,h) => s + h.confidence, 0) / total * 100).toFixed(0) : 0
  const highSev    = history.filter(h => h.severity?.level === 'URGENT' || h.severity?.level === 'HIGH').length
  const topCat     = total ? Object.entries(
    history.reduce((acc, h) => { acc[h.category] = (acc[h.category]||0)+1; return acc }, {})
  ).sort((a,b)=>b[1]-a[1])[0]?.[0] : null

  if (total === 0) return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🕐</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>No history yet</div>
      <div style={{ fontSize: 13 }}>Every dispute you analyze in this session will appear here automatically.</div>
    </div>
  )

  return (
    <div>
      {/* Stats row */}
      <div className="metrics-row" style={{ marginBottom: 16 }}>
        <div className="metric-card">
          <div className="metric-value">{total}</div>
          <div className="metric-label">Total analyzed</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{avgConf}%</div>
          <div className="metric-label">Avg confidence</div>
        </div>
        <div className="metric-card">
          <div className="metric-value" style={{ color: 'var(--red)' }}>{highSev}</div>
          <div className="metric-label">High / Urgent</div>
        </div>
        <div className="metric-card">
          <div className="metric-value" style={{ fontSize: 13, lineHeight: 1.3 }}>{ICONS[topCat]} {topCat?.split(' ')[0]}</div>
          <div className="metric-label">Most common</div>
        </div>
      </div>

      {/* Controls */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search history…"
            style={{
              flex: 1, minWidth: 160,
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '7px 12px', outline: 'none',
            }}
          />
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '7px 12px', outline: 'none',
          }}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <button className="export-btn" onClick={exportHistoryCSV}>📥 Export CSV</button>
          <button className="export-btn" onClick={clearAll}
            style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
            🗑 Clear all
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {filtered.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24, fontSize: 13 }}>
            No results match your filter.
          </div>
        )}
        {filtered.map(h => (
          <div key={h.id} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{ICONS[h.category] || '📄'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{h.category}</span>
                  <span className={`conf-badge ${h.confidence >= 0.8 ? 'conf-high' : h.confidence >= 0.6 ? 'conf-mid' : 'conf-low'}`}
                    style={{ fontSize: 10, padding: '2px 8px' }}>
                    {(h.confidence * 100).toFixed(0)}%
                  </span>
                  {h.severity && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '2px 8px',
                      color: SEV_COLOR[h.severity.level] || 'var(--text-muted)',
                      background: `${SEV_COLOR[h.severity.level]}18`,
                      border: `1px solid ${SEV_COLOR[h.severity.level]}40`,
                    }}>
                      {h.severity.level} {h.severity.score}/10
                    </span>
                  )}
                  {h.hasRag && (
                    <span style={{ fontSize: 10, color: '#a5b4fc', background: 'rgba(99,102,241,0.12)',
                      border: '1px solid rgba(99,102,241,0.25)', borderRadius: 99, padding: '2px 8px', fontWeight: 600 }}>
                      ✦ RAG
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {h.complaintPreview}{h.complaintPreview.length >= 120 ? '…' : ''}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 5 }}>
                  {new Date(h.timestamp).toLocaleString()} · {h.modelUsed}
                </div>
              </div>
              <button onClick={() => deleteOne(h.id)} title="Remove"
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)',
                         cursor: 'pointer', fontSize: 16, flexShrink: 0, padding: 4 }}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}