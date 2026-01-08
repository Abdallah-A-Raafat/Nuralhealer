# API Integration Contract v0.4

## Parties
- **AI Team**: Mariam Raafat (`MariamRaafatMohamed`) & Mohamed Ashraf (`MohamedAchraf22`)
- **Backend Developer**: Ahmed Adel (`dolamasa1`)

## Contract Date
**January 8, 2026**

## Contract Scope
This contract governs the integration between AI service (FastAPI) and backend (Java Spring Boot). Changes to the interface break the contract.

## Critical Requirement
**The `query_database()` function must return exactly:**
```python
{
    "answer": "The direct answer only, no intros like 'الاجابة الخاصة بالموديل...'",
    "sources": ["source1", "source2", ...]
}
```

**Important**: The response must start directly with the answer. No introductory phrases.

## AI Service Obligations

### Fixed Code Blocks (DO NOT MODIFY)
```python
# Block 1: Tunnel setup
from pyngrok import ngrok
ngrok.set_auth_token("35fNhA4DREuRzilALnmoJCdh1vz_6Jkw5BpNnuMH2CU8Risyn")
ngrok.kill()
import os
os.system('pkill -f uvicorn')
os.system('pkill -f ngrok')
```

```python
# Block 2: FastAPI endpoint (keep structure)
@app.post("/ask")
def ask_question(req: AskRequest):
    return query_database(req.question)  # Uses existing query_database function
```

### Response Format Contract
`query_database()` **must** return the exact JSON structure shown above.

**Breaking the contract** (changing this format or adding intros) will halt the entire environment: AI, backend, and frontend services.

## Note on Implementation
- **Internal changes** to `query_database()` are allowed
- **Output format** must remain exactly as specified
- **No introductory text** in the answer field

## Version Policy
- Current: `v0.4`
- Updates within `v0.4.xxx` for communication-based changes
- Major changes require new contract version

## Integration Flow
1. AI runs notebook → gets ngrok URL
2. Backend calls `POST /ask` with `{"question": "..."}`
3. AI responds with the exact format above
4. Backend processes `answer` and `sources`