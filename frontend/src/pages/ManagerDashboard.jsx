import React, { useEffect, useState } from "react";
import api from "../api";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function ManagerDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [todayAbsentList, setTodayAbsentList] = useState([]);

  const loadDashboard = async () => {
  try {
    const { data } = await api.get("/dashboard/manager");
    setStats(data);

  
    setTodayAbsentList(data.absentEmployees || []);

    setLoading(false);
  } catch (err) {
    console.error(err);
    alert("Error loading manager dashboard");
  }
};


  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading Manager Dashboard...</div>;

  const {
    totalEmployees,
    presentToday,
    absentToday,
    lateToday,
    halfDayToday,
    departmentCounts,
    weeklyTrend
  } = stats || {};

  // prepare data for line chart (weeklyTrend)
  const lineData = (weeklyTrend || []).map(v => ({ date: v.date, present: v.present }));

  const pieData = Object.keys(departmentCounts || {}).map(key => ({ name: key, value: departmentCounts[key] }));
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8a65", "#4dd0e1", "#a1887f"];

  return (
    <div style={{ padding: 20, fontFamily: "Inter, Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Manager Dashboard</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate('/manager/calendar')} style={btn}>Team Calendar</button>
          <button onClick={() => navigate('/manager/attendance')} style={btn}>All Attendance</button>
          <button onClick={() => navigate('/manager/reports')} style={{ ...btn, background: "#009688" }}>Reports</button>
          <button onClick={() => { logout(); navigate("/login"); }} style={{ ...btn, background: "#d32f2f" }}>Logout</button>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 18 }}>
        <Card label="Total Employees" value={totalEmployees} color="#673ab7" />
        <Card label="Present Today" value={presentToday} color="#4caf50" />
        <Card label="Absent Today" value={absentToday} color="#f44336" />
        <Card label="Late Today" value={lateToday} color="#ff9800" />
        <Card label="Half-day Today" value={halfDayToday} color="#3f51b5" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, marginTop: 28 }}>
        <div style={{ padding: 16, background: "white", borderRadius: 8, minHeight: 260, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
          <h4>Weekly Attendance Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="present" stroke="#4caf50" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ padding: 16, background: "white", borderRadius: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}>
          <h4>Department-wise</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {pieData.map((entry, idx) => <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Absent list */}
      <div style={{ marginTop: 22 }}>
        <h4>Absent / No-data Employees Today</h4>
        {todayAbsentList.length === 0 ? <p>No absent employees right now.</p> : (
          <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr><th>Name</th><th>Emp ID</th><th>Department</th></tr>
            </thead>
            <tbody>
              {todayAbsentList.map((a, i) => (
                <tr key={i}>
                  <td>{a.name}</td>
                  <td>{a.employeeId}</td>
                  <td>{a.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Card({ label, value, color }) {
  return (
    <div style={{
      background: color,
      color: "white",
      padding: 16,
      borderRadius: 10,
      minHeight: 88,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
    }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      <div style={{ opacity: 0.95 }}>{label}</div>
    </div>
  );
}

const btn = {
  padding: "8px 12px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  marginLeft: 6
};
