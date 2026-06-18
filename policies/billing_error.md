# Billing Error Policy

## Purpose
This policy applies when a cardholder acknowledges participating in a transaction but disputes the final billed amount, an incorrect currency conversion, a mathematical error, or an uncredited return/refund.

## Required Evidence
**Customer must provide:**
* Original sales receipt or initial contract showing the agreed-upon price.
* Return receipt or credit slip if the dispute concerns a missing refund credit.
* Detailed calculation outlining the exact discrepancy amount.

**Merchant may provide:**
* Final itemized invoice or dynamic pricing terms agreed upon by the cardholder.
* Proof that a refund credit was already processed to the cardholder's account (ARN - Acquisition Reference Number).
* Evidence explaining the difference (e.g., standard added taxes, shipping costs, or authorized tips/gratuities).

## Investigation Process
1.  **Amount Reconciliation:** Reconcile the initial authorization amount against the final cleared amount.
2.  **Refund History Check:** Check pending and settled credits on the cardholder's account matching the merchant ID for up to 15 days post-return.
3.  **Tax & Fee Verification:** Audit the transaction line items to see if additional elements like local VAT, delivery surcharges, or foreign transaction fees explain the discrepancy.

## Resolution Rules
* **If the customer provides a valid refund slip and no credit appears on the statement within 15 days:**
    * *Recommendation:* Approve chargeback for the credit amount.
* **If the merchant demonstrates that the price variance matches explicitly disclosed terms (such as tips, local taxes, or shipping fees):**
    * *Recommendation:* Reject dispute.
* **If a clear mathematical or clerical error is visible on the invoice face (e.g., charging for 10 units instead of 1 requested):**
    * *Recommendation:* Approve partial chargeback matching the overbilled amount.

## Risk Factors
* Hospitality and car rental charges where incidental holds or fuel charges are appended post-facto.
* Cross-border e-commerce where currency fluctuations occur between authorization and settlement.

## Analyst Notes
When adjusting for billing errors, always calculate the precise partial credit required. Do not charge back the entire transaction if only a sub-component or specific fee is inaccurate.