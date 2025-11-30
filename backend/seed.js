require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const run = async () => {
  await connectDB();

  // wipe
  await User.deleteMany({});
  await Attendance.deleteMany({});

  const pass = await bcrypt.hash('password123', 10);
  const manager = new User({ name: 'Alice Manager', email: 'alice@company.com', password: pass, role: 'manager', employeeId: 'EMP000', department: 'Management' });
  const emp1 = new User({ name: 'Bob Employee', email: 'bob@company.com', password: pass, role: 'employee', employeeId: 'EMP001', department: 'Engineering' });
  const emp2 = new User({ name: 'Cathy Employee', email: 'cathy@company.com', password: pass, role: 'employee', employeeId: 'EMP002', department: 'HR' });

  await manager.save(); await emp1.save(); await emp2.save();

  // sample attendance for current month
  const moment = require('moment');
  const base = moment();
  for (let i=1;i<=7;i++){
    const date = base.clone().subtract(i,'days').format('YYYY-MM-DD');
    await Attendance.create({ userId: emp1._id, date, checkInTime: new Date(), checkOutTime: new Date(), status: 'present', totalHours: 8 });
  }

  console.log('Seed done');
  mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });
