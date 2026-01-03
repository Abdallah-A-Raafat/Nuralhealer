---

# 🧠 NeuralHealer API — Frontend Integration Guide (v0.2)

> **Auth Model:** JWT stored in **HTTP-only cookie**
> **Frontend:** React (`http://localhost:5173`)
> **Backend:** Spring Boot (`http://localhost:8080`)
> **Important:** Always use `credentials: 'include'`
> **ID Format:** All IDs are **UUIDs only**

---

## 🔌 Base Configuration (Frontend)

```js
const API_BASE = "http://localhost:8080";

const apiFetch = (url, options = {}) =>
  fetch(`${API_BASE}${url}`, {
    credentials: "include", // HTTP-only cookie
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
```

---

## 🔐 Authentication System

### 🛡️ Authentication Behavior

* Login/Register sets a `neuralhealer_token` cookie (HTTP-only)
* Cookie is automatically sent with every request
* No JWT handling in frontend code

---

### ✅ Register User

**POST** `/api/auth/register`

#### Request Body

```json
{
  "email": "doctor@test.com",
  "password": "Test1234!",
  "firstName": "John",
  "lastName": "Smith",
  "role": "DOCTOR"
}
```

🔹 `role` → `"DOCTOR"` | `"PATIENT"`

#### Response (201)

```json
{
  "userId": "uuid",
  "email": "doctor@test.com",
  "role": "DOCTOR",
  "createdAt": "2026-01-03T15:10:00Z"
}
```

---

### ✅ Login

**POST** `/api/auth/login`

#### Request Body

```json
{
  "email": "doctor@test.com",
  "password": "Test1234!"
}
```

#### Response (200)

```json
{
  "message": "Login successful"
}
```

📌 JWT is stored in an **HTTP-only cookie**

---

### ✅ Logout

**POST** `/api/auth/logout`

#### Behavior

* Clears authentication cookie
* Frontend should reset auth state

---

### ✅ Get Current User (Session Restore)

**GET** `/api/users/me`

#### Response

```json
{
  "userId": "uuid",
  "email": "doctor@test.com",
  "firstName": "John",
  "lastName": "Smith",
  "role": "DOCTOR"
}
```

📌 Use this:

* On app load
* After refresh
* To restore login state

---

## 🤝 Engagement System

> **Important:** Engagement IDs are **UUIDs**, not business codes
> Example UUID: `550e8400-e29b-41d4-a716-446655440000`

---

### ✅ Initiate Engagement (Doctor)

**POST** `/api/engagements/initiate`

#### Request Body

```json
{
  "patientId": "uuid",
  "accessRuleName": "FULL_ACCESS"
}
```

🔹 Access Rules:

* `FULL_ACCESS`
* `READ_ONLY`
* `WRITE_ONLY`
* `TEMPORARY`
* `EMERGENCY`

#### Response

```json
{
  "id": "engagement-uuid",
  "status": "PENDING",
  "verificationInfo": {
    "token": "START_VERIFICATION_TOKEN",
    "qrCodeData": "neuralhealer://verify/START_VERIFICATION_TOKEN"
  }
}
```

📌 **Frontend Responsibilities**

* Convert `qrCodeData` string → visual QR image
* Show token or QR to patient
* Engagement is **not active yet**

---

### ✅ Verify Engagement Start (Patient)

**POST** `/api/engagements/verify-start`

#### Request Body

```json
{
  "token": "START_VERIFICATION_TOKEN"
}
```

#### Response

```json
{
  "id": "engagement-uuid",
  "status": "ACTIVE"
}
```

📌 Messaging becomes available only after this step.

---

### ✅ Messaging

#### Send Message

**POST** `/api/engagements/{engagementId}/messages`

```json
{
  "content": "Welcome to NeuralHealer."
}
```

#### Response

```json
{
  "id": "message-uuid",
  "senderId": "uuid",
  "content": "Welcome to NeuralHealer.",
  "createdAt": "2026-01-03T16:00:00Z",
  "system": false
}
```

---

#### Get Messages

**GET** `/api/engagements/{engagementId}/messages`

```json
[
  {
    "id": "msg-uuid",
    "senderId": "uuid",
    "content": "Hello Doctor",
    "createdAt": "2026-01-03T16:01:00Z",
    "system": false
  },
  {
    "id": "msg-uuid",
    "content": "Engagement activated",
    "system": true
  }
]
```

📌 `system: true` → system-generated lifecycle messages

---

## 🛑 Cancel or End Engagement (Doctor)

### 🅰️ Cancel Pending Engagement (Immediate)

**DELETE** `/api/engagements/{engagementId}`

#### Behavior

* Only works when status = `PENDING`
* No verification required
* Solves “stuck” engagements

#### Response

```json
{
  "status": "CANCELLED"
}
```

---

### 🅱️ Request End Active Engagement

**POST** `/api/engagements/{engagementId}/end-request`

#### Request Body

```json
{
  "reason": "Treatment completed successfully"
}
```

#### Response

```json
{
  "verificationInfo": {
    "token": "END_VERIFICATION_TOKEN"
  }
}
```

📌 Engagement moves to `END_REQUESTED`

---

### ✅ Verify Engagement End

**POST** `/api/engagements/{engagementId}/verify-end`

#### Request Body

```json
{
  "token": "END_VERIFICATION_TOKEN"
}
```

#### Response

```json
{
  "status": "ENDED"
}
```

---

## 🧠 Engagement State Machine (Frontend Logic)

```
PENDING
   ↓ verify-start
ACTIVE
   ↓ end-request
END_REQUESTED
   ↓ verify-end
ENDED
```

Additional path:

```
PENDING → CANCELLED (DELETE)
```

📌 Use states to:

* Enable / disable messaging
* Show banners
* Control actions visibility

---

## 🚨 Error Handling (Frontend)

```js
if (response.status === 401) {
  navigate("/login");
}

if (!response.ok) {
  const err = await response.json();
  toast.error(err.message || "Something went wrong");
}
```

---

## ✅ Why This Version Matters

### Before ❌

* Partial lifecycle
* Missing QR & verification info
* Ambiguous ID usage
* Hard to align with backend tests

### Now ✅

* **100% aligned with API v0.2**
* **UUID-safe**
* **Lifecycle-complete**
* **Frontend-developer friendly**
* **Easy to discuss with JSON**

---
