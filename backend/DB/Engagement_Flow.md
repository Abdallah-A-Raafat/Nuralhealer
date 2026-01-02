# NeuralHealer Engagement Flow - Complete Guide

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEURALHEALER ENGAGEMENT SYSTEM                       │
│                              Complete Data Flow                              │
└─────────────────────────────────────────────────────────────────────────────┘


╔═══════════════════════════════════════════════════════════════════════════╗
║                           PHASE 1: INITIALIZATION                          ║
╚═══════════════════════════════════════════════════════════════════════════╝

┌──────────┐                                              ┌──────────┐
│  Doctor  │                                              │  Patient │
└────┬─────┘                                              └────┬─────┘
     │                                                          │
     │  1. Opens Patient Profile                               │
     │────────────────────────────►                            │
     │                                                          │
     │         System Query:                                   │
     │  ┌─────────────────────────────────────────┐           │
     │  │ SELECT relationship_status               │           │
     │  │ FROM doctor_patients                     │           │
     │  │ WHERE doctor_id = ? AND patient_id = ?   │           │
     │  └─────────────────────────────────────────┘           │
     │                                                          │
     │◄─── Result: NULL or 'NO_ACCESS'                         │
     │                                                          │
     │  [Button: Start Engagement]                             │
     │                                                          │


╔═══════════════════════════════════════════════════════════════════════════╗
║                      PHASE 2: ENGAGEMENT CREATION                          ║
╚═══════════════════════════════════════════════════════════════════════════╝

     │  2. Clicks "Start Engagement"                          │
     │────────────────────────────►                            │
     │                                                          │
     │  [Modal: Choose Access Level]                           │
     │  ○ FULL_ACCESS                                          │
     │  ○ CURRENT_ENGAGEMENT_ACCESS                            │
     │  ○ LIMITED_ENGAGEMENT_ACCESS                            │
     │                                                          │
     │  3. Selects: FULL_ACCESS                                │
     │────────────────────────────►                            │
     │                                                          │
     │         Backend Process:                                │
     │  ┌─────────────────────────────────────────┐           │
     │  │ BEGIN TRANSACTION                        │           │
     │  │                                          │           │
     │  │ INSERT INTO engagements (                │           │
     │  │   doctor_id,                             │           │
     │  │   patient_id,                            │           │
     │  │   access_rule_name = 'FULL_ACCESS',     │           │
     │  │   status = 'pending'                     │           │
     │  │ )                                        │           │
     │  │                                          │           │
     │  │ INSERT INTO engagement_verification_    │           │
     │  │ tokens (                                 │           │
     │  │   engagement_id,                         │           │
     │  │   token = random(),                      │           │
     │  │   verification_type = 'start',          │           │
     │  │   qr_code_data,                          │           │
     │  │   expires_at = NOW() + 3 minutes        │           │
     │  │ )                                        │           │
     │  │                                          │           │
     │  │ COMMIT                                   │           │
     │  └─────────────────────────────────────────┘           │
     │                                                          │


╔═══════════════════════════════════════════════════════════════════════════╗
║                       PHASE 3: 2FA VERIFICATION                            ║
╚═══════════════════════════════════════════════════════════════════════════╝

     │◄─── Returns: QR Code + Token                           │
     │                                                          │
     │  [Display QR Code]                                      │
     │  ┌────────────────┐                                     │
     │  │   ████  ████   │                                     │
     │  │   ████  ████   │                                     │
     │  │   ████  ████   │                                     │
     │  └────────────────┘                                     │
     │  "Waiting for patient..."                               │
     │                                                          │
     │                           4. Push Notification          │
     │                           ────────────────────────────► │
     │                                                          │
     │                           "Dr. Smith wants to start     │
     │                            engagement with you"         │
     │                                                          │
     │                           5. Opens App & Scans QR       │
     │                           ────────────────────────────► │
     │                                                          │
     │                           [Confirm Dialog]              │
     │                           Access Level: FULL_ACCESS     │
     │                           [Face ID Required]            │
     │                                                          │
     │                           6. Confirms with Face ID      │
     │                           ────────────────────────────► │
     │                                                          │
     │         Backend Process:                                │
     │  ┌─────────────────────────────────────────┐           │
     │  │ BEGIN TRANSACTION                        │           │
     │  │                                          │           │
     │  │ UPDATE engagement_verification_tokens   │           │
     │  │ SET status = 'verified',                │           │
     │  │     verified_by = patient_user_id,      │           │
     │  │     verified_at = NOW()                 │           │
     │  │ WHERE token = ?                          │           │
     │  │                                          │           │
     │  │ UPDATE engagements                       │           │
     │  │ SET status = 'active',                  │           │
     │  │     start_at = NOW(),                   │           │
     │  │     start_verified_at = NOW()           │           │
     │  │ WHERE id = engagement_id                │           │
     │  │                                          │           │
     │  │ COMMIT                                   │           │
     │  └─────────────────────────────────────────┘           │
     │                                                          │


