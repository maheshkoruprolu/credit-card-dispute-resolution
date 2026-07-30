"""
Severity Scorer — rule-based complaint severity scoring 0–10
Fast, no ML or API needed.
"""

import re

CATEGORY_BASE = {
    "Merchant Fraud":           4,
    "Unauthorized Transaction": 3,
    "Goods Not Received":       2,
    "Service Not Provided":     2,
    "Duplicate Charge":         1,
    "Billing Error":            1,
}

def _max_dollar(text: str) -> float:
    amounts = re.findall(r'\$\s*([\d,]+(?:\.\d{1,2})?)', text)
    return max((float(a.replace(",", "")) for a in amounts), default=0.0)

def score_complaint(complaint_text: str, predicted_category: str) -> dict:
    text    = complaint_text.lower()
    score   = 0
    factors = []

    # Category base
    base = CATEGORY_BASE.get(predicted_category, 1)
    score += base
    factors.append(f"{predicted_category} (+{base})")

    # Dollar amount
    amt = _max_dollar(complaint_text)
    if amt >= 1000:
        score += 3; factors.append(f"High amount ${amt:,.0f} (+3)")
    elif amt >= 200:
        score += 2; factors.append(f"Amount ${amt:,.0f} (+2)")
    elif amt > 0:
        score += 1; factors.append(f"Amount ${amt:,.0f} (+1)")

    # Repeated / ongoing
    if any(s in text for s in ["months", "weeks", "multiple times", "again",
                                 "still", "keep charging", "repeatedly",
                                 "ongoing", "never resolved", "several times"]):
        score += 1; factors.append("Ongoing issue (+1)")

    # Identity / security
    if any(s in text for s in ["identity theft", "police report", "social security",
                                 "account hacked", "data breach"]):
        score += 2; factors.append("Security risk (+2)")

    # Emotional distress
    if any(s in text for s in ["urgent", "desperate", "cannot afford",
                                 "emergency", "devastating", "losing money"]):
        score += 1; factors.append("Distress signals (+1)")

    # Vulnerable customer
    if any(s in text for s in ["elderly", "disabled", "fixed income",
                                 "retirement", "pension"]):
        score += 1; factors.append("Vulnerable customer (+1)")

    score = min(score, 10)

    if score >= 8:   level, color = "URGENT", "#9b2c2c"
    elif score >= 5: level, color = "HIGH",   "#e53e3e"
    elif score >= 3: level, color = "MEDIUM", "#ed8936"
    else:            level, color = "LOW",    "#48bb78"

    return {"score": score, "level": level, "color": color, "factors": factors}