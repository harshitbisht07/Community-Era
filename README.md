# 🌍 Community Era

**Community Era** is a comprehensive civic engagement platform designed to empower citizens and local authorities to collaborate on infrastructure improvements. By combining geospatial reporting, real-time data visualization, and community voting, we turn complaints into actionable data.

![Community Era](./frontend/public/logo192.png)
_(Replace with actual screenshot if available)_

---

## 🚀 Key Features

### For Citizens 👥

- **📍 Geospatial Reporting**: Report issues (potholes, garbage, water leaks) by pinning them directly on an interactive map.
- **📸 Evidence Upload**: Attach photos to reports to provide clear evidence.
- **👍 Community Validation**: Upvote and comment on existing reports to highlight urgency.
- **📊 Personal Dashboard**: Track your impact score, view filed reports, and manage your profile.
- **🗺️ Smart Clustering**: The map automatically clusters nearby reports to prevent clutter and show heatmaps of problem areas.

### For Authorities (Admin) 👮

- **🖥️ Command Center**: A centralized Admin Dashboard to view all incoming reports with filtering capabilities.
- **📈 Analytics Engine**: Visual charts (Bar/Pie) displaying issue distribution by category, severity, and status.
- **✅ Status Management**: Update report lifecycles (`Open` → `In Progress` → `Resolved`) to keep citizens informed.
- **🚧 Project Timelines**: Manage larger infrastructure projects with dedicated timelines (if applicable).
- **👥 User Management**: Monitor user activity and manage permissions.

---

## 🛠️ Technology Stack

### Frontend (Client)

- **Framework**: [React.js](https://reactjs.org/) (Create React App)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a modern, responsive design.
- **Mapping**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/) for OpenStreetMap integration.
- **Visualization**: [Recharts](https://recharts.org/) for admin analytics.
- **State Management**: React Context API (`AuthContext`).
- **Icons**: React Icons (Feather Icons).

### Backend (Server)

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/) for RESTful API routing.
- **Database**: [MongoDB](https://www.mongodb.com/) (with Mongoose ODM) & Geospatial Indexing (`2dsphere`).
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs for security.
- **File Handling**: Multer (Memory Storage) for processing image uploads.
- **Image Processing**: Base64 encoding for image storage (configurable to cloud storage).

---

## ⚙️ Installation & Setup Guide

Follow these steps to run the application locally.

### Prerequisites

- Node.js (v16.0.0 or higher)
- MongoDB (Running locally or via MongoDB Atlas connection string)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/community-era.git
cd community-era
```

### 2. Backend Configuration

Navigate to the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/community_era
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

Start the Backend Server:

```bash
npm run dev
# The server will start on http://localhost:5001
```

### 3. Frontend Configuration

Open a new terminal, navigate to the `frontend` directory and install dependencies:

```bash
cd frontend
npm install
```

Start the Frontend Application:

```bash
npm start
# The application will open in your browser at http://localhost:3000
```

---

## 📂 System Architecture

### Database Models

- **User**: Stores auth details, roles (`user`/`admin`), and location data.
- **ProblemReport**: The core entity containing title, description, location (GeoJSON), severity, status (`open`, `resolved`, etc.), and images.
- **Vote**: Tracks user endorsements for reports to prevent double-voting.
- **Comment**: Enables threaded discussions on specific reports.
- **ProjectTimeline**: (Backend readiness) For tracking long-term infrastructure project milestones.

### Directory Structure

```
community-era/
├── backend/
│   ├── middleware/   # Auth verification & File Upload logic
│   ├── models/       # Mongoose Schemas
│   ├── routes/       # API Route Controllers
│   └── server.js     # App Entry point
│
├── frontend/
│   ├── public/       # Static assets
│   └── src/
│       ├── components/ # Reusable UI definitions (Navbar, AuthModal, etc.)
│       ├── context/    # Global State (Authentication)
│       └── pages/      # Route Views (Home, MapView, Profile, etc.)
```

---

## 🤝 Contributing

We welcome contributions to make our cities better!

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/NewFeature`).
3.  Commit your Changes (`git commit -m 'Add some NewFeature'`).
4.  Push to the Branch (`git push origin feature/NewFeature`).
5.  Open a Pull Request.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
