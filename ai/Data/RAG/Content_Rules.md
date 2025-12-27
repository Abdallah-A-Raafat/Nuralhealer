---
title: RAG Content Remediation Rules
source: Nuralhealer
category: Rules
language: English
---

# RAG Content Remediation Rules

These rules serve as the **final static reference** for all RAG content processing. Strict adherence is required.

## 1. Zero Generative Text Policy (CRITICAL)
- **ABSOLUTELY NO** new text generation, summarization, or "refining" of words.
- The AI is **forbidden** from generating a single word.
- You may ONLY **delete** or **remove** content.
- If a sentence is broken by a removal, delete the fragment or the entire sentence if it cannot stand alone without adding words.

## 2. Restricted Content to Remove
Remove the following items entirely from all files:
- **"Trusted Source"**: Remove this phrase and any associated links/citations.
- **Personal Names**: Remove all mentions of doctors, authors, contributors, or specific individuals in anecdotes (e.g., "Dr. Smith says...", "Sarah felt...").
- **Personal Stories/Anecdotes**: Remove first-person narratives or case studies.
- **Specific Medication Names**: Remove proprietary or generic drug names (e.g., Prozac, Xanax, Zoloft).
- **Medication Sections**: Remove entire sections dedicated to listing specific drugs or dosage details. General mentions of "medication" as a treatment option are acceptable if they don't list specific drugs.
- **Advertisements & Affiliate Links**: Remove lines like "Healthgrades is owned by..." or "Click here to learn more".
- **Junk Text**: Remove formatting artifacts like "Table of Contents", "Key Takeaways", or "Next steps" if they are just navigational fluff.

## 3. Metadata Header Requirements
All files must start with a YAML frontmatter block formatted exactly as follows:
```markdown
---
title: [Article Title]
source: [Psych Central | Verywell Mind]
category: [Disorder Category]
language: English
---
```
- **Source**: Standardize to "Psych Central" or "Verywell Mind". Remove "Medical News Today" or others if present, defaulting to one of the preferred sources. or any advertisement text.
- **Category**: Use the specific disorder category (e.g., "Depression", "Anxiety", "Treatments").

## 4. Folder Purpose Definitions
- **Related**: Contains files describing specific relationships between different disorders (e.g., "Anxiety vs Depression").
- **Treatments**: Contains files detailing treatment protocols/options.
