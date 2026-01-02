# NeuralHealer API v0.1

> **Hint for Frontend Collaborator:** This API uses HTTP-only cookies for JWT token storage. When making requests from the React app (localhost:5173), ensure you include `credentials: 'include'` or `withCredentials: true` in your fetch/axios configuration to automatically send cookies with cross-origin requests.

**CORS Configuration:** The backend is configured to accept requests from `http://localhost:5173` (React dev server). No changes needed to your frontend host port.

---

## 🔌 Working API Endpoints

### Base URL
```
http://localhost:8080
```

### Authentication System

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user (Doctor/Patient) | None |
| POST | `/api/auth/login` | Authenticate user, returns JWT in HTTP-only cookie | None |
| GET | `/api/users/me` | Get current user profile | DOCTOR or PATIENT |

### Engagement System

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| POST | `/api/engagements/initiate` | Doctor initiates engagement with patient | DOCTOR |
| POST | `/api/engagements/verify-start` | Patient verifies engagement start | PATIENT |
| GET | `/api/engagements/my-engagements` | List user's engagements | DOCTOR or PATIENT |
| POST | `/api/engagements/{id}/messages` | Send message in engagement | DOCTOR or PATIENT |
| GET | `/api/engagements/{id}/messages` | Get engagement messages | DOCTOR or PATIENT |
| POST | `/api/engagements/{id}/end-request` | Request to end engagement | DOCTOR |
| POST | `/api/engagements/{id}/verify-end` | Verify/end engagement | DOCTOR or PATIENT |

---

## 📡 Request Examples (React/JavaScript)

### Authentication
```javascript
// Register Doctor
const registerDoctor = async () => {
  const response = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: "doctor@test.com",
      password: "Test1234",
      firstName: "John",
      lastName: "Doe",
      role: "DOCTOR"
    }),
    credentials: 'include'  // Important for cookies
  });
  return await response.json();
};

// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'  // Important for cookies
  });
  return await response.json();
};

// Get Current User (automatically uses cookie)
const getCurrentUser = async () => {
  const response = await fetch('http://localhost:8080/api/users/me', {
    credentials: 'include'  // Automatically sends the HTTP-only cookie
  });
  return await response.json();
};
```

### Engagement Flow
```javascript
// Initiate Engagement (Doctor)
const initiateEngagement = async (patientId) => {
  const response = await fetch('http://localhost:8080/api/engagements/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId,
      accessRuleName: "FULL_ACCESS"
    }),
    credentials: 'include'
  });
  return await response.json();
};

// Send Message
const sendMessage = async (engagementId, content) => {
  const response = await fetch(`http://localhost:8080/api/engagements/${engagementId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
    credentials: 'include'
  });
  return await response.json();
};
```

---

## 🔧 Important Notes for Frontend

1. **Cookie Authentication**: JWT tokens are automatically stored in HTTP-only cookies. No need to manually handle tokens in localStorage or state.

2. **CORS Configuration**: Backend accepts requests from:
   - Origin: `http://localhost:5173`
   - Credentials: Included (cookies)

3. **Required Headers**: For POST/PUT requests, always include:
   ```javascript
   headers: {
     'Content-Type': 'application/json'
   }
   ```

4. **Credentials**: Always include `credentials: 'include'` in fetch requests.

5. **Error Handling**: Check response status and handle 401 (Unauthorized) by redirecting to login.

---

## 🚀 Quick Start for Frontend

1. **Start Backend**: Ensure the Spring Boot app is running on `localhost:8080`

2. **Start Frontend**: Keep React app on `localhost:5173` (no port changes needed)

3. **Test Connection**: 
   ```javascript
   // Test if backend is accessible
   fetch('http://localhost:8080/api/auth/health', { credentials: 'include' })
     .then(res => console.log('Backend connected:', res.ok))
     .catch(err => console.error('Connection failed:', err));
   ```

---

## 📋 Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Proceed normally |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Check request body/parameters |
| 401 | Unauthorized | User not authenticated - redirect to login |
| 403 | Forbidden | User lacks required role |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend issue - check server logs |

---

**Version:** 0.1  
**Last Updated:** April 2024  
**Backend Port:** 8080  
**Frontend Port:** 5173 (Keep as is)  
**CORS:** Configured for `http://localhost:5173`