# Employee Attendance System

A complete Employee Attendance System built with Node.js, Express, MongoDB (Atlas), React/Vite — with both **Employee** and **Manager** interfaces.  
Fully deployed (frontend + backend) and ready for use.

---

## 🔗 Live Demo

- Frontend (client): https://beautiful-pudding-dbc142.netlify.app  
- Backend (API): https://attendance-backend-adt2.onrender.com  

---

## 📂 Repository

https://github.com/KrishnaveniBojja2005/attendance-system

---

## 💡 Features

### ✅ Employee Features
- Register / Login  
- Mark Attendance (Check-in / Check-out)  
- View Attendance History (table)  
- Monthly Summary (present / late / half-day / total hours)  
- Dashboard with stats & quick Check-in / Check-out button  

### ✅ Manager Features
- Login only (no register)  
- View all employees’ attendance (with filters)  
- View team attendance summary: calendar + stats  
- Department-wise stats  
- Export attendance reports (CSV)  
- Dashboard: total employees, today’s present/absent/late/half-day, weekly trend chart  

---

## ⚙️ Setup Instructions (Local)

```bash
# Clone repo
git clone https://github.com/KrishnaveniBojja2005/attendance-system.git
cd attendance-system

# Backend
cd backend
npm install
# Create .env file, copy from .env.example, and fill:
# MONGO_URI=<your MongoDB Atlas URI>
# JWT_SECRET=<your JWT secret>
# PORT=5000
node server.js

# Frontend
cd ../frontend
npm install
npm run start

# Employee Attendance System

Tech Stack:
- Frontend: React + Zustand (Vite)
- Backend: Node.js + Express
- Database: MongoDB

## Quick Start (Local)

### Backend
1. cd backend
2. cp .env.example .env and set MONGO_URI / JWT_SECRET
3. npm install
4. npm run seed     # creates sample users
5. npm run dev      # start server on port 5000

### Frontend
1. cd frontend
2. npm install
3. Set REACT_APP_API=http://localhost:5000/api in .env if needed
4. npm run start

## Sample accounts (from seed)
- Manager: alice@company.com / password123
- Employee: bob@company.com / password123

## Deliverables
- GitHub repository with backend and frontend folders
- README.md and .env.example
- Seed data provided in backend/seed.js
- Export CSV endpoint implemented at /api/attendance/export

## Evaluation mapping
- Functionality: APIs for auth, checkin/checkout, history, manager views implemented.
- Code Quality: modular routes & middleware, schema with indexes.
- UI/UX: simple clean dashboards for employee & manager.
- API Design: RESTful endpoints matching the spec.
- Database: MongoDB with two collections (Users, Attendance).
- Documentation: this README + .env.example + seed script.
