# 🌍 Community Era

**Community-driven Infrastructure Monitoring Platform**

Community Era is a web-based platform designed to monitor and prioritize local infrastructure problems through community participation and data-driven insights. Instead of focusing on governance or politics, the platform treats citizens as data contributors, helping identify high-impact issues using collective intelligence.

## 🎯 Project Overview

The system enables users to:
- Report infrastructure problems (roads, water, electricity, etc.)
- Validate issues through community voting
- Track participation awareness
- Monitor project timelines transparently

## ✨ Core Features

### 1. Community Infrastructure Problem Reporting
- Map-based location selection
- Category and severity classification
- Public visibility of all reports

### 2. Community Priority Ranking (Voting)
- Upvote issues to prioritize them
- Most-voted issues appear at the top
- Visual vote count indicators

### 3. Participation Awareness Dashboard
- Total registered users in an area
- Number of participating users
- Participation percentage with visual indicators
- Encourages community engagement

### 4. Public Accountability Timeline
- Admin-managed infrastructure projects
- Milestone tracking with deadlines
- Automatic status updates (on-time/delayed)
- Transparent progress tracking

## 🛠️ Tech Stack

### Frontend
- **React** - Component-based UI
- **Tailwind CSS** - Rapid styling
- **Leaflet + OpenStreetMap** - Free mapping solution
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Node.js + Express** - REST API
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🚀 Setup & Installation

### 1. Clone the repository
```bash
git clone <repo-url>
cd community-era
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/community-era
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a secure random string in production!

### 4. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# On macOS/Linux
mongod

# On Windows, start MongoDB service
# Or use MongoDB Atlas (cloud) and update MONGODB_URI
```

### 5. Run the application

#### Option A: Run both frontend and backend together
```bash
# From root directory
npm run dev
```

#### Option B: Run separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
community-era/
├── backend/
│   ├── models/          # MongoDB models
│   │   ├── User.js
│   │   ├── ProblemReport.js
│   │   ├── Vote.js
│   │   └── ProjectTimeline.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── reports.js
│   │   ├── votes.js
│   │   ├── participation.js
│   │   └── projects.js
│   ├── middleware/      # Auth middleware
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── hooks/       # Custom hooks
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Reports
- `GET /api/reports` - Get all reports (with pagination, filters)
- `GET /api/reports/:id` - Get single report
- `POST /api/reports` - Create report (protected)
- `PATCH /api/reports/:id` - Update report (protected)
- `DELETE /api/reports/:id` - Delete report (protected)

### Votes
- `POST /api/votes` - Vote on a report (protected)
- `DELETE /api/votes/:reportId` - Remove vote (protected)
- `GET /api/votes/check/:reportId` - Check if user voted (protected)

### Participation
- `GET /api/participation` - Get participation statistics
- `GET /api/participation/by-area` - Get participation by area

### Projects (Admin only)
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (admin)
- `PATCH /api/projects/:id` - Update project (admin)
- `POST /api/projects/:id/milestones` - Add milestone (admin)
- `PATCH /api/projects/:id/milestones/:milestoneId` - Update milestone (admin)
- `DELETE /api/projects/:id` - Delete project (admin)

## 👤 User Roles

### Regular User
- Register and login
- Report infrastructure issues
- Vote on reports
- View participation dashboard
- View project timelines

### Admin
- All user capabilities
- Create and manage project timelines
- Add/update milestones
- Delete projects

**Note:** To create an admin user, manually update the user's role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation on all forms
- Role-based access control
- Protected API routes

## 📊 Database Schema

### User
- username, email, password
- role (user/admin)
- location (city, area, coordinates)

### ProblemReport
- title, description, category, severity
- location (coordinates, address)
- reportedBy (User reference)
- votes, voters array
- status

### Vote
- report (ProblemReport reference)
- user (User reference)
- Unique constraint on (report, user)

### ProjectTimeline
- title, description, category
- location
- milestones array
- status, dates
- createdBy (User reference)

## 🎨 Features in Detail

### Map View
- Interactive map with OpenStreetMap
- Click to report new issues
- Markers for all reported issues
- Color-coded by category
- Popup with issue details

### Reports Page
- Filter by category
- Sort by votes, date, or severity
- Pagination support
- Vote/unvote functionality
- Detailed issue cards

### Participation Dashboard
- Total vs participating users
- Participation percentage
- Visual progress indicators
- Area-wise breakdown
- Recent activity statistics

### Admin Timeline
- Create infrastructure projects
- Add multiple milestones
- Set deadlines
- Automatic status updates
- Track project progress

## 🚧 Limitations

- Manual data entry for timelines (no government API integration)
- Limited report verification
- Designed as community intelligence tool, not official authority system

## 🔮 Future Scope

- Heatmap-based issue visualization
- AI-based issue categorization
- Multilingual support
- Mobile application
- Advanced analytics dashboards
- Real-time notifications
- Image upload for reports

## 🤝 Contributing

This is a project demonstration. Feel free to fork and extend!

## 📝 License

MIT License

## 👨‍💻 Development Notes

### Creating Test Data

You can use MongoDB shell or a tool like Postman to create test data:

```javascript
// Create admin user (after registration)
db.users.updateOne(
  { email: "admin@test.com" },
  { $set: { role: "admin" } }
)
```

### Testing the API

Use tools like:
- Postman
- curl
- Thunder Client (VS Code extension)

Example API call:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Change PORT in backend/.env
- Update proxy in frontend/package.json if needed

### CORS Issues
- Backend CORS is configured for localhost:3000
- Update CORS settings in backend/server.js for production

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ for community-driven infrastructure monitoring**

