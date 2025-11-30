import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function MarkAttendance() {
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchToday = async () => {
    try {
      const { data } = await api.get("/attendance/today");
      setToday(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Error loading today's attendance");
    }
  };

  const checkIn = async () => {
    try {
      await api.post("/attendance/checkin");
      alert("Checked In");
      fetchToday();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const checkOut = async () => {
    try {
      await api.post("/attendance/checkout");
      alert("Checked Out");
      fetchToday();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h2>Mark Attendance</h2>

      {/* TODAY STATUS */}
      <div
        style={{
          marginTop: 20,
          padding: 15,
          background: "#e3f2fd",
          borderRadius: 8,
          maxWidth: 300,
        }}
      >
        <h3>Status: {today.status || "Not Checked In"}</h3>
        <p>
          Date: <strong>{today.date}</strong>
        </p>
        <p>
          Check In:{" "}
          <strong>
            {today.checkInTime
              ? new Date(today.checkInTime).toLocaleTimeString()
              : "-"}
          </strong>
        </p>
        <p>
          Check Out:{" "}
          <strong>
            {today.checkOutTime
              ? new Date(today.checkOutTime).toLocaleTimeString()
              : "-"}
          </strong>
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{ marginTop: 30 }}>
        <button
          style={btnStyle}
          onClick={checkIn}
        >
          Check In
        </button>

        <button
          style={{ ...btnStyle, background: "red" }}
          onClick={checkOut}
        >
          Check Out
        </button>
      </div>
    </div>
  );
}

const btnStyle = {
  marginRight: 10,
  padding: "10px 20px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 16,
};
