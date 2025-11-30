import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function AttendanceCalendar() {
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState(new Date()); 
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/attendance/my-history");
      setRecords(data);
    } catch (err) {
      console.error(err);
      alert("Error loading calendar");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const getStatus = (dateStr) => {
  const record = records.find(r => r.date === dateStr);
  if (!record) return "no-data";  // ← NEW: true empty days show gray
  return record.status;
};

  const getColor = (status) => {
  if (status === "present") return "green";
  if (status === "absent") return "red";
  if (status === "late") return "orange";
  if (status === "half-day") return "purple";
  if (status === "no-data") return "gray";   // ← NEW: for months with no attendance
  return "gray";
};


  const currentYear = month.getFullYear();
  const currentMonth = month.getMonth();

  const totalDays = daysInMonth(currentYear, currentMonth);

  const dates = Array.from({ length: totalDays }, (_, i) => {
    const d = i + 1;
    const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return { day: d, dateStr: formatted };
  });

  const nextMonth = () => {
    const newM = new Date(month);
    newM.setMonth(month.getMonth() + 1);
    setMonth(newM);
  };

  const prevMonth = () => {
    const newM = new Date(month);
    newM.setMonth(month.getMonth() - 1);
    setMonth(newM);
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <button onClick={() => navigate(-1)}>⬅ Back</button>
      <h2>Attendance Calendar</h2>

      {/* Month Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <button onClick={prevMonth}>⬅ Prev</button>
        <h3>
          {month.toLocaleString("default", { month: "long" })} {currentYear}
        </h3>
        <button onClick={nextMonth}>Next ➡</button>
      </div>

      {/* Calendar Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 10,
          marginTop: 20,
        }}
      >
        {dates.map(({ day, dateStr }) => {
          const status = getStatus(dateStr);
          return (
            <div
              key={day}
              onClick={() => alert(`Date: ${dateStr}\nStatus: ${status}`)}
              style={{
                padding: 20,
                background: getColor(status),
                color: "white",
                borderRadius: 6,
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 30 }}>
        <h3>Legend</h3>
        <p><span style={{ color: "green" }}>■</span> Present</p>
        <p><span style={{ color: "red" }}>■</span> Absent</p>
        <p><span style={{ color: "orange" }}>■</span> Late</p>
        <p><span style={{ color: "purple" }}>■</span> Half-day</p>
      </div>
    </div>
  );
}