╔═══════════════════════════════════════════════════════════════════════════╗
║                    PHASE 4: TRIGGER AUTOMATION                             ║
╚═══════════════════════════════════════════════════════════════════════════╝

     │         Trigger Fires Automatically:                    │
     │  ┌─────────────────────────────────────────┐           │
     │  │ update_relationship_status_on_          │           │
     │  │ engagement()                             │           │
     │  │                                          │           │
     │  │ UPDATE doctor_patients SET               │           │
     │  │   relationship_status = 'FULL_ACCESS',  │           │
     │  │   current_engagement_id = eng.id,       │           │
     │  │   relationship_started_at = NOW(),      │           │
     │  │   is_active = true                       │           │
     │  │ WHERE doctor_id = ? AND patient_id = ?  │           │
     │  │                                          │           │
     │  │ INSERT INTO engagement_messages (        │           │
     │  │   engagement_id,                         │           │
     │  │   content = '🔔 Engagement started',   │           │
     │  │   is_system_message = true               │           │
     │  │ )                                        │           │
     │  └─────────────────────────────────────────┘           │
     │                                                          │
     │◄─── WebSocket: Engagement Active                        │
     │                           ◄──────────────────────────── │
     │                                                          │
     │  ✅ Engagement Started Successfully!                    │
     │                                                          │


╔═══════════════════════════════════════════════════════════════════════════╗
║                    PHASE 5: ACTIVE ENGAGEMENT                              ║
╚═══════════════════════════════════════════════════════════════════════════╝

     │  7. Views Patient Profile                               │
     │────────────────────────────►                            │
     │                                                          │
     │         Access Control Check:                           │
     │  ┌─────────────────────────────────────────┐           │
     │  │ SELECT                                   │           │
     │  │   dp.relationship_status,                │           │
     │  │   ear.can_view_all_history,             │           │
     │  │   ear.can_view_patient_profile          │           │
     │  │ FROM doctor_patients dp                  │           │
     │  │ JOIN engagement_access_rules ear         │           │
     │  │   ON ear.rule_name = dp.relationship_   │           │
     │  │      status                              │           │
     │  │ WHERE dp.doctor_id = ?                   │           │
     │  │   AND dp.patient_id = ?                  │           │
     │  └─────────────────────────────────────────┘           │
     │                                                          │
     │◄─── Result: FULL_ACCESS granted                         │
     │                                                          │
     │  [Profile Data Loaded]                                  │
     │  - Medical History ✅                                   │
     │  - Current Medications ✅                               │
     │  - All Past Engagements ✅                              │
     │                                                          │
     │                                                          │
     │  8. Views AI Chat History                               │
     │────────────────────────────►                            │
     │                                                          │
     │         Query:                                          │
     │  ┌─────────────────────────────────────────┐           │
     │  │ SELECT * FROM                            │           │
     │  │ get_accessible_ai_chat_sessions(         │           │
     │  │   doctor_id,                             │           │
     │  │   patient_id                             │           │
     │  │ )                                        │           │
     │  │                                          │           │
     │  │ -- Rule: can_view_all_history = true    │           │
     │  │ -- Returns: ALL AI sessions              │           │
     │  └─────────────────────────────────────────┘           │
     │                                                          │
     │◄─── Shows all AI chat sessions (12 total)              │
     │                                                          │
     │  [AI Chat Sessions]                                     │
     │  - Mental Health Check (Dec 1) ✅                       │
     │  - Symptom Discussion (Nov 28) ✅                       │
     │  - Medication Questions (Nov 15) ✅                     │
     │  ...                                                     │
     │                                                          │
     │                                                          │
     │  9. Sends Message to Patient                            │
     │────────────────────────────►                            │
     │                                                          │
     │         Backend:                                        │
     │  ┌─────────────────────────────────────────┐           │
     │  │ -- Check permission                      │           │
     │  │ SELECT ear.can_message_patient           │           │
     │  │ FROM doctor_patients dp                  │           │
     │  │ JOIN engagement_access_rules ear         │           │
     │  │   ON ear.rule_name = dp.relationship_   │           │
     │  │      status                              │           │
     │  │                                          │           │
     │  │ -- If true:                              │           │
     │  │ INSERT INTO engagement_messages (        │           │
     │  │   engagement_id,                         │           │
     │  │   sender_id = doctor_user_id,           │           │
     │  │   recipient_id = patient_user_id,       │           │
     │  │   content = 'Hello, how are you?'       │           │
     │  │ )                                        │           │
     │  │                                          │           │
     │  │ -- Create notification                   │           │
     │  │ INSERT INTO notifications (...)          │           │
     │  └─────────────────────────────────────────┘           │
     │                                                          │
     │                           ◄──────────────────────────── │
     │                           10. Receives Message          │
     │                           [Push Notification]           │
     │                                                          │


