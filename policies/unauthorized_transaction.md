# Unauthorized Transaction Policy

## Purpose
This policy applies when a cardholder claims they did not authorize, participate in, or benefit from a specific transaction charged to their credit card account.

## Required Evidence
**Customer must provide:**
* Written cardholder declaration or affidavit of unauthorized use.
* Confirmation that the card was lost, stolen, or remained in their possession at the time of the transaction.
* Police report filed for stolen identity or card theft (strongly recommended for high-value claims).

**Merchant may provide:**
* Proof of card presence (EMV chip data, PIN verification).
* Device fingerprinting, IP address logs, and matching geolocation data for digital goods.
* Signed delivery receipt showing delivery to the cardholder’s verified billing address.
* Evidence of previous legitimate transactions made by the same customer using the same payment credentials.

## Investigation Process
1.  **Authentication Audit:** Verify the type of cardholder authentication used (e.g., 3D Secure, PIN, Apple Pay/Google Pay biometric authentication).
2.  **Transaction History Check:** Review the account history for similar patterns, past authorized transactions with the same merchant, or sudden geographic anomalies.
3.  **Merchant Request:** Request technical access logs, shipping confirmations, and customer account profiles from the merchant.
4.  **Device & Identity Matching:** Compare customer-reported device/location information against the merchant's checkout session data.

## Resolution Rules
* **If 3D Secure (3DS) or biometric authorization was successful:**
    * *Recommendation:* Reject dispute. Liability shifts to the issuing bank or cardholder unless fraud pattern matches known system compromise.
* **If the merchant provides proof of a matching billing/shipping address and past positive history:**
    * *Recommendation:* Reject dispute. Frame as "friendly fraud" or family unauthorized use.
* **If the transaction was card-not-present (CNP) without 3DS, and the merchant cannot link the transaction to the cardholder:**
    * *Recommendation:* Approve chargeback. Liability lies with the merchant.

## Risk Factors
* Transactions occurring within minutes of a physical card being reported lost or stolen.
* Multiple rapid-fire transactions at different locations (velocity spikes).
* Digital goods purchased without secondary authentication methods.

## Analyst Notes
Analyst must strictly verify liability shift rules defined by the specific card network (Visa/Mastercard/Amex regulations for unauthorized codes) before making a final determination.