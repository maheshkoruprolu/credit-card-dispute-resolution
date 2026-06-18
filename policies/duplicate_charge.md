# Duplicate Charge Policy

## Purpose
This policy applies when a cardholder claims they were billed multiple times for a single authorized transaction or a single purchase of goods/services.

## Required Evidence
**Customer must provide:**
* Credit card statement highlighting both identical transactions.
* Order confirmation or single receipt matching the legitimate transaction.
* Correspondence with the merchant showing an explicit request for a reversal or credit for the second charge.

**Merchant may provide:**
* Separate invoice numbers, separate tracking IDs, or separate fulfillment receipts indicating two distinct orders were placed.
* Proof that the customer explicitly purchased a multi-item package or authorized subsequent recurring charges.

## Investigation Process
1.  **Transaction Comparison:** Verify if the transaction amount, currency, merchant ID, and processing dates are identical or nearly identical (within 2–3 business days).
2.  **Authorization Code Review:** Check the explicit Authorization Codes (Auth Codes) from the network logs. If they share the exact same Auth Code, it is a processing error. If they have different Auth Codes, they are two separate charges.
3.  **Merchant Query:** Request the merchant to provide documentation showing that two separate contracts, items, or services were fulfilled.

## Resolution Rules
* **If transaction logs show the exact same Authorization Code used twice:**
    * *Recommendation:* Approve chargeback. This represents a clear system or settlement duplication.
* **If the merchant proves two distinct items were ordered, packaged, and shipped/delivered separately:**
    * *Recommendation:* Reject dispute. Inform the customer that both charges correspond to separate purchases.
* **If the merchant cannot provide a distinct invoice, receipt, or separate tracking info for the secondary charge:**
    * *Recommendation:* Approve chargeback.

## Risk Factors
* Batched transaction settlement issues where a merchant system retries failed settlements automatically.
* Vague or identical descriptions on the billing statement.

## Analyst Notes
Always verify the terminal ID and Authorization Code. If they match completely, it is universally resolved in favor of the cardholder without requiring deeper merchant evidence.