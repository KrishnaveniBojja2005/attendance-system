import React, { useEffect, useState } from "react";
import api from "../api";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import moment from "moment";

export default function ManagerTeamCalendar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [month, setMonth] = useState(moment()); // moment object
  const [daysData, setDaysData] = useState([]); // from API
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null); // object for popup
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");

  const fetchData = async (m = month) => {
    try {
      setLoading(true);
      const monthStr = m.format("YYYY-MM");
      let url = `/attendance/team-calendar?month=${monthStr}`;
      if (departmentFilter) url += `&department=${encodeURIComponent(departmentFilter)}`;
      if (employeeFilter) url += `&employeeId=${encodeURIComponent(employeeFilter)}`;
      const { data } = await api.get(url);
      setDaysData(data.days || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Error loading team calendar");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const prevMonth = () => {
    const m = moment(month).subtract(1, "month");
    setMonth(m);
    fetchData(m);
  };

  const nextMonth = () => {
    const m = moment(month).add(1, "month");
    setMonth(m);
    fetchData(m);
  };

  const dayColor = (d) => {
    // d: { present, totalEmployees }
    if (!d) return "#eee";
    // If all employees are "no-data" → gray future/past months
if (d.records.every(r => r.status === "no-data")) {
  return "#9e9e9e"; // gray
}

// all present
if (d.present === d.totalEmployees && d.present > 0) return "#4caf50";

// none present but some absent
if (d.present === 0 && d.records.some(r => r.status !== "no-data")) return "#f44336";

// mixed
return "#ff9800";

  };

  // build grid: week rows (Mon-Sun). We'll compute the first day-of-week offset and fill
  const buildGrid = () => {
    const year = month.year();
    const mIndex = month.month(); // 0-based
    const firstOfMonth = moment([year, mIndex, 1]);
    const daysInMonth = firstOfMonth.daysInMonth();
    const startWeekday = firstOfMonth.isoWeekday(); // 1 (Mon) .. 7 (Sun)
    const grid = [];
    let current = 1;
    // weeks usually 5-6 rows; we build 6 rows for safety
    for (let week = 0; week < 6; week++) {
      const row = [];
      for (let dow = 1; dow <= 7; dow++) {
        const cellIndex = week * 7 + dow;
        // when to start showing days: when week==0 and dow < startWeekday -> blank
        if (week === 0 && dow < startWeekday) {
          row.push(null);
        } else if (current > daysInMonth) {
          row.push(null);
        } else {
          const dateStr = `${year}-${String(mIndex + 1).padStart(2, "0")}-${String(current).padStart(2, "0")}`;
          // find data
          const d = daysData.find(x => x.date === dateStr) || { 
  date: dateStr,
  present: 0,
  late: 0,
  halfDay: 0,
  totalEmployees: 0,
  records: []
};

// FIX: correctly compute absent (absent + no-data)
d.absent = d.records.filter(r =>
  r.status === "absent" || r.status === "no-data"
).length;

          row.push(d);
          current++;
        }
      }
      grid.push(row);
    }
    return grid;
  };

  const grid = buildGrid();

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Team Calendar</h2>
        <div>
          <button onClick={() => navigate('/manager')} style={btn}>⬅ Back to Dashboard</button>
          <button onClick={() => { logout(); navigate("/login"); }} style={{ ...btn, background: "#d32f2f", marginLeft: 8 }}>Logout</button>
        </div>
      </div>


      <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={prevMonth} style={btn}>⬅ Prev</button>
        <div style={{ fontWeight: "bold" }}>{month.format("MMMM YYYY")}</div>
        <button onClick={nextMonth} style={btn}>Next ➡</button>

        <input placeholder="Department (optional)" value={departmentFilter} onChange={(e)=>setDepartmentFilter(e.target.value)} />
        <input placeholder="Employee ID (optional)" value={employeeFilter} onChange={(e)=>setEmployeeFilter(e.target.value)} />
        <button onClick={() => fetchData()} style={btn}>Apply Filters</button>

        <button onClick={() => navigate("/manager/attendance")} style={{ ...btn, background: "#009688" }}>Open Attendance Table</button>
      </div>

      {loading ? <div style={{ marginTop: 20 }}>Loading...</div> : (
        <div style={{ marginTop: 20 }}>
          {/* Week header */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(h => (
              <div key={h} style={{ textAlign: "center", fontWeight: "bold" }}>{h}</div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginTop: 8 }}>
            {grid.flat().map((cell, idx) => {
              if (!cell) {
                return <div key={idx} style={{ minHeight: 90, background: "#f5f5f5", borderRadius: 6 }} />;
              }
              const color = dayColor(cell);
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(cell)}
                  style={{
                    minHeight: 90,
                    borderRadius: 6,
                    background: color,
                    color: "white",
                    padding: 8,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>{parseInt(cell.date.split('-')[2],10)}</div>
                  <div style={{ fontSize: 13 }}>
                    <div>Present: {cell.present}</div>
                    <div>Late: {cell.late}</div>
                    <div>Absent: {cell.absent}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 18 }}>
            <span style={{ display: "inline-block", width: 14, height: 14, background: "#4caf50", marginRight: 6 }}></span> All present
            <span style={{ display: "inline-block", width: 14, height: 14, background: "#ff9800", marginLeft: 12, marginRight: 6 }}></span> Partial
            <span style={{ display: "inline-block", width: 14, height: 14, background: "#f44336", marginLeft: 12, marginRight: 6 }}></span> None present
          </div>
        </div>
      )}

      {/* Popup / modal (simple) */}
      {selectedDay && (
        <div style={{
          position: "fixed",
          left: 0, right: 0, top: 0, bottom: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        onClick={() => setSelectedDay(null)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: 700, maxHeight: "80vh", overflowY: "auto", background: "white", padding: 20, borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Details for {selectedDay.date}</h3>
              <button onClick={() => setSelectedDay(null)} style={btn}>Close</button>
            </div>

            <div style={{ marginTop: 10 }}>
              <table border="1" cellPadding="6" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Emp ID</th>
                    <th>Dept</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDay.records.map((r, i) => (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td>{r.employeeId}</td>
                      <td>{r.department}</td>
                      <td>{r.status}</td>
                      <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : "-"}</td>
                      <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : "-"}</td>
                      <td>{r.totalHours || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btn = {
  padding: "8px 12px",
  marginRight: 8,
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};
