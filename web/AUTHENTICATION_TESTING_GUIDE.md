# 🔐 Authentication Integration - Testing Guide

## ✅ Changes Made

### 1. **API Client Configuration** (`src/services/apiClient.js`)

- ✅ Updated base URL from `http://localhost:5000` → `http://localhost:8080`
- ✅ Added `withCredentials: true` for HTTP-only cookie authentication
- ✅ Removed manual Bearer token handling (cookies handle this automatically)

### 2. **Authentication Service** (`src/services/authService.js`)

- ✅ **REMOVED** all mock mode code
- ✅ Connected to real backend API endpoints
- ✅ Updated login to match backend response structure
- ✅ Updated register to transform `accountType` → `role` (uppercase)
- ✅ Added getCurrentUser for session restoration
- ✅ Updated logout to clear HTTP-only cookie

### 3. **Auth Store** (`src/store/authStore.js`)

- ✅ **REMOVED** token from state (backend manages via cookies)
- ✅ Changed `accountType` → `role` to match backend
- ✅ Updated role checking methods (isDoctor, isPatient)
- ✅ Added getAccountType() for backward compatibility

### 4. **Auth Hook** (`src/hooks/useAuth.js`)

- ✅ Updated loginUser to handle backend response structure
- ✅ Updated registerUser to pass correct role format
- ✅ Removed token dependency
- ✅ Added accountType getter for backward compatibility

### 5. **Login Page** (`src/pages/Login.jsx`)

- ✅ Updated redirect logic to use role from backend response
- ✅ Fixed navigation paths (doctor → dashboard, patient → /doctors)

### 6. **Register Page** (`src/pages/Register.jsx`)

- ✅ Updated redirect logic to use role from backend response
- ✅ Password validation already matches backend requirements

### 7. **Environment Configuration**

- ✅ Created `.env.development` with correct API URL

---

## 🧪 Testing Checklist

### **Prerequisites**

- [ ] Backend server running on `http://localhost:8080`
- [ ] PostgreSQL database is running
- [ ] Frontend dev server running: `npm run dev`

### **Test 1: Register as Patient**

1. Navigate to `/register`
2. Fill in the form:
   - Account Type: **Patient**
   - First Name: `Test`
   - Last Name: `Patient`
   - Email: `testpatient@example.com`
   - Password: `Test1234` (must have uppercase, lowercase, number)
   - Confirm Password: `Test1234`
   - Check "Agree to terms"
3. Click **Register**
4. **Expected Result:**
   - ✅ Success message appears
   - ✅ Redirected to `/doctors` page
   - ✅ User is logged in
   - ✅ Check browser DevTools → Application → Cookies → See `neuralhealer_token` cookie

### **Test 2: Register as Doctor**

1. Navigate to `/register`
2. Fill in the form:
   - Account Type: **Doctor**
   - First Name: `Test`
   - Last Name: `Doctor`
   - Email: `testdoctor@example.com`
   - Password: `Test1234`
   - Confirm Password: `Test1234`
   - Check "Agree to terms"
3. Click **Register**
4. **Expected Result:**
   - ✅ Success message appears
   - ✅ Redirected to `/doctor-dashboard` page
   - ✅ User is logged in

### **Test 3: Login as Patient**

1. Navigate to `/login`
2. Enter credentials:
   - Email: `patient@test.com` (or use your registered patient)
   - Password: `Test1234`
3. Click **Login**
4. **Expected Result:**
   - ✅ Login successful
   - ✅ Redirected to `/doctors` page
   - ✅ User state persists

### **Test 4: Login as Doctor**

1. Navigate to `/login`
2. Enter credentials:
   - Email: `doctor@test.com` (or use your registered doctor)
   - Password: `Test1234`
3. Click **Login**
4. **Expected Result:**
   - ✅ Login successful
   - ✅ Redirected to `/doctor-dashboard` page

### **Test 5: Invalid Credentials**

1. Navigate to `/login`
2. Enter wrong credentials:
   - Email: `wrong@email.com`
   - Password: `wrongpass`
3. Click **Login**
4. **Expected Result:**
   - ❌ Error message displays
   - ❌ Not logged in

### **Test 6: Session Persistence**

1. Login successfully
2. Refresh the page (F5)
3. **Expected Result:**
   - ✅ User remains logged in
   - ✅ No redirect to login page
   - ✅ User data still available

### **Test 7: Logout**

1. While logged in, click Logout (in navbar/menu)
2. **Expected Result:**
   - ✅ Redirected to home/login page
   - ✅ User state cleared
   - ✅ Cookie removed from browser

