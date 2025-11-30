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
