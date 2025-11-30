const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { createCsv } = require('../utils/exportCsv');
const moment = require('moment');

// Helper: YYYY-MM-DD today
const todayStr = () => moment().format('YYYY-MM-DD');

// POST /api/attendance/checkin
router.post('/checkin', auth, async (req, res) => {
  try {
    const user = req.user;
    const date = todayStr();
    let att = await Attendance.findOne({ userId: user._id, date });
    const now = new Date();

    if (att && att.checkInTime) return res.status(400).json({ message: 'Already checked in' });

    if (!att) {
      att = new Attendance({ userId: user._id, date, checkInTime: now });
    } else {
      att.checkInTime = now;
    }

    // Determine late: example threshold 09:30 local
    const threshold = new Date();
    threshold.setHours(9,30,0,0);
    if (now > threshold) att.status = 'late';
    else att.status = 'present';

    await att.save();
    res.json(att);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/attendance/checkout
router.post('/checkout', auth, async (req, res) => {
  try {
    const user = req.user;
    const date = todayStr();
    let att = await Attendance.findOne({ userId: user._id, date });
    if (!att || !att.checkInTime) return res.status(400).json({ message: 'Not checked in' });
    if (att.checkOutTime) return res.status(400).json({ message: 'Already checked out' });

    const now = new Date();
    att.checkOutTime = now;
    const diffMs = new Date(att.checkOutTime) - new Date(att.checkInTime);
    att.totalHours = Math.round((diffMs / (1000*60*60)) * 100) / 100;
    await att.save();
    res.json(att);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/my-history
router.get('/my-history', auth, async (req, res) => {
  try {
    const { month } = req.query; // optional YYYY-MM
    const match = { userId: req.user._id };
    if (month) match.date = { $regex: `^${month}` };
    const list = await Attendance.find(match).sort({ date: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/attendance/my-summary
router.get('/my-summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const month = req.query.month || moment().format('YYYY-MM');

    const match = {
      userId,
      date: { $regex: `^${month}` }
    };

    const list = await Attendance.find(match).sort({ createdAt: -1 });

    const summary = { present:0, absent:0, late:0, halfDay:0, totalHours:0 };

    list.forEach(a => {
      if (a.status === 'present') summary.present++;
      if (a.status === 'late') summary.late++;
      if (a.status === 'absent') summary.absent++;
      if (a.status === 'half-day') summary.halfDay++;
      summary.totalHours += a.totalHours || 0;
    });

    res.json(summary);

  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});


// Manager endpoints
// GET /api/attendance/all
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') return res.status(403).json({ message: 'Access denied' });
    const { employeeId, date, status, page=1, limit=100 } = req.query;
    const filter = {};
    if (employeeId) {
      const usr = await User.findOne({ employeeId });
      if (usr) filter.userId = usr._id;
      else return res.json([]);
    }
    if (date) filter.date = date;
    if (status) filter.status = status;

    const list = await Attendance.find(filter).populate('userId','name email employeeId department').sort({ date: -1 }).limit(parseInt(limit)).skip((page-1)*limit);
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/attendance/export  -> returns CSV
router.get('/export', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') return res.status(403).json({ message: 'Access denied' });
    const { from, to, employeeId } = req.query;
    const filter = {};
    if (employeeId) {
      const usr = await User.findOne({ employeeId });
      if (usr) filter.userId = usr._id;
    }
    if (from && to) filter.date = { $gte: from, $lte: to };
    const list = await Attendance.find(filter).populate('userId','name email employeeId department');

    const csvPath = await createCsv(list);
    res.download(csvPath);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/attendance/today-status
router.get('/today-status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') return res.status(403).json({ message: 'Access denied' });
    const date = todayStr();
    const list = await Attendance.find({ date }).populate('userId','name employeeId department');
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET today's attendance
router.get('/today', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const todayDate = moment().format("YYYY-MM-DD");

    let record = await Attendance.findOne({ userId, date: todayDate });

    if (!record) {
      return res.json({
        date: todayDate,
        status: "Not Checked In",
        checkInTime: null,
        checkOutTime: null
      });
    }

    res.json(record);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// GET /api/attendance/team-calendar?month=YYYY-MM&department=&employeeId=
router.get('/team-calendar', auth, async (req, res) => {
  try {
    // only managers allowed
    if (req.user.role !== 'manager') return res.status(403).json({ message: 'Access denied' });

    const monthParam = req.query.month || moment().format('YYYY-MM'); // YYYY-MM
    const department = req.query.department || null;
    const employeeId = req.query.employeeId || null;

    // get employees (optionally filter by department or single employee)
    const empFilter = { role: 'employee' };
    if (department) empFilter.department = department;
    if (employeeId) {
      const emp = await User.findOne({ employeeId });
      if (!emp) return res.json({ month: monthParam, days: [] });
      empFilter._id = emp._id;
    }

    const employees = await User.find(empFilter).select('_id name employeeId department');

    const totalEmployees = employees.length;

    // build list of days in requested month
    const year = parseInt(monthParam.split('-')[0], 10);
    const monthIdx = parseInt(monthParam.split('-')[1], 10) - 1; // 0-indexed
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

    const days = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${monthParam}-${String(d).padStart(2, '0')}`; // YYYY-MM-DD

      // find attendance records for that date among the selected employees
      const records = await Attendance.find({ date: dateStr, userId: { $in: employees.map(e => e._id) } })
        .populate('userId', 'name employeeId department')
        .lean();

      // build per-employee records map for quick lookup
      const recMap = {};
      records.forEach(r => {
        recMap[String(r.userId._id)] = {
          name: r.userId.name,
          employeeId: r.userId.employeeId,
          department: r.userId.department,
          status: r.status,
          checkInTime: r.checkInTime,
          checkOutTime: r.checkOutTime,
          totalHours: r.totalHours || 0
        };
      });

      // prepare result list for day (include employees with no record => absent/no-data)
      const list = employees.map(emp => {
        const found = recMap[String(emp._id)];
        if (found) return { ...found };
        // if no record, mark absent (but you could call it 'no-data' if preferred)
        return {
          name: emp.name,
          employeeId: emp.employeeId,
          department: emp.department,
          status: 'no-data',
          checkInTime: null,
          checkOutTime: null,
          totalHours: 0
        };
      });

      // counts
      const present = list.filter(x => x.status === 'present').length;
const late = list.filter(x => x.status === 'late').length;
const halfDay = list.filter(x => x.status === 'half-day').length;
const absent = list.filter(x => x.status === 'absent').length;


      days.push({
        date: dateStr,
        present,
        late,
        halfDay,
        absent,
        totalEmployees,
        records: list
      });
    }

    res.json({ month: monthParam, days });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/attendance/reports?from=YYYY-MM-DD&to=YYYY-MM-DD&employeeId=EMP001
router.get('/reports', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') return res.status(403).json({ message: 'Access denied' });

    const { from, to, employeeId } = req.query;
    if (!from || !to) return res.status(400).json({ message: 'from and to are required (YYYY-MM-DD)' });

    const filter = {};
    if (employeeId) {
      const usr = await User.findOne({ employeeId });
      if (!usr) return res.json([]);
      filter.userId = usr._id;
    }

    filter.date = { $gte: from, $lte: to };

    const list = await Attendance.find(filter)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


router.get('/manager/employees', auth, async (req, res) => {
  if (req.user.role !== 'manager') 
    return res.status(403).json({ message: 'Access denied' });

  const empList = await User.find({ role: "employee" })
    .select("name employeeId department");

  res.json(empList);
});

module.exports = router;
