const COLORS = {
  'Unauthorized Transaction': 'var(--cat-unauth)',
  'Billing Error':            'var(--cat-billing)',
  'Duplicate Charge':         'var(--cat-dup)',
  'Goods Not Received':       'var(--cat-goods)',
  'Service Not Provided':     'var(--cat-service)',
  'Merchant Fraud':           'var(--cat-fraud)',
}
const ICONS = {
  'Unauthorized Transaction': '🚨',
  'Billing Error':            '📋',
  'Duplicate Charge':         '🔁',
  'Goods Not Received':       '📦',
  'Service Not Provided':     '🚫',
  'Merchant Fraud':           '⚠️',
}

export default function CategoryBar({ scores, topCategory }) {
  const sorted = [...scores].sort((a, b) => b.score - a.score)
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="bars-label">All category scores</div>
      {sorted.map(({ category, score }) => (
        <div key={category} className={`bar-row ${category === topCategory ? 'top' : ''}`}>
          <span className="bar-name">{ICONS[category]} {category}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{
              width: `${(score * 100).toFixed(1)}%`,
              background: COLORS[category] || 'var(--accent)',
            }} />
          </div>
          <span className="bar-pct">{(score * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}