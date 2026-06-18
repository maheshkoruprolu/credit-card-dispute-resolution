# Merchant Fraud Policy

## Purpose
This policy applies when a cardholder alleges systemic deceptive practices by the merchant, including selling counterfeit items, operating a shell storefront, deliberate non-delivery with intent to defraud, or misrepresenting items on a massive scale.

## Required Evidence
**Customer must provide:**
* Detailed description of how the merchant deceived them.
* Third-party expert appraisal or certification confirming goods are counterfeit or fundamentally altered.
* Screenshots of the merchant's website at the time of purchase vs. what was received.
* Evidence of trying to return the fraudulent goods or contact the business.

**Merchant may provide:**
* Certificates of authenticity, supply chain verification docs, or official distribution agreements.
* Proof of legitimate business licensing and compliance checks.
* Evidence that the item matches the description perfectly and that the customer's claims are frivolous.

## Investigation Process
1.  **Merchant Risk Profiling:** Check internal and external fraud matching databases (e.g., Mastercard MATCH, Visa VMAS) to see if the merchant has elevated chargeback/fraud ratios.
2.  **Website & Domain Audit:** Perform an OSINT check on the merchant's domain age and user reviews on independent consumer protection platforms.
3.  **Evidence Verification:** Evaluate the legitimacy of any expert counterfeit certificates provided by the customer.

## Resolution Rules
* **If the merchant is on an active fraud monitoring list or the website has went offline immediately post-transaction:**
    * *Recommendation:* Approve chargeback. Flag merchant for terminal termination.
* **If the customer provides verified expert proof that an item is counterfeit:**
    * *Recommendation:* Approve chargeback. (Cardholders are legally protected from being forced to return counterfeit goods by mail).
* **If the merchant provides ironclad provenance documents and the item matches the explicit listing parameters:**
    * *Recommendation:* Reject dispute.

## Risk Factors
* Newly registered web domains with high-velocity sales.
* Prices that are unrealistically lower than market value for luxury branded goods.
* Merchants operating out of high-risk shell company jurisdictions.

## Analyst Notes
Merchant fraud claims require immediate escalation to the internal Risk and Compliance team if systemic patterns across multiple cardholders are discovered. Speed is critical to mitigate overall portfolio exposure.