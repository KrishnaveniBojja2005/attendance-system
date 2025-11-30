const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const moment = require('moment');
const User = require('../models/User');


// GET /api/dashboard/employee
router.get('/employee', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const today = moment().format('YYYY-MM-DD');
    const monthPrefix = moment().format('YYYY-MM');

    // 1. Today’s status
    const todayData = await Attendance.findOne({ userId, date: today });

    let todayStatus = 'Not Checked In';
    if (todayData) {
      todayStatus = todayData.checkInTime
        ? todayData.checkOutTime
          ? 'Checked Out'
          : 'Checked In'
        : 'Not Checked In';
    }

    // 2. Monthly summary
    const monthRecords = await Attendance.find({
      userId,
      date: { $regex: `^${monthPrefix}` }
    });

    const summary = {
      present: 0,
      late: 0,
      absent: 0,
      halfDay: 0,
      totalHours: 0
    };

    monthRecords.forEach(rec => {
      if (rec.status === 'present') summary.present++;
      else if (rec.status === 'late') summary.late++;
      else if (rec.status === 'absent') summary.absent++;
      else if (rec.status === 'half-day') summary.halfDay++;

      summary.totalHours += rec.totalHours || 0;
    });

    // 3. Recent last 7 days
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      const record = await Attendance.findOne({ userId, date });
      last7Days.push({
        date,
        status: record?.status || 'absent',
        hours: record?.totalHours || 0
      });
    }

    res.json({
      todayStatus,
      summary,
      recent7Days: last7Days.reverse()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// GET /api/dashboard/manager
router.get('/manager', auth, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    const today = moment().format("YYYY-MM-DD");

    // 1. Get all employees
    const employees = await User.find({ role: "employee" });
    const totalEmployees = employees.length;

    // 2. Get today's attendance records (may be empty for some employees)
    const todayRecords = await Attendance.find({ date: today }).lean();

    // build map: userIdStr -> record
    const todayMap = {};
    todayRecords.forEach(r => {
      todayMap[String(r.userId)] = r;
    });

    // 3. Iterate employees to compute present/late/halfDay/absent and build absentEmployees list
    let presentToday = 0;
    let lateToday = 0;
    let halfDayToday = 0;
    const absentEmployees = [];

    // departmentCounts: { deptName: { total: X, present: Y } }
    const departmentCounts = {};

    employees.forEach(emp => {
      const empIdStr = String(emp._id);
      const rec = todayMap[empIdStr];

      // ensure department structure exists
      if (!departmentCounts[emp.department]) {
        departmentCounts[emp.department] = { total: 0, present: 0 };
      }
      departmentCounts[emp.department].total++;

      if (!rec) {
        // no attendance record => treat as no-data/absent
        absentEmployees.push({
          name: emp.name,
          employeeId: emp.employeeId,
          department: emp.department,
          status: 'no-data'
        });
      } else {
        // has record -> check status
        const st = rec.status;
        if (st === 'present') {
          presentToday++;
          departmentCounts[emp.department].present++;
        } else if (st === 'late') {
          lateToday++;
          departmentCounts[emp.department].present++; // we count late as "present" for department present count
        } else if (st === 'half-day') {
          halfDayToday++;
          departmentCounts[emp.department].present++;
        } else if (st === 'absent') {
          absentEmployees.push({
            name: emp.name,
            employeeId: emp.employeeId,
            department: emp.department,
            status: 'absent'
          });
        } else {
          // any other statuses, treat as absent-like unless explicitly present/late/half-day
          absentEmployees.push({
            name: emp.name,
            employeeId: emp.employeeId,
            department: emp.department,
            status: st || 'no-data'
          });
        }
      }
    });

    // Absent count = number of employees in absentEmployees
    const absentToday = absentEmployees.length;

    // 4. Weekly trend — count of present (present|late|half-day) per day (last 7 days)
    const weeklyTrend = [];
    for (let i = 0; i < 7; i++) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      const dayRecords = await Attendance.find({ date }).lean();
      const presentCount = dayRecords.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'half-day').length;
      weeklyTrend.push({ date, present: presentCount });
    }

    // prepare departmentCounts response as simple { dept: count } for charting and also include present counts if needed
    const deptSummary = {};
    Object.keys(departmentCounts).forEach(d => {
      deptSummary[d] = departmentCounts[d].total;
    });
    // optionally include present per department separately if frontend needs it
    const deptPresent = {};
    Object.keys(departmentCounts).forEach(d => {
      deptPresent[d] = departmentCounts[d].present;
    });

    res.json({
      totalEmployees,
      presentToday,
      lateToday,
      halfDayToday,
      absentToday,
      absentEmployees,        // list for frontend to show absent/no-data employees
      departmentCounts: deptSummary,
      departmentPresent: deptPresent,
      weeklyTrend: weeklyTrend.reverse()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



module.exports = router;


