# NeuralHealer Database Architecture

## 📋 Table of Contents
- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [System Architecture](#system-architecture)
- [Entity Relationships](#entity-relationships)
- [Access Control Flow](#access-control-flow)
- [Database Tables](#database-tables)
- [Key Features](#key-features)
- [Performance Considerations](#performance-considerations)

---

## Overview

NeuralHealer is a healthcare platform database designed to manage doctor-patient engagements with AI-powered chat capabilities and sophisticated access control mechanisms.

### Key Characteristics
- **PostgreSQL 12+** compatible
- **Rule-based access control** for doctor-patient relationships
- **AI chat integration** with patient privacy controls
- **2FA verification** for critical engagement actions
- **Automated state management** via triggers
- **HIPAA-compliance ready** with audit logging

---

## Core Concepts

### 1. Engagement-Based Access Control

The system uses **engagement periods** to control what doctors can see:

```
Patient ←→ Engagement ←→ Doctor
              ↓
        Access Rule
              ↓
    Defines Permissions
```

**Key Principle:** Access is not permanent—it's tied to active engagements and their associated rules.

### 2. Access Rules

Each engagement references an **access rule** that defines:
- **DURING engagement:** What can the doctor see/do while engagement is active?
- **AFTER engagement:** What access remains when engagement ends?

### 3. Three Types of Data

1. **Engagement Messages** - Direct doctor-patient communication
2. **AI Chat Sessions** - Patient conversations with AI
3. **Patient Profile** - Medical history and personal data

All three are controlled by the same access rule system.

---

## System Architecture

### High-Level Data Flow

```
┌─────────────┐
│   Patient   │
└──────┬──────┘
       │
       ├─────► AI Chat Sessions (Private by default)
       │       └─► AI Chat Messages
       │
       ├─────► Creates Engagement with Doctor
       │       └─► Selects Access Rule
       │
       ▼
┌─────────────────────┐
│   2FA Verification   │ ◄─── QR Code / SMS Code
└──────────┬──────────┘
           │
           ▼
    ┌─────────────┐
    │ Engagement  │
    │   ACTIVE    │
    └──────┬──────┘
           │
           ├─► Updates: doctor_patients.relationship_status
           │
           ├─► Grants: Access based on rule
           │
           └─► Creates: engagement_messages channel
                └─► Doctor ←→ Patient Communication
```

### State Machine: Engagement Lifecycle

```
pending → active → ended → archived
   ↓         ↓        ↓        ↓
2FA      Access   Access   Cleanup
Required  Live    Updated  Executed
```

---

## Entity Relationships

### Core Entities

```
users (1) ──────┬──────► (1) doctor_profiles
                │
                └──────► (1) patient_profiles


doctor_profiles (M) ────┬───► (M) patient_profiles
                        │
                        └──► doctor_patients (relationship)
                                    ↓
                          current_engagement_id
                          relationship_status


engagements
├─► doctor_id (FK → doctor_profiles)
├─► patient_id (FK → patient_profiles)
├─► access_rule_name (FK → engagement_access_rules)
└─► Triggers update to doctor_patients on status change


ai_chat_sessions
├─► patient_id (FK → patient_profiles)
└─► Access controlled by doctor_patients.relationship_status
```

### Critical Relationships

| Parent | Child | Type | On Delete |
|--------|-------|------|-----------|
| users | doctor_profiles | 1:1 | CASCADE |
| users | patient_profiles | 1:1 | CASCADE |
| doctor_profiles | engagements | 1:M | CASCADE |
| patient_profiles | engagements | 1:M | CASCADE |
| patient_profiles | ai_chat_sessions | 1:M | CASCADE |
| engagements | doctor_patients | M:1 | SET NULL |
| engagement_access_rules | engagements | 1:M | RESTRICT |

---

## Access Control Flow

### Scenario 1: Doctor Opens Patient Profile

```sql
-- Step 1: Get relationship status
SELECT relationship_status, current_engagement_id
FROM doctor_patients
WHERE doctor_id = ? AND patient_id = ?;

-- Step 2: Get access rules
SELECT * FROM engagement_access_rules
WHERE rule_name = relationship_status;

-- Step 3: Apply rules
IF can_view_all_history = true THEN
    -- Show everything
ELSIF can_view_current_only = true THEN
    -- Show only current engagement period data
ELSE
    -- No access
END IF;
```

### Scenario 2: Starting an Engagement

```sql
-- User Action: Doctor initiates engagement
INSERT INTO engagements (
    doctor_id, 
    patient_id, 
    access_rule_name, 
    status
) VALUES (?, ?, 'FULL_ACCESS', 'pending');

-- System generates 2FA token
INSERT INTO engagement_verification_tokens (
    engagement_id,
    token,
    verification_type,
    qr_code_data
) VALUES (?, ?, 'start', ?);

-- Patient verifies → Engagement becomes 'active'
UPDATE engagements SET status = 'active';

-- Trigger automatically fires:
-- 1. Updates doctor_patients.relationship_status
-- 2. Sets current_engagement_id
-- 3. Sends system message to engagement_messages
```

### Scenario 3: Ending an Engagement

```sql
-- User Action: Doctor/Patient ends engagement
UPDATE engagements 
SET status = 'ended', end_at = NOW()
WHERE id = ?;

-- Trigger automatically:
-- 1. Checks access rule retention settings
-- 2. Updates doctor_patients.relationship_status
-- 3. Clears current_engagement_id
-- 4. Sends system message
```

---

## Database Tables

### Core Tables (16 total)

#### Identity & Profiles
- `users` - Base authentication and user data
- `doctor_profiles` - Extended doctor information
- `patient_profiles` - Extended patient information

#### Engagement System
- `engagement_access_rules` - Permission definitions
- `engagements` - Active/historical engagement periods
- `doctor_patients` - Relationship mapping with current access
- `engagement_verification_tokens` - 2FA tokens for start/end
- `engagement_messages` - Doctor-patient communication
- `engagement_analytics` - Engagement metrics
- `engagement_events` - Engagement lifecycle events
- `engagement_sessions` - Active session tracking

#### AI Chat System
- `ai_chat_sessions` - Patient-AI conversation sessions
- `ai_chat_messages` - Messages within AI sessions

#### Security & Administration
- `audit_log` - All user actions
- `security_authentication_tokens` - Session tokens
- `notifications` - User notifications
- `message_queues` - Background job queue
- `platform_analytics` - Platform-wide metrics
- `system_settings` - Configuration
- `active_service_subscriptions` - User subscriptions
- `url_shortcuts` - Short URL management
- `user_management_metrics` - User-level metrics

---

## Key Features

### 1. Automatic State Management

**Triggers handle all relationship updates:**

```sql
-- engagement_status_change trigger
-- Fires on: INSERT or UPDATE of status on engagements
-- Actions:
--   - Updates doctor_patients.relationship_status
--   - Updates current_engagement_id
--   - Sends system messages
--   - Applies retention policies
```

### 2. Helper Functions for Access Control

```sql
-- Check message access
get_accessible_messages(doctor_id, patient_id)

-- Check AI chat access
get_accessible_ai_chat_sessions(doctor_id, patient_id)

-- Boolean check for specific session
can_doctor_view_ai_session(doctor_id, patient_id, session_id)
```

### 3. Pre-defined Access Rules

| Rule Name | During: All History | During: Current Only | After: Keep History | After: Keep Period | After: No Access |
|-----------|---------------------|----------------------|---------------------|--------------------|--------------------|
| FULL_ACCESS | ✅ | ✅ | ✅ | ✅ | ❌ |
| CURRENT_ENGAGEMENT_ACCESS | ❌ | ✅ | ❌ | ❌ | ✅ |
| READ_ONLY_ACCESS | ✅ | ✅ | ✅ | ✅ | ❌ |
| LIMITED_ENGAGEMENT_ACCESS | ❌ | ✅ | ❌ | ❌ | ✅ |
| NO_ACCESS | ❌ | ❌ | ❌ | ❌ | ✅ |

### 4. System Messages

Automatically inserted into engagement chat:
- 🔔 Engagement started with access level
- 🔔 Engagement ended, access updated
- 🔔 Access level changed from X to Y

### 5. Comprehensive Indexing

**Performance-optimized indexes on:**
- User lookups (email, active status)
- Profile relationships (user_id)
- Engagement queries (doctor_id, patient_id, status)
- Message retrieval (engagement_id, created_at)
- AI chat access (patient_id, started_at)

---

## Performance Considerations

### Query Complexity

| Operation | Time Complexity | Notes |
|-----------|-----------------|-------|
| Check doctor access | O(1) | Single index lookup on doctor_patients |
| Get engagement messages | O(log n) | B-tree index on engagement_id |
| List AI sessions | O(log n) | Composite index (patient_id, started_at) |
| Verify session access | O(1) | EXISTS with indexed join |

### Scalability Features

1. **Partitioning Ready**
   - Date-based fields for time-series partitioning
   - Separate tables for analytics vs operational data

2. **Efficient Data Types**
   - UUIDs for distributed ID generation
   - JSONB for flexible schema evolution
   - ENUMs for type safety

3. **Connection Pooling Compatible**
   - No session-specific state in database
   - Stateless helper functions

4. **Read Replica Friendly**
   - Clear read/write separation possible
   - Triggers only on primary writes

### Optimization Tips

```sql
-- Use helper functions instead of manual queries
-- Good:
SELECT * FROM get_accessible_messages(?, ?);

-- Avoid:
SELECT * FROM engagement_messages 
JOIN engagements ... 
JOIN doctor_patients ... 
WHERE ...;

-- Leverage materialized views for analytics
CREATE MATERIALIZED VIEW doctor_engagement_summary AS
SELECT doctor_id, COUNT(*) as total_engagements, ...
FROM engagements
GROUP BY doctor_id;
```

---

## Security Features

### 1. Row-Level Security Ready
```sql
-- Future enhancement: Enable RLS
ALTER TABLE engagement_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY engagement_access ON engagement_messages
USING (
    EXISTS (
        SELECT 1 FROM get_accessible_messages(
            current_user_doctor_id(),
            engagement.patient_id
        )
        WHERE message_id = engagement_messages.id
    )
);
```

### 2. Audit Trail
Every critical action logged in `audit_log`:
- User who performed action
- Resource type and ID
- What changed (JSONB)
- IP address and user agent
- Timestamp

### 3. Token Management
- Session tokens with expiration
- Revocation support
- 2FA tokens for critical actions

### 4. Soft Deletes
- `deleted_at` field on users
- Data retained for audit/compliance
- Excluded from normal queries

---

## Database Maintenance

### Recommended Jobs

```sql
-- Daily: Clean expired tokens
DELETE FROM security_authentication_tokens
WHERE expires_at < NOW() - INTERVAL '7 days';

-- Daily: Archive old engagements
UPDATE engagements SET status = 'archived'
WHERE status = 'ended' 
  AND end_at < NOW() - INTERVAL '1 year';

-- Weekly: Update platform analytics
INSERT INTO platform_analytics (analytics_date, ...)
SELECT CURRENT_DATE, COUNT(DISTINCT id), ...
FROM users WHERE ...;

-- Monthly: Vacuum analyze
VACUUM ANALYZE;
```

### Backup Strategy

1. **Full backup:** Daily
2. **WAL archiving:** Continuous
3. **Point-in-time recovery:** Enabled
4. **Retention:** 30 days minimum

---

## Future Enhancements

### Planned Features
- [ ] Multi-language support for messages
- [ ] Video consultation integration
- [ ] Prescription management
- [ ] Lab results integration
- [ ] Telemedicine session recordings
- [ ] Patient consent versioning

### Database Optimizations
- [ ] Partitioning for large tables (messages, audit_log)
- [ ] Materialized views for analytics
- [ ] Full-text search on messages
- [ ] Redis caching layer for hot data

---

## Compliance & Standards

### HIPAA Compliance Features
✅ Audit logging of all data access
✅ Encryption support (at rest and in transit)
✅ Access control with least privilege
✅ Data retention policies
✅ User authentication tracking

### Best Practices Followed
✅ Normalized schema design
✅ Foreign key constraints
✅ Index optimization
✅ Trigger-based automation
✅ Transaction safety
✅ Documentation

---

## Getting Started

1. **Install PostgreSQL 12+**
2. **Run schema:** `psql -U postgres -f neuralhealer_schema.sql`
3. **Verify installation:**
   ```sql
   SELECT COUNT(*) FROM engagement_access_rules; -- Should return 5
   ```
4. **Test access control:**
   ```sql
   SELECT can_doctor_view_ai_session(
       'doctor-uuid',
       'patient-uuid', 
       'session-uuid'
   );
   ```

---

## Support & Documentation

- **Schema File:** `neuralhealer_schema.sql`
- **Setup Guide:** `README.md`
- **API Integration:** `API_INTEGRATION.md`
- **Migration Guide:** `MIGRATIONS.md`

For questions or issues, please refer to the project documentation or contact the development team.

---

**Last Updated:** January 2026  
**Schema Version:** 1.0.0  
**PostgreSQL Version:** 12+