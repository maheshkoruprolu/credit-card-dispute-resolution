# Dataset Schema
## Overview

This document describes the structure of the processed dataset used in the Credit Card Dispute Intelligence System.

The dataset is derived from the Consumer Financial Protection Bureau (CFPB) Consumer Complaint Database after filtering for credit card related complaints and applying preprocessing and labeling logic.

---

# Dataset
| Column | Data Type | Description |
|--------|-----------|-------------|
| complaint_id | Integer | Unique complaint identifier assigned by CFPB. |
| date_received | Date | Date on which CFPB received the complaint. Used for trend analysis and reporting. |
| complaint_text | Text | Consumer's complaint narrative. This is the primary input to the AI system. |
| product | String | Financial product associated with the complaint (e.g., Credit Card / Prepaid Card). |
| sub_product | String | Specific subtype of the financial product. |
| issue | String | High-level CFPB complaint category. |
| sub_issue | String | Detailed CFPB complaint category used for weak supervision and labeling. |
| company | String | Financial institution or credit card issuer receiving the complaint. |
| company_response | String | Company's official response to the complaint. |
| timely_response | Boolean / String | Indicates whether the company responded within the required timeframe (Yes/No). |
| transaction_category | String | AI-generated primary dispute category used for model training (Target Variable). |
| resolution_category | String | AI-generated label indicating investigation or resolution outcome status (Target Variable). |

---

# Target Variables
## transaction_category

Represents the primary dispute type identified from the customer's complaint.

Possible values:

- Unauthorized Transaction
- Billing Error
- Goods Not Received
- Service Not Provided
- Merchant Fraud
- Dispute Investigation Issue


## resolution_category

Represents the outcome or status of the dispute investigation process handled by the financial institution.

Possible values:

- Resolved in Favor of Customer
- Resolved in Favor of Bank
- Partially Resolved
- Investigation Ongoing
- No Relief Provided


---

# Data Flow

Raw CFPB Dataset

↓

Data Cleaning

↓

Feature Selection

↓

Label Creation

↓

Gold Dataset

↓

Machine Learning Model

↓

RAG Policy Retrieval System

↓

Dispute Recommendation Engine

---

# Notes
- The original CFPB issue and sub_issue fields are retained as weak supervision signals for labeling consistency.
- complaint_text is the primary input for NLP and LLM-based classification.
- transaction_category is the main prediction target for dispute type classification.
- resolution_category captures the investigation outcome for secondary modeling tasks.
- date_received enables time-series analysis such as fraud spikes, seasonal patterns, and issuer behavior trends.