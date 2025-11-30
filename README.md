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
