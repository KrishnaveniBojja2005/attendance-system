require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const dashboardRoutes = require('./routes/dashboard');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);


// health
app.get('/api/health', (req,res)=>res.json({ ok:true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log('Server running on', PORT));
