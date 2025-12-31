## 🌍 Community Era

**Community-driven Infrastructure Monitoring Platform**

The Community Era is a community based service that allows individuals to report, verify and prioritize local infrastructure challenges through the use of collective intelligence. The Community Era also collects real-world data from those within the community and uses this information to identify and emphasize those infrastructure challenges that will have the greatest impact regardless of government or political entities.


## 🎯 Project Overview

## PROBLEM STATEMENT

### ⚠️ PROBLEM

1. Public members will face challenges concerning local infrastructure (roads, water,and   
electricity).
2. Lack of real-time information,prior ranking,project awareness on area-specific needs.
3. There is a lack of transparency in projects, deadlines, and achievements being undertaken 
by or expected from local governance.
4. There is low civic engagement in reporting and addressing public infrastructure problems  because citizens feel their complaints are ignored or don’t see the impact of their participation.

## 💡 SOLUTION
 
The system is designed,so that the citizens and local authorities can work together at a distance to create an open,community based resource,for monitoring municipal infrastructure.

- Community voting to prioritize issues locally.

- Map-based reporting with radius-based duplicate prevention.

- Public project timeline + milestones.

- Participation dashboard (engagement stats).

## Core Features

### 1.Neighborhood Infrastructure Problem Report
  - Map-based Location Selection (50-100m Duplicate Prevention)
  - Classification of category and intensity
  - Display of reports for public attention
  - Citizens can report Road, Water, Electricity, Sanitation, etc.
  - Photo & Video Upload feature providing pictorial evidence of problems

### 2. Community Priority Ranking (Voting)
  - Upvote issues to prioritize them
  - Most-voted issues appear at the top
  - Visual vote count indicators
  - Helps authorities identify high-impact problems.

### 3. Participation Awareness Dashboard
  - Total registered users in an area.
  - Number of participating users.
  - Motivates civic engagement & tracks trends.

### 4. Public Accountability Timeline
  - Admin-managed infrastructure projects.
  - Milestone tracking with deadlines.
  - Automatic status updates (on-time/delayed).
  - Transparent progress tracking.
  - Citizens can comment and upvote projects/issues.
  - Area-based project listing (map pins / list view).


<img width="1536" height="1024" alt="community era" src="https://github.com/user-attachments/assets/1f7a7f67-ac45-4755-9a45-969c57e19db4" />




## 🛠️ Tech Stack

### Frontend
- **React** - Component-based UI
- **Tailwind CSS** - Rapid styling
- **Leaflet + OpenStreetMap** - Free mapping solution
- **React Router** - Navigation
- **Axios** - API Communication with Backend

### Backend
- **Node.js + Express** - REST API
- **MongoDB + Mongoose** - Database
- **Multer** - Image & video upload handling (issue reporting)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 📁 Project Structure

```
community-era/
├── backend/
│   ├── config/
│   │   └── db.js                 
│   ├── controllers/               
│   │   ├── auth.controller.js
│   │   ├── issues.controller.js
│   │   ├── projects.controller.js
│   │   └── votes.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── error.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Issue.js              
│   │   ├── Project.js            
│   │   └── Vote.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── issues.routes.js
│   │   ├── projects.routes.js
│   │   └── votes.routes.js
│   ├── utils/
│   │   └── geoUtils.js
│   ├── uploads/
│   │   ├── images/
│   │   └── videos/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   ├── IssueCard.jsx
│   │   │   ├── ProjectCard.jsx
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Issues.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Login.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── package-lock.json
│
├── scripts/
│   └── create-admin.js
├── .env
├── .gitignore
├── README.md
└── package.json             

```

## 🚧 Limitations

- Depends upon active participation from the community: Lack of engagement from people using 
  it can lead to erroneous prioritization of issues.
- Duplicate report detection range is limited:50-100m works well,but a potential problem 
  could exist in heavily populated areas.
- The project timelines & milestones need admin intervention.
- Lack of Direct Government API Integration.All reports, as well as project information, are 
  community-submitted, making it difficult to automatically verify them or sync government data.

## 🔮 Future Scope - For Round 2

#### End-to-End Issue Status Workflow
- Implement a complete issue lifecycle (OPEN → ASSIGNED → IN_PROGRESS → RESOLVED) with admin-controlled status updates, timeline logs, and filter-based views for citizens and authorities to track progress transparently.

#### Community Verification Mechanism
- Introduce community-based Confirm / Deny actions to validate reported issues, compute a dynamic verificationScore, and enable sorting to improve trust and reduce fake or irrelevant reports.

#### Analytics & Insights Dashboard
- Build a data-driven dashboard using MongoDB aggregation pipelines to visualize category-wise trends, open vs resolved issues, user participation statistics, and average issue resolution time.

#### Enhanced Duplicate Detection
- Improve duplicate prevention by combining geographic radius checks with lightweight text similarity, suggesting existing issues to users before allowing new submissions.

## 🤝 Contributing

This is a project demonstration. Feel free to fork and extend!

## 📝 License

MIT License

## 🐛 Troubleshooting

This project is currently under development. Demo data is used and some features are in progress.

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ for community-driven infrastructure monitoring**

