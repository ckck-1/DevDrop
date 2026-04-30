# DevDrop Full-Stack Integration Guide

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│   Node Backend  │────▶│   MongoDB       │
│  (Vite + TS)    │     │   (Express)     │     │   Atlas         │
│  Port: 5173     │     │   Port: 5000    │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │    Redis        │
                         │   (Upstash)     │
                         └─────────────────┘
```

---

## Step 1: Start Backend

```powershell
# Terminal 1: Backend
cd C:\Users\HP\DevDrop\backend

# Ensure dependencies are installed
npm install

# Start backend server
npm start
```

**Expected output:**
```
MongoDB Connected
Redis Ready
Server running on port 5000
```

**Keep this terminal open.**

---

## Step 2: Start Background Workers

**Terminal 2 - AI Matcher:**
```powershell
cd C:\Users\HP\DevDrop\backend
npm run worker:ai
```

**Terminal 3 - Notifications:**
```powershell
cd C:\Users\HP\DevDrop\backend
npm run worker:notification
```

**Keep both terminals open.**

---

## Step 3: Start Frontend

**Terminal 4 - Frontend Dev Server:**
```powershell
cd C:\Users\HP\DevDrop\aura-ai-match

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

**Expected:** Frontend runs at `http://localhost:5173`

---

## Step 4: Verify Connection

1. Open browser to `http://localhost:5173`
2. Click "Sign Up" → Register as Developer or Startup
3. Fill form → Submit
4. Should redirect to dashboard

If registration fails, check:
- Backend terminal for errors
- Both frontend and backend are running
- MongoDB is connected (backend logs)

---

## Step 5: Environment Configuration

### Backend `.env` (already set)
```
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```env  :https://devdrop-ds91.onrender.com/
```

Restart frontend after changing `.env`.

---

## Step 6: Test Key Features

### For Developers:
1. Register/Login
2. Complete profile (skills, experience, GitHub)
3. View job feed (auto-ML matching happens in background)
4. Apply to a job
5. View applications

### For Startups:
1. Register/Login
2. Complete profile (company info)
3. Post a job
4. View applicants
5. Update application status

---

## Common Issues & Fixes

### CORS Error in Browser Console
**Error:** `Access-Control-Allow-Origin` blocked

**Fix:** Ensure backend `.env` has:
```
CLIENT_URL=http://localhost:5173
```
Then restart backend.

---

### 401 Unauthorized
**Cause:** Token expired or not sent

**Fix:** The API client auto-refreshes. If persistent, logout and login again.

---

### MongoDB Atlas Connection Fails
**Fix:** Add your IP to Atlas IP whitelist:
1. Go to https://cloud.mongodb.com/v2/#/atlas/security/ip-access-list
2. Add current IP or use 0.0.0.0/0 temporarily

---

### Redis ETIMEDOUT
**Cause:** Upstash unreachable

**Fix:** Either:
- Use local Redis: `redis-server` (install from redis.io)
- Or ignore (Redis functionality degrades gracefully - caching disabled, queues won't work)

---

### Workers Not Running
**Check:** Open separate terminals for each worker.

**Start all three:**
```powershell
# Terminal 1: backend
npm start

# Terminal 2: AI worker
npm run worker:ai

# Terminal 3: notification worker
npm run worker:notification
```

---

## API Client Usage Examples

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useJobFeed } from '@/hooks/useApi';

function MyComponent() {
  const { user, logout } = useAuth();

  // Fetch jobs
  const { data: jobs, isLoading, error } = useJobFeed(1, 10);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      <h1>Hello, {user?.email}</h1>
      {jobs?.jobs.map(job => (
        <div key={job._id}>{job.title}</div>
      ))}
    </div>
  );
}
```

---

## Frontend Pages to Build

| Route | Purpose | Auth Required |
|-------|---------|--------------|
| `/` | Landing page | No |
| `/login` | Sign in | No |
| `/register` | Register | No |
| `/developer/dashboard` | Dev profile + matching results | Yes (dev) |
| `/startup/dashboard` | Startup stats + job management | Yes (startup) |
| `/jobs` | Browse all jobs | No |
| `/jobs/:id` | Job details | No |
| `/jobs/:id/apply` | Apply to job | Yes (dev) |
| `/applications` | View my applications | Yes (dev) |
| `/pricing` | Buy credits | Yes (startup) |
| `/messages` | In-app messaging (future) | Yes |

---

## Next Development Steps

1. **Profile Completion**
   - Add resume upload for developers
   - Add company logo upload for startups
   - Add skill tags with autocomplete

2. **Real-time Messaging**
   - Install `socket.io` on backend
   - Add `socket.io-client` in frontend
   - Create `Message` model in MongoDB
   - Build chat UI

3. **AI Matching Visualization**
   - Display match scores on job cards
   - Add "Why this match?" explanations
   - Allow developers to retrigger matching

4. **Stripe Integration**
   - Test with Stripe test cards
   - Add subscription management
   - Display credit balance

5. **Email Notifications**
   - Verify SendGrid is sending emails
   - Customize email templates
   - Add email preferences

6. **Production Deployment**
   - Backend: Railway/Render/Railway
   - Frontend: Vercel/Netlify
   - DBs: Atlas (keep), Redis (Upstash)
   - Set env vars securely

---

## Useful Commands

```bash
# Backend
npm start              # Start server
npm run worker:ai      # Start AI worker
npm run worker:notif    # Start notification worker
npm test               # Run tests
npm run lint           # Lint code

# Frontend
npm run dev            # Start dev server
npm run build          # Build for production
npm run preview        # Preview production build
npm run test           # Run tests
```

---

## Testing with cURL

```bash
# 1. Register
curl -X POST https://devdrop-ds91.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","password":"Test123!","role":"developer","name":"Dev"}'

# 2. Login
curl -X POST http://devdrop-ds91.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@test.com","password":"Test123!"}'

# 3. Get profile (replace TOKEN)
curl http://devdrop-ds91.onrender.com/api/v1/developers/me \
  -H "Authorization: Bearer TOKEN"

# 4. Get job feed
curl http://devdrop-ds91.onrender.com/api/v1/jobs/feed

# 5. Create job (startup)
curl -X POST http://devdrop-ds91.onrender.com/api/v1/jobs/ \
  -H "Authorization: Bearer STARTUP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Senior Developer","description":"Hiring!","techStack":["React","Node.js"]}'
```

---

## API Documentation

Interactive Swagger UI: **http://devdrop-ds91.onrender.com/api-docs**

All endpoints documented with request/response schemas and auth requirements.

---

## Need Help?

- Backend logs: `backend/logs/combined.log`
- Check server is running: `curl http://devdrop-ds91.onrender.com/api-docs`
- MongoDB: Verify connection in Atlas dashboard
- Redis: Check Upstash dashboard or `redis-cli ping`

Good luck building! 🚀
