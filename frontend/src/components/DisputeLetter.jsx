import { useState } from 'react'

const REGULATIONS = {
  'Unauthorized Transaction': 'Regulation E (Electronic Fund Transfers Act, 15 U.S.C. § 1693) and the Fair Credit Billing Act (FCBA)',
  'Billing Error':            'the Fair Credit Billing Act (FCBA), 15 U.S.C. § 1666',
  'Duplicate Charge':         'the Fair Credit Billing Act (FCBA), 15 U.S.C. § 1666(b)',
  'Goods Not Received':       'the Fair Credit Billing Act (FCBA), 15 U.S.C. § 1666(b)(3)',
  'Service Not Provided':     'the Fair Credit Billing Act (FCBA), 15 U.S.C. § 1666(b)(3)',
  'Merchant Fraud':           'Regulation E and the Fair Credit Billing Act (FCBA), 15 U.S.C. § 1666',
}

const OPENING = {
  'Unauthorized Transaction': 'I am writing to formally dispute an unauthorized transaction that appeared on my credit card account. I did not authorize, initiate, or benefit from this charge, and I am requesting an immediate investigation and full reversal.',
  'Billing Error':            'I am writing to formally dispute a billing error on my credit card account. The amount charged does not reflect the agreed-upon price, and I am requesting a correction and refund of the overcharged amount.',
  'Duplicate Charge':         'I am writing to formally dispute a duplicate charge on my credit card account. The same transaction was processed twice, and I am requesting the removal of the erroneous duplicate charge.',
  'Goods Not Received':       'I am writing to formally dispute a charge for goods that were never delivered. Despite completing payment, I have not received the ordered merchandise, and I am requesting a full chargeback.',
  'Service Not Provided':     'I am writing to formally dispute charges for a service that was not provided following my confirmed cancellation. These charges continued without authorization, and I am requesting a full refund.',
  'Merchant Fraud':           'I am writing to formally dispute a charge involving a fraudulent merchant. The merchant misrepresented their business, and I received no goods or services in exchange for the payment.',
}

const RIGHTS = {
  'Unauthorized Transaction': 'Under Regulation E, I have the right to a provisional credit within 10 business days while the investigation is ongoing. My liability for unauthorized electronic transactions is limited to $50 if reported within 2 business days.',
  'Billing Error':            'Under the FCBA, you are required to acknowledge my dispute within 30 days and resolve it within two billing cycles (no more than 90 days). During this period, you may not report the disputed amount as delinquent.',
  'Duplicate Charge':         'Under the FCBA, duplicate charges constitute a billing error and must be resolved within two billing cycles. You must acknowledge this dispute in writing within 30 days.',
  'Goods Not Received':       'Under the FCBA, failure to deliver goods as agreed constitutes a billing error. I am entitled to a chargeback if the merchant cannot provide proof of delivery.',
  'Service Not Provided':     'Under the FCBA, charges for services not rendered after a confirmed cancellation constitute a billing error. I am entitled to a full refund of all unauthorized post-cancellation charges.',
  'Merchant Fraud':           'Under the FCBA and Regulation E, I am entitled to a full chargeback for fraudulent merchant transactions. I request that this merchant be flagged in your system to protect other cardholders.',
}

