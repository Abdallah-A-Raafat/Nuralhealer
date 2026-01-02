# 🏥 NeuralHealer Backend - Complete System Documentation

**Version:** 0.1.0  
**Status:** Phase 3 Complete (Engagement System ✅) | Phase 4 Pending (AI Chat)  
**Last Updated:** January 2026

---

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [System Architecture](#system-architecture)
- [Development Phases](#development-phases)
- [API Documentation](#api-documentation)
- [Database Layer](#database-layer)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Troubleshooting](#troubleshooting)

---

## Overview

NeuralHealer is a **HIPAA-compliant healthcare platform** that enables secure, regulated doctor-patient engagements with AI-powered patient care assistance. The backend system manages authentication, profile management, sophisticated access control, and secure communication channels.

### Key Features

✅ **Authentication & Authorization** (Phase 2)
- JWT-based stateless authentication
- Role-based access control (DOCTOR, PATIENT, ADMIN)
- Secure password hashing with BCrypt

✅ **Engagement Management** (Phase 3)
- Rule-based access control system
- 2FA verification for engagement lifecycle
- Automated relationship management via database triggers
- Secure doctor-patient messaging

⏳ **AI Chat Integration** (Phase 4 - Planned)
- Patient-AI conversation sessions
- Doctor access control to AI chat history
- Privacy-preserving AI interactions

---

## Project Structure

```
backend/
├── backend/                          # Spring Boot Application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/neuralhealer/backend/
│   │   │   │   ├── config/          # Configuration classes
│   │   │   │   │   ├── JpaConfig.java
│   │   │   │   │   ├── OpenApiConfig.java
│   │   │   │   │   └── SecurityConfig.java
│   │   │   │   ├── controller/      # REST Controllers
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── EngagementController.java
│   │   │   │   │   └── UserController.java
│   │   │   │   ├── model/           # Domain Models
│   │   │   │   │   ├── entity/      # JPA Entities
│   │   │   │   │   │   ├── User.java
│   │   │   │   │   │   ├── DoctorProfile.java
│   │   │   │   │   │   ├── PatientProfile.java
│   │   │   │   │   │   ├── Engagement.java
│   │   │   │   │   │   ├── DoctorPatient.java
│   │   │   │   │   │   ├── EngagementVerificationToken.java
│   │   │   │   │   │   ├── EngagementMessage.java
│   │   │   │   │   │   └── EngagementAccessRule.java
│   │   │   │   │   ├── dto/         # Data Transfer Objects
│   │   │   │   │   │   ├── request/
│   │   │   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   │   │   ├── StartEngagementRequest.java
│   │   │   │   │   │   │   ├── VerifyEngagementRequest.java
│   │   │   │   │   │   │   └── SendMessageRequest.java
│   │   │   │   │   │   └── response/
│   │   │   │   │   │       ├── AuthResponse.java
│   │   │   │   │   │       ├── EngagementResponse.java
│   │   │   │   │   │       ├── StartEngagementResponse.java
│   │   │   │   │   │       └── MessageResponse.java
│   │   │   │   │   └── enums/       # Enumerations
│   │   │   │   │       ├── UserRole.java
│   │   │   │   │       ├── EngagementStatus.java
│   │   │   │   │       ├── VerificationType.java
│   │   │   │   │       └── TokenStatus.java
│   │   │   │   ├── repository/      # Data Access Layer
│   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   ├── DoctorProfileRepository.java
│   │   │   │   │   ├── PatientProfileRepository.java
│   │   │   │   │   ├── EngagementRepository.java
│   │   │   │   │   ├── DoctorPatientRepository.java
│   │   │   │   │   ├── EngagementVerificationTokenRepository.java
│   │   │   │   │   ├── EngagementMessageRepository.java
│   │   │   │   │   └── EngagementAccessRuleRepository.java
│   │   │   │   ├── service/         # Business Logic
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   ├── EngagementService.java
│   │   │   │   │   ├── VerificationService.java
│   │   │   │   │   ├── EngagementMessageService.java
│   │   │   │   │   └── UserService.java
│   │   │   │   ├── security/        # Security Components
│   │   │   │   │   ├── JwtService.java
│   │   │   │   │   ├── JwtAuthFilter.java
│   │   │   │   │   └── UserDetailsServiceImpl.java
│   │   │   │   ├── exception/       # Exception Handling
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   │   ├── UnauthorizedException.java
│   │   │   │   │   ├── InvalidVerificationException.java
│   │   │   │   │   └── AccessDeniedException.java
│   │   │   │   └── util/            # Utility Classes
│   │   │   │       └── ApiResponse.java
│   │   │   └── resources/
│   │   │       ├── application.yml   # Application Configuration
│   │   │       └── schema.sql        # Database Initialization (Auto-executed)
│   │   └── test/                     # Test Classes
│   ├── pom.xml                       # Maven Dependencies
│   ├── Makefile                      # Development Commands
│   └── README.md                     # Spring Boot Documentation
│
├── db/                               # Database Documentation & Schema
│   ├── neuralhealer_schema.sql      # Complete PostgreSQL Schema
│   ├── schema.sql                   # Spring Boot Compatible Schema
│   ├── DATABASE_ARCHITECTURE.md     # Schema Documentation
│   ├── ENGAGEMENT_FLOW.md           # Business Logic Flow
│   ├── DEPLOYMENT_GUIDE.md          # Database Deployment
│   └── README.md                    # Database Layer Overview
│
├── docker-compose.yml               # PostgreSQL Container Setup
└── README.md                        # This file
```

---

## Technology Stack

### Backend Application
| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 21 | Core language |
| **Spring Boot** | 3.2.5 | Application framework |
| **Spring Security** | 6.x | Authentication & Authorization |
| **Spring Data JPA** | 3.x | Database abstraction |
| **Hibernate** | 6.x | ORM implementation |
| **JWT** | 0.12.3 (jjwt) | Token-based authentication |
| **Lombok** | 1.18.30 | Code generation |
| **OpenAPI** | 2.3.0 | API documentation |

### Database
| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 15+ | Primary database |
| **PL/pgSQL** | Native | Stored procedures & triggers |
| **JSONB** | Native | Flexible schema storage |
| **UUID** | Native | Distributed ID generation |

### Infrastructure
| Tool | Purpose |
|------|---------|
| **Docker** | Database containerization |
| **Maven** | Build automation |
| **Git** | Version control |

---

## Quick Start

### Prerequisites

- **Java 21 SDK** installed
- **Docker** and **Docker Compose** installed
- **Maven** 3.8+ (or use included wrapper `./mvnw`)
- **PostgreSQL Client** (optional, for manual DB access)

### Installation Steps

#### 1. Clone and Navigate
```bash
cd backend
```

#### 2. Start Database
```bash
# Start PostgreSQL container
docker-compose up -d

# Verify database is running
docker ps | grep neuralhealer-db

# Check database health
docker exec neuralhealer-db pg_isready -U postgres
```

#### 3. Configure Application
The application is pre-configured to connect to the local PostgreSQL instance:

```yaml
# backend/src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/neuralhealer
    username: postgres
    password: aaa
```

**Note:** Database schema is automatically initialized on first startup via `schema.sql`.

#### 4. Build and Run
```bash
# Using Maven wrapper
cd backend
./mvnw spring-boot:run

# Or using installed Maven
mvn spring-boot:run

# Or using Makefile (if available)
make run
```

#### 5. Verify Installation
```bash
# Health check
curl http://localhost:8080/api/actuator/health

# Expected response:
# {"status":"UP"}

# Access API documentation
open http://localhost:8080/swagger-ui.html
```

---

## System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│              (React Frontend @ :5173)                    │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST + JWT
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  CONTROLLER LAYER                        │
│   AuthController | EngagementController | UserController│
│                  (REST Endpoints)                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                          │
│   Business Logic & Orchestration                         │
│   AuthService | EngagementService | VerificationService │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 REPOSITORY LAYER                         │
│   Data Access (Spring Data JPA)                          │
│   UserRepository | EngagementRepository | etc.           │
└────────────────────┬────────────────────────────────────┘
                     │ JDBC
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                         │
│   PostgreSQL with Triggers, Functions, and Rules         │
│   - Automatic relationship management                    │
│   - Access control enforcement                           │
│   - Audit logging                                        │
└─────────────────────────────────────────────────────────┘
```

### Security Flow

```
Client Request
     │
     ├─► Public Endpoints (/api/auth/**)
     │        └─► Direct Processing
     │
     └─► Protected Endpoints (/api/engagements/**)
              │
              ▼
         JwtAuthFilter
              │
              ├─► Extract JWT from Authorization header
              ├─► Validate token signature
              ├─► Extract user details
              └─► Set SecurityContext
                       │
                       ▼
                  Controller
                       │
                       ├─► @PreAuthorize checks role
                       └─► Access user via @AuthenticationPrincipal
                                │
                                ▼
                           Service Layer
                                │
                                └─► Database (with access control)
```

---

## Development Phases

### ✅ Phase 1: Project Foundation (Week 1)
- [x] Spring Boot project initialization
- [x] Maven dependency configuration
- [x] Docker Compose setup for PostgreSQL
- [x] Basic project structure
- [x] Development environment configuration

### ✅ Phase 2: Authentication System (Week 2)
- [x] User entity and profiles (Doctor/Patient)
- [x] JWT token generation and validation
- [x] Spring Security configuration
- [x] Registration endpoint with role-based profiles
- [x] Login endpoint returning JWT
- [x] Protected endpoint (`/api/users/me`)
- [x] Password encryption (BCrypt)
- [x] Exception handling

**Deliverables:**
- Users can register as Doctor or Patient
- Users can login and receive JWT token
- Protected endpoints require valid JWT

### ✅ Phase 3: Engagement System (Week 3)
- [x] Engagement entities and relationships
- [x] 2FA verification system (token-based)
- [x] Engagement lifecycle management
  - [x] Initiation (PENDING status)
  - [x] Start verification (ACTIVE status)
  - [x] End verification (ENDED status)
- [x] Access rule system
- [x] Secure messaging
- [x] Database trigger integration
- [x] System message generation

**Deliverables:**
- Doctors can initiate engagements with access rules
- Patients verify engagement start via 2FA token
- Messages can be exchanged during active engagements
- Engagements can be ended with verification
- Database automatically manages relationship status

### ⏳ Phase 4: AI Chat Integration (Week 4 - Planned)
- [ ] AI chat session entities
- [ ] AI message storage
- [ ] Patient-AI conversation endpoints
- [ ] Doctor access control to AI sessions
- [ ] AI model integration placeholder
- [ ] Session management

### ⏳ Phase 5: Enhancements (Weeks 5-6 - Planned)
- [ ] Frontend integration testing
- [ ] Real email/SMS for 2FA tokens
- [ ] Unit and integration tests
- [ ] QR code generation (ZXing)
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Production deployment preparation

---

## API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Smith",
  "role": "DOCTOR"
}

Response 201:
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "doctor@example.com",
    "role": "DOCTOR"
  },
  "message": "Registration successful"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "doctor@example.com",
    "role": "DOCTOR"
  },
  "message": "Login successful"
}
```

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>

Response 200:
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "doctor@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "role": "DOCTOR",
    "profile": {
      "id": "...",
      "title": "MD",
      "specialities": {...}
    }
  }
}
```

### Engagement Endpoints

#### Initiate Engagement (Doctor Only)
```http
POST /api/engagements/initiate
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "patientId": "650e8400-e29b-41d4-a716-446655440001",
  "accessRuleName": "FULL_ACCESS"
}

Response 201:
{
  "data": {
    "id": "750e8400-e29b-41d4-a716-446655440002",
    "engagementId": "ENG-2026-000001",
    "status": "PENDING",
    "verification": {
      "token": "123456",
      "qrCodeData": "neuralhealer://verify/START/123456",
      "expiresAt": "2026-01-02T12:03:00Z"
    }
  },
  "message": "Engagement initiated. Awaiting patient verification."
}
```

#### Verify Engagement Start (Patient)
```http
POST /api/engagements/verify-start
Authorization: Bearer <patient-token>
Content-Type: application/json

{
  "token": "123456"
}

Response 200:
{
  "data": {
    "id": "750e8400-e29b-41d4-a716-446655440002",
    "engagementId": "ENG-2026-000001",
    "status": "ACTIVE",
    "doctor": {...},
    "patient": {...},
    "accessRuleName": "FULL_ACCESS",
    "startAt": "2026-01-02T12:02:30Z"
  },
  "message": "Engagement activated successfully."
}
```

#### Send Message
```http
POST /api/engagements/{id}/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello, how are you feeling today?"
}

Response 201:
{
  "data": {
    "id": "...",
    "content": "Hello, how are you feeling today?",
    "senderId": "...",
    "recipientId": "...",
    "sentAt": "2026-01-02T12:05:00Z"
  },
  "message": "Message sent successfully."
}
```

#### Get Engagement Messages
```http
GET /api/engagements/{id}/messages
Authorization: Bearer <token>

Response 200:
{
  "data": [
    {
      "id": "...",
      "content": "🔔 Engagement started with access level: FULL_ACCESS",
      "isSystemMessage": true,
      "sentAt": "2026-01-02T12:02:30Z"
    },
    {
      "id": "...",
      "content": "Hello, how are you feeling today?",
      "senderId": "...",
      "recipientId": "...",
      "isSystemMessage": false,
      "sentAt": "2026-01-02T12:05:00Z"
    }
  ]
}
```

#### Get My Engagements
```http
GET /api/engagements/my-engagements
Authorization: Bearer <token>

Response 200:
{
  "data": [
    {
      "id": "...",
      "engagementId": "ENG-2026-000001",
      "status": "ACTIVE",
      "doctor": {...},
      "patient": {...},
      "startAt": "2026-01-02T12:00:00Z"
    }
  ]
}
```

#### Request End Engagement
```http
POST /api/engagements/{id}/end-request
Authorization: Bearer <token>

Response 200:
{
  "data": {
    "id": "...",
    "engagementId": "ENG-2026-000001",
    "status": "ACTIVE",
    "verification": {
      "token": "789012",
      "qrCodeData": "neuralhealer://verify/END/789012",
      "expiresAt": "2026-01-02T14:03:00Z"
    }
  },
  "message": "End verification token generated."
}
```

#### Verify End Engagement
```http
POST /api/engagements/{id}/verify-end?reason=Treatment%20completed
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "789012"
}

Response 200:
{
  "data": {
    "id": "...",
    "engagementId": "ENG-2026-000001",
    "status": "ENDED",
    "endAt": "2026-01-02T14:02:30Z"
  },
  "message": "Engagement ended successfully."
}
```

### Swagger UI
Interactive API documentation available at:
```
http://localhost:8080/swagger-ui/index.html
```

---

## Database Layer

### Schema Overview

The database layer handles **complex business logic** through PostgreSQL triggers and functions, ensuring data consistency and automating relationship management.

#### Key Tables (24 total)

**Core Tables:**
- `users` - Base authentication
- `doctor_profiles` - Extended doctor data
- `patient_profiles` - Extended patient data
- `engagements` - Engagement periods
- `doctor_patients` - Relationship mapping
- `engagement_access_rules` - Permission definitions (5 pre-seeded rules)
- `engagement_verification_tokens` - 2FA tokens
- `engagement_messages` - Communication
- `ai_chat_sessions` - Patient-AI conversations
- `ai_chat_messages` - AI chat history

**Supporting Tables:**
- Audit logs, notifications, analytics, subscriptions, etc.

### Access Rules (Pre-configured)

| Rule Name | View All History | View Current Only | Retains After End |
|-----------|------------------|-------------------|-------------------|
| `FULL_ACCESS` | ✅ | ✅ | ✅ Keep history |
| `CURRENT_ENGAGEMENT_ACCESS` | ❌ | ✅ | ❌ No access |
| `READ_ONLY_ACCESS` | ✅ | ✅ | ✅ Keep history |
| `LIMITED_ENGAGEMENT_ACCESS` | ❌ | ✅ | ❌ No access |
| `NO_ACCESS` | ❌ | ❌ | ❌ No access |

### Critical Database Triggers

**1. Auto-Update Relationship on Engagement Status Change**
```sql
-- Trigger: engagement_status_change
-- Fires when: engagement.status changes to 'active' or 'ended'
-- Actions:
--   - Updates doctor_patients.relationship_status
--   - Sets/clears current_engagement_id
--   - Applies retention rules when ending
--   - Sends system messages
```

**2. Auto-Generate Engagement ID**
```sql
-- Trigger: set_engagement_id
-- Fires when: New engagement inserted
-- Action: Generates ID format: ENG-2026-000001
```

### Access Control Functions

```sql
-- Get messages doctor can access for a patient
SELECT * FROM get_accessible_messages(doctor_id, patient_id);

-- Get AI chat sessions doctor can view
SELECT * FROM get_accessible_ai_chat_sessions(doctor_id, patient_id);

-- Check if doctor can view specific AI session
SELECT can_doctor_view_ai_session(doctor_id, patient_id, session_id);
```

### Database Connection

**Configuration:**
```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/neuralhealer
    username: postgres
    password: aaa
  jpa:
    hibernate:
      ddl-auto: validate  # Schema managed by schema.sql
```

**Docker Container:**
```bash
# Container name: neuralhealer-db
# Port: 5432
# Database: neuralhealer
# User: postgres
# Password: aaa
```

**Manual Access:**
```bash
# Using psql
psql -h localhost -U postgres -d neuralhealer

# Using Docker exec
docker exec -it neuralhealer-db psql -U postgres -d neuralhealer

# Check tables
\dt

# Check triggers
\df update_relationship_status_on_engagement

# Check access rules
SELECT rule_name FROM engagement_access_rules;
```

### Database Documentation

For detailed database information, see:
- **Schema:** [`db/neuralhealer_schema.sql`](db/neuralhealer_schema.sql)
- **Architecture:** [`db/DATABASE_ARCHITECTURE.md`](db/DATABASE_ARCHITECTURE.md)
- **Engagement Flow:** [`db/ENGAGEMENT_FLOW.md`](db/ENGAGEMENT_FLOW.md)
- **Deployment:** [`db/DEPLOYMENT_GUIDE.md`](db/DEPLOYMENT_GUIDE.md)

---

## Security

### Authentication & Authorization

**JWT Token Structure:**
```json
{
  "sub": "doctor@example.com",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "role": "DOCTOR",
  "iat": 1704196800,
  "exp": 1704283200
}
```

**Token Configuration:**
- **Secret Key:** Configured in `application.yml` (change in production!)
- **Expiration:** 24 hours
- **Algorithm:** HMAC-SHA256
- **Header:** `Authorization: Bearer <token>`

### Security Features

✅ **Password Hashing:** BCrypt with salt  
✅ **Stateless Authentication:** JWT tokens  
✅ **Role-Based Access Control:** `@PreAuthorize` annotations  
✅ **CORS:** Configured for React frontend (localhost:5173)  
✅ **SQL Injection Protection:** Parameterized queries via JPA  
✅ **XSS Protection:** Spring Security defaults  
✅ **CSRF:** Disabled (stateless API)  

### Protected Endpoints

```java
// Requires authentication
@GetMapping("/api/users/me")
public ResponseEntity<...> getCurrentUser(@AuthenticationPrincipal UserDetails user)

// Requires DOCTOR role
@PostMapping("/api/engagements/initiate")
@PreAuthorize("hasRole('DOCTOR')")
public ResponseEntity<...> initiateEngagement(...)
```

### Access Control Flow

```
Request → JwtAuthFilter → Extract & Validate JWT → Set SecurityContext
            ↓
       Controller → @PreAuthorize checks role
            ↓
       Service → Business logic + ownership checks
            ↓
       Database → Row-level access via queries
```

---

## Testing

### Current Test Coverage

**Phase 2 (Authentication):**
- ✅ Manual verification with curl/PowerShell
- ✅ Swagger UI testing
- ⏳ Automated tests (planned)

**Phase 3 (Engagement):**
- ✅ Manual end-to-end flow testing
- ✅ API endpoint verification
- ⏳ Unit tests (planned)
- ⏳ Integration tests (planned)

### Manual Testing Guide

#### Test Authentication Flow
```bash
# 1. Register Doctor
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"dr.test@hospital.com",
    "password":"Test1234",
    "firstName":"Test",
    "lastName":"Doctor",
    "role":"DOCTOR"
  }'

# 2. Register Patient
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"patient.test@email.com",
    "password":"Test1234",
    "firstName":"Test",
    "lastName":"Patient",
    "role":"PATIENT"
  }'

# 3. Login and save token
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.test@hospital.com","password":"Test1234"}' \
  | jq -r '.data.token')

# 4. Access protected endpoint
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

#### Test Engagement Flow
```bash
# 1. Login as Doctor (get token)
DOCTOR_TOKEN="..."

# 2. Login as Patient (get patient ID and token)
PATIENT_ID="..."
PATIENT_TOKEN="..."

# 3. Doctor initiates engagement
ENGAGEMENT=$(curl -X POST http://localhost:8080/api/engagements/initiate \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"patientId\":\"$PATIENT_ID\",\"accessRuleName\":\"FULL_ACCESS\"}")

# Extract engagement ID and token
ENGAGEMENT_ID=$(echo $ENGAGEMENT | jq -r '.data.id')
VERIFICATION_TOKEN=$(echo $ENGAGEMENT | jq -r '.data.verification.token')

# 4. Patient verifies start
curl -X POST http://localhost:8080/api/engagements/verify-start \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$VERIFICATION_TOKEN\"}"

# 5. Send message
curl -X POST "http://localhost:8080/api/engagements/$ENGAGEMENT_ID/messages" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test message"}'

# 6. Get messages
curl "http://localhost:8080/api/engagements/$ENGAGEMENT_ID/messages" \
  -H "Authorization: Bearer $DOCTOR_TOKEN"
```

### Future Testing (Planned)

```java
// Unit Test Example
@SpringBootTest
class EngagementServiceTest {
    
    @Autowired
    private EngagementService engagementService;
    
    @Test
    void testStartEngagement_DuplicateActive_ThrowsException() {
        // Given: Active engagement exists
        // When: Try to create another
        // Then: Throws IllegalStateException
    }
}

// Integration Test Example
@SpringBootTest
@AutoConfigureMockMvc
class EngagementControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    @WithMockUser(roles = "DOCTOR")
    void testInitiateEngagement_Success() throws Exception {
        mockMvc.perform(post("/api/engagements/initiate")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{...}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.status").value("PENDING"));
    }
}
```

---

## Deployment

### Local Development

```bash
# 1. Start database
docker-compose up -d

# 2. Run application
cd backend
./mvnw spring-boot:run

# Application runs on http://localhost:8080
```

### Production Considerations

**Environment Variables:**
```bash

# Database
DATABASE_URL=jdbc:postgresql://prod-host:5432/neuralhealer
DATABASE_USERNAME=neuralhealer_app
DATABASE_PASSWORD=<secure-password>

# JWT
JWT_SECRET=<generate-secure-secret-256-bit>
JWT_EXPIRATION=86400000

# Server
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=production
```

**Production Checklist:**
- [ ] Change JWT secret key
- [ ] Use strong database password
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Configure logging (file + external service)
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Configure rate limiting
- [ ] Set up CI/CD pipeline
- [ ] Enable audit logging
- [ ] Configure connection pooling (HikariCP)

### Docker Deployment (Future)

```dockerfile
# Dockerfile (backend/Dockerfile)
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: neuralhealer
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  backend:
    build: ./backend
    environment:
      DATABASE_URL: jdbc:postgresql://db:5432/neuralhealer
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8080:8080"
    depends_on:
      - db

volumes:
  postgres_data:
```

---

## Future Enhancements

### Phase 4: AI Chat (Next Priority)
- [ ] AI chat session management
- [ ] Patient-AI message storage
- [ ] Doctor access to AI sessions (with rules)
- [ ] AI model integration placeholder

### Phase 5: Production Readiness
- [ ] **Testing:**
  - [ ] Unit tests (>80% coverage)
  - [ ] Integration tests
  - [ ] Load testing
- [ ] **Security:**
  - [ ] Real 2FA (SMS/Email via Twilio/AWS SNS)
  - [ ] QR code generation (ZXing library)
  - [ ] Rate limiting (Bucket4j)
  - [ ] Enhanced audit logging
- [ ] **Features:**
  - [ ] WebSocket for real-time messaging
  - [ ] File upload (medical documents)
  - [ ] Notification system
  - [ ] Email verification

### Golang Integration (Long-term Vision)

```
Current (Monolith):
┌─────────────────┐
│  Spring Boot    │
│  (All Features) │
└─────────────────┘

Future (Microservices):
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Spring Boot  │     │   Go Service │     │   Go Service │
│  (Core API)  │────▶│  (WebSocket) │     │  (AI Gateway)│
└──────────────┘     └──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│  PostgreSQL  │
└──────────────┘
```

**Potential Go Services:**
- Real-time WebSocket hub for instant messaging
- AI inference gateway (high throughput)
- Audit logging sidecar (async writes)

---

## Troubleshooting

### Common Issues

#### Application won't start

**Error:** `Failed to configure a DataSource`

**Solution:**
```bash
# Check database is running
docker ps | grep neuralhealer-db

# Start database if stopped
docker-compose up -d

# Verify connection
psql -h localhost -U postgres -d neuralhealer
```

---

#### JWT token invalid

**Error:** `Invalid JWT signature` or `Token expired`

**Solutions:**
1. **Check token expiration:** Tokens expire after 24 hours
2. **Verify secret key:** Must match between restarts
3. **Test token generation:**
   ```bash
   # Login again to get fresh token
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"Test1234"}'
   ```

---

#### Engagement verification fails

**Error:** `Invalid verification token` or `Token expired`

**Solutions:**
1. **Token expiry:** Verification tokens expire in **3 minutes**
2. **Check token status:**
   ```sql
   SELECT token, status, expires_at 
   FROM engagement_verification_tokens 
   WHERE token = 'YOUR_TOKEN';
   ```
3. **Re-initiate engagement** if token expired

---

#### Database trigger not firing

**Symptoms:** `doctor_patients` table not updated after engagement activation

**Solutions:**
1. **Check trigger exists:**
   ```sql
   \df update_relationship_status_on_engagement
   ```
2. **Verify trigger is enabled:**
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'engagement_status_change';
   ```
3. **Re-apply schema** if missing:
   ```bash
   psql -h localhost -U postgres -d neuralhealer < db/schema.sql
   ```

---

#### Port 8080 already in use

**Error:** `Web server failed to start. Port 8080 was already in use`

**Solutions:**
1. **Kill existing process:**
   ```bash
   # macOS/Linux
   lsof -ti:8080 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F
   ```
2. **Change port:**
   ```yaml
   # application.yml
   server:
     port: 8081
   ```

---

#### CORS errors from frontend

**Error:** `Access to fetch blocked by CORS policy`

**Solution:**
1. **Verify CORS configuration in SecurityConfig:**
   ```java
   .cors(cors -> cors.configurationSource(corsConfigurationSource()))
   ```
2. **Check frontend URL matches:**
   ```java
   configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
   ```
3. **Test with curl:**
   ```bash
   curl -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: POST" \
        -X OPTIONS http://localhost:8080/api/auth/login -v
   ```

---

### Debug Mode

Enable detailed logging:

```yaml
# application.yml
logging:
  level:
    com.neuralhealer.backend: DEBUG
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
```

---

### Health Monitoring

```bash
# Application health
curl http://localhost:8080/api/actuator/health

# Database connectivity
curl http://localhost:8080/api/actuator/health/db

# Check active endpoints
curl http://localhost:8080/api/actuator/mappings | jq
```

---

## Project Status & Roadmap

### Current State (v0.1.0)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 1: Foundation        ████████████████ 100% ✅
Phase 2: Authentication    ████████████████ 100% ✅
Phase 3: Engagements       ████████████████ 100% ✅
Phase 4: AI Chat           ░░░░░░░░░░░░░░░░   0% ⏳
Phase 5: Production Ready  ░░░░░░░░░░░░░░░░   0% ⏳
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Progress:          ██████████░░░░░░  60%
```

### Completion Criteria

**Phase 3 Complete When:**
- ✅ All entities created and tested
- ✅ Services implement business logic
- ✅ API endpoints functional
- ✅ Database triggers working
- ✅ Manual testing passes
- ⏳ Automated tests written

**Phase 4 Complete When:**
- [ ] AI chat entities created
- [ ] Patient can chat with AI
- [ ] Doctors can view AI sessions (with permissions)
- [ ] Session management implemented

**Production Ready When:**
- [ ] All tests passing (unit + integration)
- [ ] Security hardened (real 2FA, rate limiting)
- [ ] Performance optimized
- [ ] Monitoring configured
- [ ] Documentation complete
- [ ] Deployment automated

---

## Contributing

### Development Workflow

1. **Create feature branch:**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Make changes and test:**
   ```bash
   ./mvnw clean test
   ./mvnw spring-boot:run
   # Manual testing
   ```

3. **Commit with clear messages:**
   ```bash
   git commit -m "feat: Add engagement message pagination"
   ```

4. **Push and create PR:**
   ```bash
   git push origin feature/new-feature-name
   ```

### Code Standards

- **Java:** Follow Google Java Style Guide
- **Commit Messages:** Conventional Commits format
- **Testing:** Write tests for new features
- **Documentation:** Update README for new endpoints

---

## Support & Resources

### Documentation
- **Backend (Spring Boot):** [`backend/README.md`](backend/README.md)
- **Database:** [`db/README.md`](db/README.md)
- **Database Architecture:** [`db/DATABASE_ARCHITECTURE.md`](db/DATABASE_ARCHITECTURE.md)
- **Engagement Flow:** [`db/ENGAGEMENT_FLOW.md`](db/ENGAGEMENT_FLOW.md)
- **API Docs:** `http://localhost:8080/swagger-ui.html`

### External Resources
- **Spring Boot:** https://docs.spring.io/spring-boot/docs/current/reference/html/
- **Spring Security:** https://docs.spring.io/spring-security/reference/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **JWT:** https://jwt.io/

---

## License

**Proprietary** - NeuralHealer Team © 2026

---

## Contact

For questions, issues, or feature requests:
- **Project Lead:** [Your Name]
- **Email:** [contact@neuralhealer.com]
- **Documentation Issues:** Create issue in repository

---

**Last Updated:** January 2, 2026  
**Version:** 0.1.0  
**Status:** Phase 3 Complete | Phase 4 In Progress