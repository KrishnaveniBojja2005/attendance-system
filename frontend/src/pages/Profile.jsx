import React from "react";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h2>My Profile</h2>

      <div
        style={{
          marginTop: 20,
          padding: 20,
          border: "1px solid #ccc",
          borderRadius: 10,
          maxWidth: 400,
          background: "#fafafa",
        }}
      >
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Employee ID:</strong> {user.employeeId}</p>
        <p><strong>Department:</strong> {user.department}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p>
          <strong>Joined:</strong>{" "}
          {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>

      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