function generateLetter({ complaintText, category, resolution, severity }) {
  const today    = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const reg      = REGULATIONS[category] || 'applicable consumer protection laws'
  const opening  = OPENING[category]     || 'I am writing to formally dispute a charge on my credit card account.'
  const rights   = RIGHTS[category]      || 'I request that you investigate and resolve this dispute promptly.'
  const timeline = resolution?.timeline  || '5-10 business days'
  const docs     = resolution?.required_docs || []
  const priority = resolution?.priority  || 'MEDIUM'

  return `${today}

Credit Card Dispute Resolution Department
[Your Bank Name]
[Bank Address]

Re: Formal Dispute — ${category}
Account Number: XXXX-XXXX-XXXX-[Last 4 digits]
Priority Level: ${priority}

To Whom It May Concern,

${opening}

DESCRIPTION OF DISPUTE:
${complaintText}

LEGAL BASIS:
I am filing this dispute pursuant to ${reg}. ${rights}

REQUESTED RESOLUTION:
I respectfully request the following actions be taken within ${timeline}:
1. Initiate a formal investigation into this transaction immediately
2. Issue a provisional credit to my account pending the investigation${resolution?.provisional_credit ? ' (to which I am entitled under applicable law)' : ''}
3. Provide written confirmation of the steps being taken to resolve this matter
4. Reverse the disputed charge upon completion of the investigation

${docs.length > 0 ? `SUPPORTING DOCUMENTATION:
I am prepared to provide the following documentation upon request:
${docs.map((d, i) => `${i + 1}. ${d}`).join('\n')}

` : ''}SEVERITY ASSESSMENT:
This dispute has been assessed as ${severity?.level || 'MEDIUM'} priority (severity score: ${severity?.score ?? 'N/A'}/10) based on the nature of the claim and applicable regulatory requirements.

I expect written acknowledgment of this dispute within 30 days as required by law. Failure to investigate and resolve this matter may result in a complaint filed with the Consumer Financial Protection Bureau (CFPB) and relevant state regulatory authorities.

Please contact me at the information associated with my account to discuss this matter further.

Sincerely,

[Your Full Name]
[Your Address]
[Your Phone Number]
[Your Email Address]

---
This letter was prepared with assistance from an automated dispute resolution system trained on CFPB complaint data.
Reference: ${category} | Generated: ${today}`
}

export default function DisputeLetter({ result, complaintText, onToast }) {
  const [open,    setOpen]    = useState(false)
  const [copied,  setCopied]  = useState(false)
  const [editing, setEditing] = useState(false)
  const [letter,  setLetter]  = useState('')

  const category   = result?.classification?.predicted_category || result?.predicted_category
  const resolution = result?.resolution
  const severity   = result?.severity

  function handleOpen() {
    setLetter(generateLetter({ complaintText, category, resolution, severity }))
    setOpen(true)
    setEditing(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(letter).then(() => {
      setCopied(true)
      onToast?.('Letter copied to clipboard!', 'success')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleDownload() {
    const blob = new Blob([letter], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), {
      href: url, download: `dispute_letter_${(category||'').replace(/\s+/g,'_').toLowerCase()}.txt`
    })
    a.click(); URL.revokeObjectURL(url)
    onToast?.('Letter downloaded!', 'success')
  }

  if (!category) return null

  return (
    <>
      <button className="submit-btn full-btn" onClick={handleOpen}
        style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
        ✉️ Generate Formal Dispute Letter
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 14, width: '100%', maxWidth: 700, maxHeight: '90vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>✉️ Formal Dispute Letter</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {category} · Edit before sending
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="export-btn" onClick={() => setEditing(!editing)}>
                  {editing ? '👁 Preview' : '✏️ Edit'}
                </button>
                <button className="export-btn" onClick={handleCopy}>
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
                <button className="export-btn" onClick={handleDownload}>📥 Download</button>
                <button onClick={() => setOpen(false)} style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', fontSize: 22, lineHeight: 1,
                }}>×</button>
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
              {editing ? (
                <textarea value={letter} onChange={e => setLetter(e.target.value)}
                  style={{
                    width: '100%', minHeight: 520,
                    background: 'var(--bg-input)', border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--text)',
                    fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.7,
                    padding: 16, resize: 'vertical', outline: 'none',
                  }} />
              ) : (
                <pre style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8,
                  color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
                }}>{letter}</pre>
              )}
            </div>

            <div style={{
              padding: '10px 20px', borderTop: '1px solid var(--border)',
              fontSize: 11, color: 'var(--text-muted)',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>📌 Replace all bracketed [ ] placeholders before sending</span>
              <span>{letter.length} chars</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}