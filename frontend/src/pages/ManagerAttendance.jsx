import React, { useEffect, useState } from "react";
import api from "../api";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function ManagerAttendance() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({
    employeeId: "",
    date: "",
    status: ""
  });

  const loadData = async () => {
    try {
      let url = "/attendance/all?";
      if (filters.employeeId) url += `employeeId=${filters.employeeId}&`;
      if (filters.date) url += `date=${filters.date}&`;
      if (filters.status) url += `status=${filters.status}&`;
      const { data } = await api.get(url);
      setRecords(data);
    } catch (err) {
      console.error(err);
      alert("Error loading attendance data");
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  const handleFilter = () => loadData();

  const exportCsv = () => {
    const from = prompt("From date (YYYY-MM-DD):");
    const to = prompt("To date (YYYY-MM-DD):");
    if (!from || !to) return alert("Both dates required");
    const token = localStorage.getItem("token");
    window.open(`http://localhost:5000/api/attendance/export?from=${from}&to=${to}&token=${token}`, "_blank");
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <button onClick={() => navigate('/manager')} style={{ ...btn, marginRight: 8 }}>⬅ Back to Dashboard</button>
          <h2 style={{ display: "inline-block", marginLeft: 8 }}>All Employees Attendance</h2>
        </div>
        <div>
          <button onClick={() => { logout(); navigate("/login"); }} style={{ ...btn, background: "#d32f2f" }}>Logout</button>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ marginTop: 20, display: "flex", gap: 15, flexWrap: "wrap" }}>
        <input placeholder="Employee ID (EMP001)" value={filters.employeeId} onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })} />
        <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
          <option value="half-day">Half Day</option>
        </select>

        <button onClick={handleFilter} style={btn}>Apply Filters</button>
        <button onClick={exportCsv} style={{ ...btn, background: "#009688" }}>Export CSV</button>
      </div>

      {/* TABLE */}
      <table border="1" cellPadding="8" style={{ marginTop: 30, width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Emp ID</th>
            <th>Dept</th>
            <th>Date</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Status</th>
            <th>Total Hrs</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              <td>{r.userId?.name}</td>
              <td>{r.userId?.employeeId}</td>
              <td>{r.userId?.department}</td>
              <td>{r.date}</td>
              <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : "-"}</td>
              <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : "-"}</td>
              <td>{r.status}</td>
              <td>{r.totalHours || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

const btn = {
  padding: "10px 15px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
