import React, { useEffect, useState } from 'react';
import api from '../api';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function EmployeeDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [todayStatus, setTodayStatus] = useState('');
  const [summary, setSummary] = useState({});
  const [recent, setRecent] = useState([]);

  // Fetch all stats from the new dashboard API
  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/dashboard/employee');
      setTodayStatus(data.todayStatus);
      setSummary(data.summary);
      setRecent(data.recent7Days);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Error loading dashboard");
    }
  };

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/checkin');
      alert("Checked In");
      fetchDashboard();
    } catch (e) {
      alert(e.response?.data?.message || "Error");
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post('/attendance/checkout');
      alert("Checked Out");
      fetchDashboard();
    } catch (e) {
      alert(e.response?.data?.message || "Error");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading Dashboard...</div>;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Welcome, {user?.name}</h2>
        <button onClick={() => { logout(); navigate('/login'); }}>
          Logout
        </button>
      </div>

      {/* TODAY STATUS */}
      <section style={{ marginTop: 25 }}>
        <h3>Today's Status</h3>
        <div style={{
          padding: 12,
          background: "#e3f2fd",
          borderRadius: 8,
          display: "inline-block",
          fontSize: 18,
          fontWeight: "bold",
          color: "#0d47a1",
        }}>
          {todayStatus}
        </div>
      </section>

      {/* MONTH SUMMARY */}
      <section style={{ marginTop: 30 }}>
        <h3>This Month Summary</h3>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <SummaryCard label="Present" value={summary.present} color="#4caf50" />
          <SummaryCard label="Absent" value={summary.absent} color="#f44336" />
          <SummaryCard label="Late" value={summary.late} color="#ffc107" />
          <SummaryCard label="Half Day" value={summary.halfDay} color="#ff9800" />
          <SummaryCard label="Total Hours" value={summary.totalHours} color="#2196f3" />
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section style={{ marginTop: 30 }}>
        <h3>Quick Actions</h3>
        <button style={btnStyle} onClick={handleCheckIn}>Check In</button>
        <button style={btnStyle} onClick={handleCheckOut}>Check Out</button>
        <button 
  style={{ ...btnStyle, background: "#00897b" }}
  onClick={() => navigate('/employee/profile')}
>
  View Profile
</button>

<button 
  style={{ ...btnStyle, background: "#455a64" }}
  onClick={() => navigate('/employee/attendance')}
>
  Mark Attendance
</button>

        {/* Calendar Navigation Button */}
        <button 
          style={{ ...btnStyle, background: "#6a1b9a" }}
          onClick={() => navigate('/employee/calendar')}
        >
          View Calendar
        </button>
      </section>

      {/* RECENT 7 DAYS */}
      <section style={{ marginTop: 40 }}>
        <h3>Last 7 Days</h3>
        <table border="1" cellPadding="8" style={{ marginTop: 10, width: "100%", borderRadius: 8 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td style={{ color: getStatusColor(r.status), fontWeight: 'bold' }}>
                  {r.status}
                </td>
                <td>{r.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{
      background: color,
      color: "white",
      padding: 15,
      borderRadius: 10,
      minWidth: 120,
      textAlign: "center",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
    }}>
      <div style={{ fontSize: 22, fontWeight: "bold" }}>{value}</div>
      <div>{label}</div>
    </div>
  );
}

const btnStyle = {
  marginRight: 15,
  padding: "10px 20px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 16
};

function getStatusColor(status) {
  if (status === "present") return "green";
  if (status === "absent") return "red";
  if (status === "late") return "orange";
  if (status === "half-day") return "purple";
  return "black";
}