╔═══════════════════════════════════════════════════════════════════════════╗
║                    PHASE 6: ENDING ENGAGEMENT                              ║
╚═══════════════════════════════════════════════════════════════════════════╝

     │  11. Clicks "End Engagement"                            │
     │────────────────────────────►                            │
     │                                                          │
     │  [Warning Dialog]                                       │
     │  Current access: FULL_ACCESS                            │
     │  After ending:                                          │
     │  ✅ Keep access to all chat history                    │
     │  ✅ Keep access to engagement periods                  │
     │                                                          │
     │  Reason: [Dropdown]                                     │
     │  ▼ Treatment completed                                  │
     │                                                          │
     │  12. Confirms End                                       │
     │────────────────────────────►                            │
     │                                                          │
     │         Backend:                                        │
     │  ┌─────────────────────────────────────────┐           │
     │  │ INSERT INTO engagement_verification_    │           │
     │  │ tokens (                                 │           │
     │  │   verification_type = 'end',            │           │
     │  │   ...                                    │           │
     │  │ )                                        │           │
     │  └─────────────────────────────────────────┘           │
     │                                                          │
     │◄─── Returns: End QR Code                                │
     │                                                          │
     │  [Display End QR Code]                                  │
     │  "Patient must confirm ending..."                       │
     │                                                          │
     │                           13. Receives Notification     │
     │                           ────────────────────────────► │
     │                                                          │
     │                           "Dr. Smith wants to end       │
     │                            engagement"                  │
     │                                                          │
     │                           14. Scans & Confirms          │
     │                           ────────────────────────────► │
     │                                                          │
     │         Backend:                                        │
     │  ┌─────────────────────────────────────────┐           │
     │  │ UPDATE engagements                       │           │
     │  │ SET status = 'ended',                   │           │
     │  │     end_at = NOW(),                     │           │
     │  │     ended_by = ?,                        │           │
     │  │     termination_reason = ?               │           │
     │  └─────────────────────────────────────────┘           │
     │                                                          │


