# DevDrop Backend API Integration Guide

## Base URL
```
Development: http://localhost:5000
Production: https://yourdomain.com
```

## Authentication Flow

### 1. Register
**POST** `/api/v1/auth/register`

```json
{
  "email": "dev@example.com",
  "password": "SecurePass123",
  "role": "developer", // or "startup"
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "email": "...", "role": "..." },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": "15m"
  }
}
```

**Store tokens:**
- `accessToken`: localStorage/sessionStorage (for API calls)
- `refreshToken`: localStorage (for token refresh)

---

### 2. Login
**POST** `/api/v1/auth/login`

```json
{
  "email": "dev@example.com",
  "password": "SecurePass123"
}
```

Returns same structure as register.

---

### 3. Refresh Token
**POST** `/api/v1/auth/refresh`

```json
{
  "refreshToken": "eyJ..."
}
```

Use this when access token expires (15min). Returns new access + refresh token.

---

### 4. Logout
**POST** `/api/v1/auth/logout`

Headers:
```
Authorization: Bearer <accessToken>
Body:
{
  "refreshToken": "<refreshToken>"
}
```

---

## Developer Endpoints

All require `Authorization: Bearer <token>` header and `role: developer`.

### Get My Profile
**GET** `/api/v1/developers/me`

### Update My Profile
**PATCH** `/api/v1/developers/me`

```json
{
  "fullName": "John Doe",
  "title": "Senior Node.js Engineer",
  "skills": ["Node.js", "React", "MongoDB"],
  "experienceYears": 5,
  "githubUrl": "https://github.com/johndoe",
  "bio": "Full-stack developer...",
  "hourlyRate": 75,
  "availability": "full-time"
}
```

**Note:** Updating `skills` triggers AI matching automatically (queued).

---

## Startup Endpoints

All require `Authorization: Bearer <token>` header and `role: startup`.

### Get My Startup Profile
**GET** `/api/v1/startups/me`

### Update My Startup Profile
**PATCH** `/api/v1/startups/me`

```json
{
  "companyName": "Acme Inc",
  "website": "https://acme.com",
  "industry": "Technology",
  "companySize": "11-50",
  "bio": "We build cool things...",
  "logoUrl": "https://acme.com/logo.png"
}
```

---

## Jobs

### Get Job Feed (Public)
**GET** `/api/v1/jobs/feed?page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### Get Job Details (Public)
**GET** `/api/v1/jobs/:id`

### Create Job (Startup only)
**POST** `/api/v1/jobs/`

Headers:
```
Authorization: Bearer <startup_token>
```

```json
{
  "title": "Senior Backend Engineer",
  "description": "We're looking for an experienced Node.js developer...",
  "techStack": ["Node.js", "Express", "MongoDB", "Redis"],
  "salaryRange": {
    "min": 80000,
    "max": 120000,
    "currency": "USD"
  },
  "jobType": "full-time",
  "location": "Remote"
}
```

---

## Applications

### Apply to Job (Developer only)
**POST** `/api/v1/applications/`

Headers:
```
Authorization: Bearer <developer_token>
```

```json
{
  "jobId": "job_object_id",
  "coverLetter": "I'm interested in this position because...",
  "resumeSnapshot": "URL to resume or text summary"
}
```

**Note:** Limited to 10 applications per day (configurable via `DAILY_APPLICATION_LIMIT`).

---

### Get My Applications (Developer)
**GET** `/api/v1/applications/my-apps?page=1&limit=10`

Headers:
```
Authorization: Bearer <developer_token>
```

---

### Get Job Applicants (Startup)
**GET** `/api/v1/applications/job/:jobId?page=1&limit=20`

Headers:
```
Authorization: Bearer <startup_token>
```

---

### Update Application Status (Startup)
**PATCH** `/api/v1/applications/:id/status`

Headers:
```
Authorization: Bearer <startup_token>
```

```json
{
  "status": "shortlisted" // pending | reviewed | shortlisted | rejected | accepted
}
```

---

## Payments (Startup only)

### Create Checkout Session
**POST** `/api/v1/payments/create-checkout`

Headers:
```
Authorization: Bearer <startup_token>
```

```json
{
  "credits": 10 // number of credits to purchase
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://checkout.stripe.com/..."
  }
}
```

Redirect user to this URL to complete payment.

---

### Stripe Webhook
**POST** `/api/v1/payments/webhook`

Called by Stripe automatically (no auth). Handles payment confirmation and credits.

---

## Error Responses

All endpoints return consistent format:

**Success (200/201):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "error": null
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE" // optional
}
```

