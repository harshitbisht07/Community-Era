# Quick Setup Guide

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install all dependencies (root, backend, frontend)
npm run install-all
```

Or manually:
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
- Install MongoDB from https://www.mongodb.com/try/download/community
- Start MongoDB service
- Default connection: `mongodb://localhost:27017/community-era`

**Option B: MongoDB Atlas (Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update `MONGODB_URI` in backend/.env

### 3. Configure Environment

Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/community-era
JWT_SECRET=change-this-to-a-random-secret-string-in-production
NODE_ENV=development
```

**Important:** Generate a secure JWT_SECRET:
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use any random string generator
```

### 4. Run the Application

**Development Mode (Both servers):**
```bash
npm run dev
```

**Or separately:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

### 6. Create Admin User

1. Register a user through the web interface
2. Open MongoDB shell or Compass
3. Update user role:
```javascript
db.users.updateOne(
  { email: "your-admin-email@example.com" },
  { $set: { role: "admin" } }
)
```

### 7. Test the Application

1. Register a new account
2. Login
3. Go to Map page and click to report an issue
4. Go to Reports page and vote on issues
5. Check Dashboard for participation stats
6. (As admin) Go to Admin Timeline to create projects

## Troubleshooting

### Port 3000 or 5000 already in use
- Change PORT in backend/.env
- Or kill the process using the port

### MongoDB connection error
- Check if MongoDB is running
- Verify MONGODB_URI in .env
- Check MongoDB logs

### CORS errors
- Ensure backend is running on port 5000
- Check proxy setting in frontend/package.json

### Module not found errors
- Delete node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### Backend (Render/Vercel/Railway)
1. Set environment variables
2. Deploy backend code
3. Update CORS to allow frontend domain

### Frontend (Vercel/Netlify)
1. Update API URL in axios calls (or use environment variables)
2. Build: `npm run build`
3. Deploy build folder

### Environment Variables for Production
- Use strong JWT_SECRET
- Use MongoDB Atlas or managed MongoDB
- Set NODE_ENV=production
- Configure CORS properly

