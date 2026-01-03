---

# 🧠 NeuralHealer API — Frontend Integration Guide (Enhanced)

> **Auth Model:** JWT stored in **HTTP-only cookie**
> **Frontend:** React (`localhost:5173`)
> **Backend:** Spring Boot (`localhost:8080`)
> **Important:** Always use `credentials: 'include'`

---

## 🔌 Base Configuration (Frontend)

```js
const API_BASE = "http://localhost:8080";

const apiFetch = (url, options = {}) =>
  fetch(`${API_BASE}${url}`, {
    credentials: "include", //HTTP only cookie
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
```

---

## 🔐 Authentication System

---

### ✅ Register User

**POST** `/api/auth/register`

#### Request Body

```json
{
  "email": "doctor@test.com",
  "password": "Test1234",
  "firstName": "John",
  "lastName": "Doe",
  "role": "DOCTOR"
}
```

🔹 `role` → `"DOCTOR"` | `"PATIENT"`

#### Response (201)

```json
{
  "id": "uuid",
  "email": "doctor@test.com",
  "role": "DOCTOR",
  "createdAt": "2024-04-10T12:30:00Z"
}
```

---

### ✅ Login

**POST** `/api/auth/login`

#### Request Body

```json
{
  "email": "doctor@test.com",
  "password": "Test1234"
}
```

#### Behavior

* JWT is stored automatically in **HTTP-only cookie**
* No token handling in frontend

#### Response (200)

```json
{
  "message": "Login successful"
}
```

---

### ✅ Get Current User (Protected)

**GET** `/api/users/me`

#### Response

```json
{
  "id": "uuid",
  "email": "doctor@test.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "DOCTOR"
}
```

🔹 Use this endpoint:

* On app load
* After refresh
* To restore auth state

---

## 🤝 Engagement System

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

🔹 Access rules:

* `FULL_ACCESS`
* `READ_ONLY`
* `WRITE_ONLY`
* `TEMPORARY`
* `EMERGENCY`

#### Response

```json
{
  "id": "engagement-uuid",
  "token": "START_VERIFICATION_TOKEN",
  "status": "PENDING"
}
```

📌 **Important for UI**

* Show QR / token to patient
* Status is NOT active yet

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

📌 Engagement becomes usable after this step.

---

### ✅ Get My Engagements

**GET** `/api/engagements/my-engagements`

#### Response

```json
[
  {
    "id": "engagement-uuid",
    "doctorId": "uuid",
    "patientId": "uuid",
    "status": "ACTIVE",
    "accessRule": "FULL_ACCESS",
    "createdAt": "2024-04-10T13:00:00Z"
  }
]
```

---

### ✅ Send Message

**POST** `/api/engagements/{id}/messages`

#### Request Body

```json
{
  "content": "Hello, how are you feeling today?"
}
```

#### Response

```json
{
  "id": "message-uuid",
  "senderId": "uuid",
  "content": "Hello, how are you feeling today?",
  "createdAt": "2024-04-10T13:05:00Z"
}
```

---

### ✅ Get Messages

**GET** `/api/engagements/{id}/messages`

#### Response

```json
[
  {
    "id": "msg-uuid",
    "senderId": "uuid",
    "content": "Hello Doctor",
    "createdAt": "2024-04-10T13:06:00Z",
    "system": false
  }
]
```

📌 `system: true` → auto system messages (status changes)

---

### ✅ Request End Engagement (Doctor)

**POST** `/api/engagements/{id}/end-request`

#### Request Body

```json
{
  "reason": "Treatment completed successfully"
}
```

#### Response

```json
{
  "token": "END_VERIFICATION_TOKEN"
}
```

---

### ✅ Verify Engagement End

**POST** `/api/engagements/{id}/verify-end`

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

## 🧠 State Machine (Frontend Logic)

```
PENDING → ACTIVE → END_REQUESTED → ENDED
```

Use this to:

* Enable / disable UI
* Show banners
* Lock messaging

---

## 🚨 Error Handling (Frontend)

```js
if (response.status === 401) {
  navigate("/login");
}

if (!response.ok) {
  const err = await response.json();
  toast.error(err.message);
}
```

---

## ✅ Why This Fix Matters

### Before ❌

* Abstract endpoints
* Missing request bodies
* Unclear field meanings
* Hard for frontend dev to guess behavior

### After ✅

* **Backend-accurate**
* **UI-friendly**
* **State-aware**
* **Production-ready**

---
