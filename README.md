# 🌍 Community Era - Empowering Citizen-Driven Governance

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.3-blue.svg)](https://tailwindcss.com/)

> **A community-driven infrastructure monitoring platform for transparent governance and citizen engagement**
---

## 🌐 Live Demo
[https://community-era.onrender.com](https://community-era.onrender.com)

---

Community Era empowers citizens to report, prioritize, and track local infrastructure issues, bridging the gap between communities and authorities.

---
## 🌟 The Problem We're Solving

Communities are faced with serious infrastructural problems:

- **60% of urban roads** have potholes/crack problems impacting the daily commute
- **40% of households** have monthly water pipeline leakage
- **70% of the populace** are not aware of the current restoration works.
Average Time Taken to Resolve Complaint: **15-30 Days**
- Only **20% of complaints** are correctly prioritized by authorities
- Less than **30% of the population** actually report infrastructure problems - More than **70%** of grievances are not recorded, causing delays in maintenance and resource allocation 

## Why Existing Solutions Fall Short

- ❌ **Duplicate Reports**: The same issues are reported repeatedly, thus inefficient use of authority resources.
- ❌ **Citizen Engagement** – Users do not engage actively in determining under which issues they can contribute.
- ❌ **Poor Transparency** – It’s difficult to monitor the progress of reported grievances.
- ❌ **Low Rates of Community Engagement** - Many citizens fail to report community issues because they lack motivation.
- ❌ **Evidence Gaps** – Issues reported via words alone may remain unanswered or disputed.

---

## ✨ Our Solution

**Community Era** is a complete ecosystem that empowers citizens, works on web and mobile devices, and provides real-time visibility and analytics to authorities.

### 🎯 Core Features

#### 1. Neighborhood Infrastructure Problem Report
- **Function:** Enables citizens to report local problems accurately and easily
- **Why Included:** Citizens first recognize concerns; Geolocation reporting means data applies to the physical world
– **Impact:**
  - Prevents duplicate reports using 50-100m radius check
  - Categorized and intensity reports enable efficient prioritization by the authorities.
  - Photos/videos serve as a concrete proof, which makes tracing problems easier.

#### 2. Community Priority Ranking (Voting)
- **Function:** Facilitates the selection of topics that require prioritization by the community.
- **Why Included:** Ensures that high-impact issues come to the forefront
- **Impact:**
  - Assists in directing the attention of the authorities where it is most required.
  - Vote transparency encourages trust among citizens
  – It reduces biases that may come solely from complaint data.

#### 3. Participation Awareness Dashboard
-**Function**: Identifies levels of active engagement and participation in each region.
- **Why Included:** Civic engagement falls if they fail to see their influence
- **Impact:**
  - By motivating users through active contributor displays
  - Keeps track of trends over time for areas that need more community interaction
  - Promotes participation in long-term monitoring

#### 4. Public Accountability Timeline
- **Function:** Enables public tracking of progress for infrastructure projects
- **Why Included:** Residents require insight into project Timelines and completion Status
- **Impact:**
  - Status updates (on time, delayed) hold the government accountable
  - Enables citizens to post comments and up-vote projects. This builds a two-way feedback channel.
  - the map/list view facilitates tracking of projects particular to an area.
  - Fosters trust and transparency in local governance.

---

## 🏗️ System Architecture

<!-- Paste your system architecture diagram or description here -->

---

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - Component-based UI  
- **Tailwind CSS 3.3** - Rapid styling  
- **Leaflet + OpenStreetMap** - Map integration  
- **React Router** - Navigation  
- **Axios** - API communication with backend  

### Backend
- **Node.js 18+ + Express** - REST API and server  
- **MongoDB + Mongoose** - Database  
- **Multer** - Image/video uploads  
- **JWT** - Authentication  
- **bcryptjs** - Password hashing  
- **express-validator** - Input validation  

---

## 📘 Usage Guide

### 👤 Users (Citizens)
- Sign up / log in securely.
- Report local issues by selecting location, category, severity, and uploading photos/videos.
- View nearby issues and track their status in real time.
- Vote on issues to help prioritize urgent problems.
- Stay informed through transparent updates.

---

### 🛠️ Admins (Authorities)
- Log in with role-based access.
- Review and verify reported issues.
- Manage duplicates and update issue status.
- Post progress updates and mark issues as resolved.
- Ensure transparency and platform security.

---


## 📂 Project Structure

```
community-era/
├── frontend/                 # React app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── contexts/         # React contexts (Auth, Map)
│   │   ├── services/         # API & helper functions
│   │   ├── hooks/            # Custom React hooks
│   │   └── styles/           # Tailwind CSS
│   └── public/               # Static assets
│
├── backend/                  # Node.js API
│   ├── controllers/          # Request handlers
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth, validation
│   ├── models/               # Mongoose schemas
│   └── utils/                # Helper functions
│
├── uploads/                  # Images and videos
└── README.md                 # Project documentation

```

---

## 🎯 Key Achievements

✅ **Duplicate Report Prevention** – Geolocation-based checks  
✅ **Community-Driven Prioritization** – Citizen votes determine urgency  
✅ **Public Accountability** – Transparent project timelines  
✅ **Multi-Category Support** – Roads, water, electricity, sanitation  
✅ **Mobile-Optimized** – Works seamlessly on smartphones  
✅ **Evidence-Based Reporting** – Photos/videos for reliable complaints  

---

## 🔒 Security Features

🔐 **JWT Authentication** – Secure token-based auth  
🛡️ **Role-Based Access Control (RBAC)** – Granular permissions  
🚫 **Input Validation** – Prevents injection attacks  
🌐 **HTTPS/TLS** – Secure communication



## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Harshit Bisht** – Project Lead  
- **Gaurav Mer** – Frontend Developer  
- **Harsh Jantwal** – Backend Developer  
- **Bhawesh Pant** – Researcher

---
<div align="center">

**Made with ❤️ for stronger and more transparent communities**

[⭐ Star us on GitHub](https://github.com/harshitbisht07/Community-Era) |
[🐛 Report Bug](https://github.com/harshitbisht07/Community-Era/issues)

</div>