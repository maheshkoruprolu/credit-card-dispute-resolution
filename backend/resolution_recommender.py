from typing import Dict


def recommend_resolution(category: str, severity_score: int) -> Dict[str, object]:
    """Return a structured resolution recommendation for a dispute category."""
    if category == "Unauthorized Transaction":
        action = "Initiate chargeback investigation and review cardholder authentication evidence"
        timeline = "3-10 business days"
        required_docs = ["Transaction receipt", "Cardholder declaration", "Police report if applicable"]
        priority = "URGENT" if severity_score >= 8 else "HIGH"
        provisional_credit = True
    elif category == "Merchant Fraud":
        action = "Escalate to fraud team and block further merchant activity"
        timeline = "1-3 business days"
        required_docs = ["Merchant screenshots", "Proof of counterfeit or misrepresentation", "Police report if available"]
        priority = "URGENT"
        provisional_credit = True
    elif category == "Duplicate Charge":
        action = "Reverse duplicate transaction and confirm refund posting"
        timeline = "2-5 business days"
        required_docs = ["Statement showing duplicate transactions", "Order confirmation"]
        priority = "MEDIUM" if severity_score < 5 else "HIGH"
        provisional_credit = False
    elif category == "Billing Error":
        action = "Reconcile billed amount and issue correction or partial refund"
        timeline = "3-7 business days"
        required_docs = ["Original invoice", "Refund or return receipt"]
        priority = "MEDIUM" if severity_score < 5 else "HIGH"
        provisional_credit = False
    elif category == "Goods Not Received":
        action = "Approve claim pending delivery evidence or issue refund"
        timeline = "5-10 business days"
        required_docs = ["Order confirmation", "Tracking information"]
        priority = "HIGH"
        provisional_credit = False
    else:
        action = "Review merchant communication and process service recovery options"
        timeline = "5-10 business days"
        required_docs = ["Service agreement", "Cancellation evidence"]
        priority = "MEDIUM"
        provisional_credit = False

    return {
        "category": category,
        "action": action,
        "timeline": timeline,
        "required_docs": required_docs,
        "priority": priority,
        "provisional_credit": provisional_credit,
    }
