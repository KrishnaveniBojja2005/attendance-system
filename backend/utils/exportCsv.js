const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const createCsv = async (records) => {
  const filename = `attendance_${Date.now()}.csv`;
  const filepath = path.join(__dirname, '..', 'tmp', filename);
  if (!fs.existsSync(path.dirname(filepath))) fs.mkdirSync(path.dirname(filepath), { recursive: true });

  const csvWriter = createCsvWriter({
    path: filepath,
    header: [
      {id:'employeeId', title:'Employee ID'},
      {id:'name', title:'Name'},
      {id:'email', title:'Email'},
      {id:'department', title:'Department'},
      {id:'date', title:'Date'},
      {id:'checkIn', title:'Check In'},
      {id:'checkOut', title:'Check Out'},
      {id:'status', title:'Status'},
      {id:'totalHours', title:'Total Hours'}
    ]
  });

  const data = records.map(r => ({
    employeeId: r.userId?.employeeId || '',
    name: r.userId?.name || '',
    email: r.userId?.email || '',
    department: r.userId?.department || '',
    date: r.date,
    checkIn: r.checkInTime ? new Date(r.checkInTime).toISOString() : '',
    checkOut: r.checkOutTime ? new Date(r.checkOutTime).toISOString() : '',
    status: r.status,
    totalHours: r.totalHours || 0
  }));

  await csvWriter.writeRecords(data);
  return filepath;
};

module.exports = { createCsv };
