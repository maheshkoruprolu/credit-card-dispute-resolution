# Category Mapping

This document defines deterministic mapping rules to convert CFPB `issue` and `sub_issue` fields into standardized labels used for machine learning:

- transaction_category (Primary Dispute Type)
- resolution_category (Investigation Outcome)

These mappings provide consistent weak supervision and reduce noise in training data.

## 1. Mapping Strategy

- Primary mapping is driven by `issue`.
- Refinement is done using `sub_issue`.
- If ambiguity remains, `complaint_text` is used for final disambiguation (semantic/LLM layer).

## 2. transaction_category mapping

### 2.1 Unauthorized Transaction
Conditions (match any):
- `issue` contains "Fraud or Scam" or "Unauthorized Transactions"
- `sub_issue` contains "Stolen card", "Card not present fraud", or "Identity theft"

### 2.2 Billing Error
Conditions (match any):
- `issue` contains "Billing disputes" or "Incorrect charges"
- `sub_issue` contains "Double billing", "Incorrect fee", or "Interest charge dispute"

### 2.3 Goods Not Received
Conditions (both required):
- `issue` contains "Problem with purchase"
- `sub_issue` contains "Product not received" or "Item not delivered"

### 2.4 Service Not Provided
Conditions (match any):
- `issue` contains "Services not rendered"
- `sub_issue` contains "Cancelled service not refunded" or "Service agreement not honored"

### 2.5 Merchant Fraud
Conditions (match any):
- `issue` contains "Fraudulent merchant activity"
- `sub_issue` contains "Fake merchant", "Unauthorized merchant enrollment", or "Misleading merchant"

### 2.6 Dispute Investigation Issue
Conditions (match any):
- `issue` contains "Credit card dispute resolution"
- `sub_issue` contains "Investigation delay", "Bank did not investigate", or "Dispute not resolved properly"

### 2.7 Fallback Rule
If no mapping matches, set:

transaction_category = "Other / Unclassified"

## 3. resolution_category mapping

This label captures the outcome of the dispute handling process.

### 3.1 Resolved in Favor of Customer
Conditions (match any):
- `company_response` contains "Refunded", "Reversed charge", or "Customer credited"

### 3.2 Resolved in Favor of Bank
Conditions (match any):
- `company_response` contains "Charge is valid", "No error found", or "Denied claim"

### 3.3 Partially Resolved
Conditions (match any):
- `company_response` contains "Partial refund" or "Partial adjustment"

### 3.4 Investigation Ongoing
Conditions (both required):
- `timely_response` = "Yes"
- `company_response` contains "In progress" or "Under review"

### 3.5 No Relief Provided
Conditions (match any):
- `company_response` contains "No adjustment made" or "No refund issued"

### 3.6 Fallback Rule
If no condition matches, set:

resolution_category = "Unknown / Unclassified"

## 4. Labeling Priority Rules

When multiple categories match, use these priorities.

Priority order (transaction_category):
1. Unauthorized Transaction
2. Merchant Fraud
3. Billing Error
4. Goods Not Received
5. Service Not Provided
6. Dispute Investigation Issue

Priority order (resolution_category):
1. Resolved in Favor of Customer
2. Partially Resolved
3. No Relief Provided
4. Resolved in Favor of Bank
5. Investigation Ongoing

## 5. Notes

- `issue` and `sub_issue` are treated as weak supervision signals.
- `complaint_text` is used for final disambiguation in advanced pipeline (LLM layer).
- Rules are deterministic and explainable; fallback categories prevent data loss during preprocessing.