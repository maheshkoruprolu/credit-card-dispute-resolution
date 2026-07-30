🔹 Layer 1: Understand the dispute type (WHAT happened?)

Examples:

Unauthorized Transaction
Billing Error
Goods Not Received
Service Not Provided
Merchant Fraud
🔹 Layer 2: Understand bank handling (HOW bank responded?)

Examples:

Resolved
Not Resolved / Investigation Failed
Delayed Response
Insufficient Investigation
🔹 Layer 3: Generate action (WHAT should happen next?)

This comes later (RAG + LLM stage)

Example:

“Request merchant proof of delivery”
“Escalate chargeback under fraud code”
“Ask for transaction authentication logs”

📌 TRANSACTION CATEGORIES (FINAL LOCK)

We will freeze these:

1. Unauthorized Transaction
fraud
stolen card
no authorization
2. Billing Error
wrong amount
duplicate charge (can still overlap but primary billing issue)
3. Goods Not Received
product not delivered
shipped but not received
4. Service Not Provided
tickets unusable
subscription not activated
service not delivered
5. Merchant Fraud
scam
fake merchant
misleading business
📌 RESOLUTION CATEGORIES (NEW IMPORTANT LAYER)

Based on your dataset:

1. Resolved
monetary relief
explanation with fix
2. Not Resolved / Investigation Failed
“could not find error”
“denied claim”
“no adjustment made”
3. Delayed / Pending
in progress
unresolved