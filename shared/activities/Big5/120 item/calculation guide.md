### README: IPIP-NEO-120 Technical Calculation Guide

This guide outlines the dual-layer scoring system for the IPIP-NEO-120. It differentiates between calculating the **30 Specific Facets** and the **5 Broad Domains**.

---

### 1. The Response Scale

Users rate items on a 5-point Likert scale.

* **1:** Very Inaccurate
* **2:** Moderately Inaccurate
* **3:** Neither Accurate nor Inaccurate
* **4:** Moderately Accurate
* **5:** Very Accurate

---

### 2. Scoring Gate (Keying Logic)

Before summing, individual item responses must be processed based on their **Keying** variable.

* **Positive (+) Keyed:** 
* **Negative (-) Keyed:** 
*(Example: A user selects "5" on a  item; the calculated score is .)*

---

### 3. Layer 1: Facet Calculations (The 30 Sub-Scores)

Each of the 30 facets is calculated using exactly **4 specific items**. These items follow a "Modulo 30" pattern ().

**Example Facet Mapping:**

* **N1 Anxiety:** Items 1, 31, 61, 91
* **E1 Friendliness:** Items 2, 32, 62, 92
* **C6 Cautiousness:** Items 30, 60, 90, 120

> **Calculation:** 
> *Range: 4 (Low) to 20 (High)*

---

### 4. Layer 2: Domain Calculations (The Big Five)

The 5 Broad Domains are calculated by summing their respective **6 facets** (Total of 24 items per domain). They follow a "Modulo 5" pattern ().

| Domain | Item Numbers (Every 5th Item) | Total Items |
| --- | --- | --- |
| **Neuroticism (N)** | 1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 91, 96, 101, 106, 111, 116 | 24 |
| **Extraversion (E)** | 2, 7, 12, 17, 22, 27, 32, 37, 42, 47, 52, 57, 62, 67, 72, 77, 82, 87, 92, 97, 102, 107, 112, 117 | 24 |
| **Openness (O)** | 3, 8, 13, 18, 23, 28, 33, 38, 43, 48, 53, 58, 63, 68, 73, 78, 83, 88, 93, 98, 103, 108, 113, 118 | 24 |
| **Agreeableness (A)** | 4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64, 69, 74, 79, 84, 89, 94, 99, 104, 109, 114, 119 | 24 |
| **Conscientiousness (C)** | 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120 | 24 |

> **Calculation:** 
> *Range: 24 (Low) to 120 (High)*

---

### 5. Special Cases & Exceptions

* **Missing Data:** Assign "3" (Neutral) for missing items, though complete data is preferred.
* **The Factor 4 Direction:** In this 120-item version, Factor 4 is **Neuroticism**. Unlike the 50-item "Emotional Stability" version, a **High Score** here indicates **High Distress/Anxiety**.
* **Percentiles:** Raw scores (24–120) are usually converted to percentiles based on age/gender norms. For raw comparisons:
* **Low:** 24 – 55
* **Average:** 56 – 88
* **High:** 89 – 120



---

### 6. JSON Structure Reference

```json
{
  "test_name": "IPIP-NEO-120",
  "scoring_logic": "Domain = Sum of 24 keyed items; Facet = Sum of 4 keyed items",
  "items": [
    {
      "id": 1, 
      "text": "Worry about things.", 
      "domain": "Neuroticism", 
      "facet": "N1-Anxiety", 
      "keying": "+"
    },
    {
      "id": 9, 
      "text": "Use others for my own ends.", 
      "domain": "Agreeableness", 
      "facet": "A2-Morality", 
      "keying": "-"
    }
  ]
}

```

**Would you like me to map out the exact Item IDs for each of the 30 Facets in a table for your documentation?**