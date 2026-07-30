# Credit Card Dispute Category Definitions

## Purpose

This document defines the dispute categories used in the Credit Card Dispute Intelligence System. These definitions ensure that every complaint is labeled consistently during dataset creation and model training.

---

# 1. Unauthorized Transaction

## Definition

A transaction that the cardholder claims was never authorized or initiated by them. These cases usually involve stolen cards, compromised accounts, identity theft, or fraudulent use of payment credentials.

## Examples

- Fraudulent purchase made using a stolen card
- Unauthorized online transaction
- Unknown merchant charge
- Card used without customer permission
- Identity theft resulting in fraudulent charges
- Account takeover

## Typical Keywords

- unauthorized
- fraud
- stolen card
- identity theft
- unknown transaction
- did not authorize
- card compromised
- someone used my card

## Not Included

- Duplicate charges
- Incorrect billing amount
- Product not delivered
- Merchant refused refund
- Service quality complaints

---

# 2. Billing Error

## Definition

A transaction where the customer agrees that the purchase occurred but believes the amount billed or the billing process is incorrect.

## Examples

- Charged twice for the same purchase
- Incorrect transaction amount
- Extra fee added unexpectedly
- Incorrect tax calculation
- Billing statement error
- Duplicate charge
- Currency conversion error

## Typical Keywords

- charged twice
- duplicate charge
- overcharged
- billing error
- incorrect amount
- wrong charge
- statement error
- unexpected fee

## Not Included

- Fraudulent transactions
- Product not delivered
- Merchant scams
- Service disputes

---

# 3. Goods Not Received

## Definition

The customer paid for a physical product but never received it, or received an unusable, damaged, or completely different product.

## Examples

- Package never delivered
- Item lost during shipping
- Empty package received
- Wrong product delivered
- Damaged product that cannot be used
- Merchant never shipped the order

## Typical Keywords

- never received
- package
- shipment
- delivery
- tracking
- item missing
- damaged product
- not delivered

## Not Included

- Digital services
- Event tickets
- Hotel reservations
- Subscription problems
- Fraudulent card usage

---

# 4. Service Not Provided

## Definition

The customer paid for a service or digital product that was never delivered, activated, or made available as promised.

## Examples

- Concert tickets unusable
- Hotel reservation unavailable
- Flight cancelled without refund
- Online course inaccessible
- Streaming subscription never activated
- Software license never received
- Membership not activated
- Service cancelled after payment

## Typical Keywords

- service
- subscription
- ticket
- reservation
- hotel
- airline
- event
- membership
- digital product
- activation

## Not Included

- Physical products
- Fraudulent transactions
- Billing mistakes

---

# 5. Merchant Fraud

## Definition

The merchant intentionally misrepresented the product or service, engaged in deceptive business practices, or attempted to scam the customer.

## Examples

- Fake online store
- Counterfeit products
- Merchant disappeared after payment
- False advertising
- Scam website
- Seller intentionally deceived customer
- Fake refund promises
- Misleading product description

## Typical Keywords

- scam
- fake
- counterfeit
- fraudulent merchant
- misleading
- deceptive
- false advertisement
- merchant disappeared

## Not Included

- Unauthorized card usage
- Billing mistakes
- Shipping delays
- Genuine customer service issues

---

# 6. Dispute Investigation Issue

## Definition

The customer's primary complaint is about how the bank or credit card issuer handled the dispute investigation rather than the original transaction itself.

These complaints typically occur after a dispute has already been filed and the customer believes the investigation was inadequate, unfair, delayed, or improperly resolved.

## Examples

- Bank denied dispute without proper investigation
- Credit card company ignored submitted evidence
- Investigation took too long
- Dispute repeatedly closed without explanation
- Bank sided with merchant despite insufficient evidence
- Customer never received investigation results

## Typical Keywords

- dispute investigation
- bank denied dispute
- claim denied
- investigation failed
- dispute closed
- chargeback denied
- issuer refused
- investigation incomplete
- evidence ignored

## Not Included

- Original fraud complaints
- Duplicate charges
- Product delivery issues
- Merchant scams
- Billing calculation errors

---

# Labeling Priority

Some complaints may appear to fit multiple categories. To ensure consistency, labels should be assigned according to the following priority:

1. Unauthorized Transaction
2. Merchant Fraud
3. Goods Not Received
4. Service Not Provided
5. Billing Error
6. Dispute Investigation Issue

When multiple categories are possible, choose the category that best represents the customer's primary problem rather than secondary issues.