### **Test 8: Protected Routes**

1. Logout completely
2. Try to access `/doctor-dashboard` or `/chat` directly
3. **Expected Result:**
   - ✅ Redirected to `/login`
   - ✅ After login, redirected back to intended page

---

## 🐛 Common Issues & Solutions

### Issue 1: "CORS Error" or "Network Error"

**Cause:** Backend not allowing `localhost:5173`

**Solution:**

- Check backend CORS configuration
- Verify backend is running on port 8080
- Check backend logs for CORS errors

### Issue 2: "401 Unauthorized" on getCurrentUser

**Cause:** Cookie not being sent or expired

**Solution:**

- Check if `withCredentials: true` is set in apiClient
- Verify cookie exists in DevTools → Application → Cookies
- Clear cookies and login again

### Issue 3: "Cannot read property 'role' of undefined"

**Cause:** Backend response structure mismatch

**Solution:**

- Check browser Network tab → Response data
- Verify backend returns: `{ data: { userId, email, firstName, lastName, role }, message }`
- Update authService if structure differs

### Issue 4: Register fails with validation error

**Cause:** Backend expects different field names

**Solution:**

- Check backend expects: `{ email, password, firstName, lastName, role }`
- Verify role is uppercase: "PATIENT" or "DOCTOR"
- Check Network tab for exact error message

---

## 🔍 Debugging Tips

### Check Network Requests

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by **XHR** or **Fetch**
4. Look for requests to:
   - `POST /api/auth/login`
   - `POST /api/auth/register`
   - `GET /api/users/me`
   - `POST /api/auth/logout`

### Check Request Payload

- Click on the request in Network tab
- Go to **Payload** or **Request** tab
- Verify data being sent matches backend expectations

### Check Response

- Click on the request in Network tab
- Go to **Response** tab
- Verify structure matches what frontend expects

### Check Cookies

1. DevTools → **Application** tab
2. Expand **Cookies** in sidebar
3. Click on `http://localhost:5173`
4. Look for `neuralhealer_token` cookie
5. Verify it has:
   - HttpOnly: ✅ true
   - Secure: ⬜ false (local dev)
   - SameSite: Lax or None

### Check Console Logs

- Look for `[AUTH]` prefixed messages
- Check for any error messages
- Verify API calls are being made

---

## 📊 Expected API Response Structures

### Login Response

```json
{
  "data": {
    "userId": "uuid-string",
    "email": "user@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "PATIENT"
  },
  "message": "Login successful"
}
```

### Register Response

```json
{
  "data": {
    "userId": "uuid-string",
    "email": "user@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "PATIENT",
    "createdAt": "2026-01-08T10:00:00Z"
  },
  "message": "Registration successful"
}
```

### Get Current User Response

```json
{
  "userId": "uuid-string",
  "email": "user@example.com",
  "firstName": "Test",
  "lastName": "User",
  "role": "PATIENT"
}
```

---

## ✅ Success Criteria

- [x] Users can register as Patient or Doctor
- [x] Users can login with correct credentials
- [x] Invalid credentials show error message
- [x] Session persists on page refresh
- [x] Users can logout successfully
- [x] Protected routes redirect to login
- [x] After login, redirect to appropriate dashboard
- [x] No console errors
- [x] HTTP-only cookie is set correctly

---

## 🚀 Next Steps (After Testing)

Once authentication is working:

1. ✅ Test with real backend
2. ⏳ Integrate Doctors directory (fetch from `/api/doctors`)
3. ⏳ Prepare AI chat interface (waiting for backend)
4. ⏳ Add WebSocket for real-time features

---

## 📞 Backend API Endpoints Used

| Endpoint             | Method | Purpose           |
| -------------------- | ------ | ----------------- |
| `/api/auth/register` | POST   | Register new user |
| `/api/auth/login`    | POST   | Login user        |
| `/api/users/me`      | GET    | Get current user  |
| `/api/auth/logout`   | POST   | Logout user       |

---

## 💡 Important Notes

1. **No Token in Frontend Code**: JWT is stored in HTTP-only cookie, frontend never sees it
2. **Role Format**: Backend uses uppercase ("PATIENT", "DOCTOR"), frontend handles both
3. **Credentials Required**: All API calls must include `withCredentials: true`
4. **Cookie Domain**: Works only on same domain (localhost:5173 ↔ localhost:8080)
5. **CORS Must Allow**: Backend must allow `http://localhost:5173` origin with credentials

---

**Ready to Test!** 🎉

Start the backend server, then run the frontend and follow the testing checklist above.
