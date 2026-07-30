import CategoryBar from './CategoryBar'

const ICONS = {
  'Unauthorized Transaction': '🚨',
  'Billing Error':            '📋',
  'Duplicate Charge':         '🔁',
  'Goods Not Received':       '📦',
  'Service Not Provided':     '🚫',
  'Merchant Fraud':           '⚠️',
}

// ── Severity section ──────────────────────────────────────────────────────────
function SeveritySection({ severity }) {
  if (!severity) return null
  const { score, level, color, factors } = severity
  const bg = `${color}22`
  return (
    <div className="card">
      <div className="section-title">🔥 Severity Score</div>
      <div className="severity-grid">
        <div className="severity-circle" style={{ background: bg, border: `2px solid ${color}` }}>
          <span className="sev-num" style={{ color }}>{score}</span>
          <span className="sev-den" style={{ color }}>/10</span>
        </div>
        <div>
          <div className="severity-label" style={{ color }}>{level}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            Based on category, amount detected, and complaint signals
          </div>
          <div className="severity-factors">
            {factors.map(f => (
              <span key={f} className="severity-tag">{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── RAG explanation section ───────────────────────────────────────────────────
function RAGSection({ rag_explanation }) {
  if (!rag_explanation) return null
  const { summary, policy_reference, used_llm } = rag_explanation
  return (
    <div className="card">
      <div className="section-title">🧠 AI Policy Explanation</div>
      <div className="rag-summary">{summary}</div>
      <div className="rag-meta">
        <span className={`rag-badge ${used_llm ? 'llm' : 'rule'}`}>
          {used_llm ? '✦ Groq llama-3.3-70b' : '⚙ Rule-based fallback'}
        </span>
        <span className="rag-policy">📎 {policy_reference}</span>
      </div>
    </div>
  )
}

// ── Resolution section ────────────────────────────────────────────────────────
function ResolutionSection({ resolution }) {
  if (!resolution) return null
  const { action, timeline, priority, provisional_credit, required_docs } = resolution
  return (
    <div className="card">
      <div className="section-title">✅ Resolution Plan</div>

      <div className="resolution-grid">
        <div className="res-stat">
          <div className="res-stat-label">Priority</div>
          <div className={`res-stat-value priority-${priority}`}>
            {priority === 'URGENT' ? '🔴' : priority === 'HIGH' ? '🟠' : priority === 'MEDIUM' ? '🟡' : '🟢'} {priority}
          </div>
        </div>
        <div className="res-stat">
          <div className="res-stat-label">Expected Timeline</div>
          <div className="res-stat-value">⏱ {timeline}</div>
        </div>
      </div>

      <div className="card-title" style={{ marginBottom: 8 }}>Recommended action</div>
      <div className="res-action">{action}</div>

      {provisional_credit && (
        <span className="credit-badge credit-yes">✓ Provisional credit likely eligible</span>
      )}
      {!provisional_credit && (
        <span className="credit-badge credit-no">— No provisional credit for this category</span>
      )}

      {required_docs?.length > 0 && (
        <>
          <hr className="divider" />
          <div className="card-title" style={{ marginBottom: 10 }}>Required documentation</div>
          <div className="docs-list">
            {required_docs.map(doc => (
              <div key={doc} className="doc-item">{doc}</div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Export helpers ─────────────────────────────────────────────────────────────
function exportJSON(result) {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'dispute_analysis.json' })
  a.click(); URL.revokeObjectURL(url)
}

function exportText(result) {
  const c   = result.classification || result
  const sev = result.severity
  const rag = result.rag_explanation
  const res = result.resolution
  const lines = [
    '==================================================',
    '  CREDIT CARD DISPUTE ANALYSIS REPORT',
    '==================================================',
    '',
    `Category  : ${c.predicted_category}`,
    `Confidence: ${(c.confidence * 100).toFixed(1)}%`,
    `Model     : ${c.model_used}`,
    '',
  ]
  if (sev) lines.push(`Severity  : ${sev.score}/10 — ${sev.level}`, `Factors   : ${sev.factors.join(', ')}`, '')
  if (rag) lines.push('POLICY EXPLANATION', '-'.repeat(40), rag.summary, '', `Policy Ref: ${rag.policy_reference}`, `Source    : ${rag.used_llm ? 'Groq llama-3.3-70b' : 'Rule-based'}`, '')
  if (res) {
    lines.push('RESOLUTION PLAN', '-'.repeat(40),
      `Priority  : ${res.priority}`,
      `Timeline  : ${res.timeline}`,
      `Action    : ${res.action}`,
      `Provisional Credit: ${res.provisional_credit ? 'Yes' : 'No'}`,
      `Required Docs: ${res.required_docs?.join('; ') || 'N/A'}`,
    )
  }
  lines.push('', '==================================================')
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'dispute_report.txt' })
  a.click(); URL.revokeObjectURL(url)
}

// ── Main ResultCard ───────────────────────────────────────────────────────────
export default function ResultCard({ result }) {
  // Support both /predict (flat) and /predict-full (nested) responses
  const classification = result.classification || result
  const { predicted_category, confidence, all_scores, model_used } = classification
  const severity       = result.severity       || null
  const rag_explanation= result.rag_explanation|| null
  const resolution     = result.resolution     || null

  const pct       = (confidence * 100).toFixed(1)
  const confClass = confidence >= 0.80 ? 'conf-high' : confidence >= 0.60 ? 'conf-mid' : 'conf-low'
  const confLabel = confidence >= 0.80 ? `${pct}% confident` : confidence >= 0.60 ? `${pct}% — uncertain` : `${pct}% — low`

  return (
    <>
      {/* ── Classification card ── */}
      <div className="card">
        <div className="result-top">
          <div>
            <div className="result-icon">{ICONS[predicted_category] || '📄'}</div>
            <div className="result-category">{predicted_category}</div>
            <div className="result-model">via {model_used}</div>
          </div>
          <span className={`conf-badge ${confClass}`}>{confLabel}</span>
        </div>

        {all_scores?.length > 0 && (
          <CategoryBar scores={all_scores} topCategory={predicted_category} />
        )}

        {/* Export row */}
        <div className="export-bar">
          <button className="export-btn" onClick={() => exportText(result)}>
            📄 Export report (.txt)
          </button>
          <button className="export-btn" onClick={() => exportJSON(result)}>
            { } Export JSON
          </button>
          <button className="export-btn" onClick={() => window.print()}>
            🖨 Print
          </button>
        </div>
      </div>

      {/* ── Full analysis sections ── */}
      <SeveritySection    severity={severity} />
      <RAGSection         rag_explanation={rag_explanation} />
      <ResolutionSection  resolution={resolution} />
    </>
  )
}