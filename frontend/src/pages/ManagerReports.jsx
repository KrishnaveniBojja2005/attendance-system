import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function ManagerReports() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [rows, setRows] = useState([]);

  const fetchReports = async () => {
    if (!from || !to) return alert("Select from and to dates");
    try {
      const url = `/attendance/reports?from=${from}&to=${to}${employeeId ? `&employeeId=${employeeId}` : ""}`;
      const { data } = await api.get(url);
      setRows(data);
    } catch (err) {
      console.error(err);
      alert("Error fetching reports");
    }
  };

  const exportCsv = () => {
    if (!from || !to) return alert("Select date range first");
    const token = localStorage.getItem("token");
    window.open(`http://localhost:5000/api/attendance/export?from=${from}&to=${to}${employeeId ? `&employeeId=${employeeId}` : ""}&token=${token}`, "_blank");
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <button onClick={() => navigate('/manager')} style={{ ...btn, marginRight: 8 }}>⬅ Back to Dashboard</button>
          <h2 style={{ display: "inline-block", marginLeft: 8 }}>Reports</h2>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <div>
          <label>From</label><br />
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label>To</label><br />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <label>Employee ID (optional)</label><br />
          <input placeholder="EMP001" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={fetchReports} style={btn}>Show</button>
          <button onClick={exportCsv} style={{ ...btn, background: "#009688" }}>Export CSV</button>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <table border="1" cellPadding="8" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Name</th><th>Emp ID</th><th>Dept</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
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
    </div>
  );
}

const btn = {
  padding: "10px 14px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer"
};