---

## Rate Limits

- General API: **100 requests per 15 minutes** per IP (Redis-tracked)
- Applications: **10 per day** per developer
- Stripe webhook: Unlimited ( exempt )

---

## Required Headers

### For authenticated endpoints:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### For public endpoints:
```
Content-Type: application/json
```

---

## Token Expiry & Refresh Flow

1. Access token expires in **15 minutes**
2. When you get `401 Unauthorized`, call `/auth/refresh` with your refresh token
3. Replace old tokens with new ones
4. If refresh fails, user must login again

**Implementation:**
```javascript
// Interceptor example (axios)
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      const newTokens = await axios.post('/api/v1/auth/refresh', { refreshToken });
      localStorage.setItem('accessToken', newTokens.data.accessToken);
      localStorage.setItem('refreshToken', newTokens.data.refreshToken);
      // Retry original request
      error.config.headers.Authorization = `Bearer ${newTokens.data.accessToken}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## CORS

Backend allows requests from `process.env.CLIENT_URL` (default: `http://localhost:3000`).

If your frontend runs on a different port, update `.env`:
```
CLIENT_URL=http://localhost:5173
```

---

## WebSocket / Real-time

Messaging system is **Socket.io ready** but not yet implemented. To add:

1. Install Socket.io in backend: `npm install socket.io`
2. Create `socket.server.js` for event handling
3. Frontend: `io()` connection with auth token
4. Implement message storage in MongoDB (Message model)

---

## Environment Variables Required

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb+srv://...
REDIS_URL=rediss://...
JWT_SECRET=your_jwt_secret
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY_DAYS=7
MISTRAL_API_KEY=your_mistral_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASS=...
EMAIL_FROM=noreply@yourplatform.com
DAILY_APPLICATION_LIMIT=10
```

---

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","role":"developer","name":"Test"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Get profile (replace TOKEN)
curl http://localhost:5000/api/v1/developers/me \
  -H "Authorization: Bearer TOKEN"

# Get job feed
curl http://localhost:5000/api/v1/jobs/feed

# Create job (startup token required)
curl -X POST http://localhost:5000/api/v1/jobs/ \
  -H "Authorization: Bearer STARTUP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Dev Job","description":"Hiring","techStack":["Node.js"]}'
```

---

## Frontend Integration Checklist

- [ ] Store tokens securely (httpOnly cookies OR localStorage with XSS protection)
- [ ] Attach `Authorization: Bearer <token>` header to all authenticated requests
- [ ] Implement token refresh logic (auto-retry on 401)
- [ ] Handle logout: call `/auth/logout` + clear storage
- [ ] Use env variable for API base URL
- [ ] Implement error handling for rate limits (429 response)
- [ ] For file uploads (resumes), use FormData

---

## Next Steps

1. **Start backend**: `npm start` (port 5000)
2. **Start AI worker**: `npm run worker:ai`
3. **Start notification worker**: `npm run worker:notification`
4. **Update frontend `.env`**:
   ```
   VITE_API_URL=http://localhost:5000
   ```
5. **Implement API service layer** in frontend (e.g., `src/services/api.js`)
6. **Test endpoints** via Swagger UI first: `http://localhost:5000/api-docs`

---

## Support

Check logs:
- `logs/combined.log` - all logs
- `logs/error.log` - errors only

Swagger documentation: `http://localhost:5000/api-docs`
