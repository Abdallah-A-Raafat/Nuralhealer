### README: IPIP-50 Scoring Logic and Variable Documentation

This document provides the technical specifications for calculating Big Five personality scores using the provided **50-item IPIP JSON** dataset.

---

### **1. JSON Variable Definitions**

Within the JSON structure, each item object contains four key-value pairs that are essential for the calculation engine:

* **`id`**: The sequence number of the question (1 through 50).
* **`text`**: The actual psychological statement presented to the user.
* **`factor`**: An integer (1–5) identifying which of the Big Five domains the item measures.
* **`keying`**: A string (`+` or `-`) indicating the relationship between the response and the trait.
* **`+` (Positive Keying)**: Agreement with the statement indicates a *higher* level of that trait.
* **`-` (Negative Keying)**: Agreement with the statement indicates a *lower* level of that trait.



---

### **2. The Calculation Algorithm**

To calculate the final scores, the system must process raw user responses (rated 1 to 5) through a "Scoring Gate" before summing them.

#### **Step A: Value Assignment (The Scoring Gate)**

The raw response from the user must be converted into a **Point Value** based on the `keying` variable.

| Raw User Response | + Keyed Point Value | - Keyed Point Value (Reverse) |
| --- | --- | --- |
| 1 (Very Inaccurate) | 1 | **5** |
| 2 (Moderately Inaccurate) | 2 | **4** |
| 3 (Neither) | 3 | **3** |
| 4 (Moderately Accurate) | 4 | **2** |
| 5 (Very Accurate) | 5 | **1** |

> **Mathematical Formula for Reverse Keying:** > For any `-` keyed item, the point value is calculated as: 

#### **Step B: Summation by Factor**

Once the Point Values are determined, group them by their `factor` ID and sum them. Each factor consists of exactly **10 items**.

---

### **3. Final Variables (The Results)**

The final output will generate five total scores. In the 50-item version, these variables represent:

| Variable | Factor Name | Description | Min/Max Score |
| --- | --- | --- | --- |
| **Factor 1** | Extraversion | Level of engagement with the external world. | 10 — 50 |
| **Factor 2** | Agreeableness | Level of concern for social harmony and others. | 10 — 50 |
| **Factor 3** | Conscientiousness | Level of self-discipline and organization. | 10 — 50 |
| **Factor 4** | **Emotional Stability** | The inverse of Neuroticism (High = Calm). | 10 — 50 |
| **Factor 5** | Openness to Experience | Openness to ideas, art, and complex concepts. | 10 — 50 |

---

### **4. Example Calculation**

If a user responds to **Item 2** ("Feel little concern for others") with a **5 (Very Accurate)**:

1. Check JSON: Item 2 has `"factor": 2` and `"keying": "-"`.
2. Apply Reverse Logic: .
3. Result: The user receives **1 point** toward their total **Agreeableness** score for that item.

**Would you like me to generate a summary of how these 1-50 scores translate into "Low, Average, and High" percentiles for a final report?**