╔═══════════════════════════════════════════════════════════════════════════╗
║                  PHASE 7: POST-ENGAGEMENT STATE                            ║
╚═══════════════════════════════════════════════════════════════════════════╝

     │         Trigger Fires:                                  │
     │  ┌─────────────────────────────────────────┐           │
     │  │ update_relationship_status_on_          │           │
     │  │ engagement()                             │           │
     │  │                                          │           │
     │  │ -- Get retention rules                   │           │
     │  │ SELECT retains_history_access            │           │
     │  │ FROM engagement_access_rules             │           │
     │  │ WHERE rule_name = 'FULL_ACCESS'         │           │
     │  │ -- Result: true                          │           │
     │  │                                          │           │
     │  │ -- Keep same status (historical access) │           │
     │  │ UPDATE doctor_patients SET               │           │
     │  │   relationship_status = 'FULL_ACCESS',  │           │
     │  │   current_engagement_id = NULL,          │           │
     │  │   relationship_ended_at = NOW(),         │           │
     │  │   is_active = true                       │           │
     │  │                                          │           │
     │  │ INSERT INTO engagement_messages (        │           │
     │  │   content = '🔔 Engagement ended',     │           │
     │  │   is_system_message = true               │           │
     │  │ )                                        │           │
     │  └─────────────────────────────────────────┘           │
     │                                                          │
     │◄─── WebSocket: Engagement Ended                         │
     │                           ◄──────────────────────────── │
     │                                                          │
     │  ✅ Engagement Ended                                    │
     │                                                          │
     │  15. Refreshes Patient Profile                          │
     │────────────────────────────►                            │
     │                                                          │
     │         Access Check:                                   │
     │  ┌─────────────────────────────────────────┐           │
     │  │ SELECT relationship_status               │           │
     │  │ FROM doctor_patients                     │           │
     │  │ -- Result: 'FULL_ACCESS'                │           │
     │  │                                          │           │
     │  │ SELECT retains_history_access            │           │
     │  │ FROM engagement_access_rules             │           │
     │  │ -- Result: true                          │           │
     │  └─────────────────────────────────────────┘           │
     │                                                          │
     │◄─── Still has access to:                                │
     │     ✅ All engagement messages                          │
     │     ✅ All AI chat history                              │
     │     ✅ Patient profile                                  │
     │     ❌ Cannot send new messages                         │
     │     ❌ Cannot modify notes                              │
     │                                                          │
     │  [UI shows "Historical Access" badge]                   │
     │                                                          │


╔═══════════════════════════════════════════════════════════════════════════╗
║                   ALTERNATIVE SCENARIOS                                    ║
╚═══════════════════════════════════════════════════════════════════════════╝

SCENARIO A: Current Engagement Access (Limited)
──────────────────────────────────────────────
If access_rule_name = 'CURRENT_ENGAGEMENT_ACCESS':

During engagement:
  ✅ See messages from start_at onward
  ✅ See AI chats from start_at onward
  ❌ Cannot see pre-engagement history

After ending:
  ❌ No access (relationship_status = 'NO_ACCESS')
  ❌ Cannot view anything


SCENARIO B: Multiple Engagements
─────────────────────────────────
Patient and Doctor have worked together before:

Engagement 1 (Jan-Feb): FULL_ACCESS → Ended
  └─► Doctor keeps historical access

Engagement 2 (Mar-Apr): CURRENT_ENGAGEMENT_ACCESS → Active
  └─► Doctor sees ONLY March-April data
  └─► Previous data from Engagement 1 hidden by current rule

When Engagement 2 ends:
  └─► relationship_status = 'NO_ACCESS'
  └─► Doctor loses ALL access (including Engagement 1)


SCENARIO C: Patient Changes Access Mid-Engagement
──────────────────────────────────────────────────
(Future feature: Allow relationship_status updates)

Current: FULL_ACCESS
Patient requests: CURRENT_ENGAGEMENT_ACCESS

Backend:
  UPDATE doctor_patients
  SET relationship_status = 'CURRENT_ENGAGEMENT_ACCESS'

Trigger fires:
  INSERT system message: "Access changed from FULL_ACCESS to CURRENT_..."

Doctor's view updates:
  ❌ Historical data hidden
  ✅ Only current engagement visible
```

## Summary Table

| Phase | Actor | Action | Database Impact | Trigger Fired |
|-------|-------|--------|-----------------|---------------|
| 1 | Doctor | Opens profile | SELECT doctor_patients | No |
| 2 | Doctor | Creates engagement | INSERT engagements (pending) | No |
| 3 | Patient | Verifies 2FA | UPDATE engagement (active) | **YES** |
| 4 | System | Auto-updates | UPDATE doctor_patients | Automatic |
| 5 | Doctor | Views data | SELECT with access control | No |
| 6 | Doctor/Patient | Ends engagement | UPDATE engagement (ended) | **YES** |
| 7 | System | Applies retention | UPDATE doctor_patients | Automatic |

## Key Takeaways

1. **Two-Factor Authentication** is required for both starting and ending engagements
2. **Triggers automatically manage** relationship_status - no manual updates needed
3. **Access rules are checked** on every data access operation
4. **Historical access** is preserved based on retention rules
5. **System messages** notify users of all engagement state changes
6. **Real-time updates** via WebSocket keep UI in sync

---

**For implementation details, see:**
- API endpoints: `API_INTEGRATION.md`
- Database structure: `DATABASE_ARCHITECTURE.md`
- SQL schema: `neuralhealer_schema.sql`