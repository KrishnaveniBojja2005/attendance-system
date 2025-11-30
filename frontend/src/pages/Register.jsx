import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    department: ''
  });

  const navigate = useNavigate();

  const handle = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, role: 'employee' };

      await api.post('/auth/register', payload);

      alert('Registered successfully. Please login.');
      navigate('/login');

    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <h2 style={styles.title}>Employee Registration 📝</h2>
        <p style={styles.subtitle}>Create your employee account</p>

        <form onSubmit={submit} style={{ width: "100%" }}>
          
          <input
            name="name"
            placeholder="Full Name"
            onChange={handle}
            required
            style={styles.input}
          />

          <input
            name="email"
            placeholder="Email Address"
            type="email"
            onChange={handle}
            required
            style={styles.input}
          />

          <input
            name="password"
            placeholder="Password"
            type="password"
            onChange={handle}
            required
            style={styles.input}
          />

          <input
            name="employeeId"
            placeholder="Employee ID (e.g., EMP001)"
            onChange={handle}
            required
            style={styles.input}
          />

          <input
            name="department"
            placeholder="Department (IT / HR / Sales...)"
            onChange={handle}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <span
            onClick={() => navigate('/login')}
            style={styles.link}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f4ff",
    fontFamily: "Inter, sans-serif",
  },
  card: {
    width: "380px",
    padding: "30px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: "26px",
    fontWeight: "700",
    color: "#1e3a8a",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    color: "#4b5563",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    outline: "none",
    transition: "0.2s",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "0.2s",
  },
  footerText: {
    marginTop: "16px",
    fontSize: "14px",
    color: "#475569",
  },
  link: {
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "600",
    textDecoration: "underline",
  },
};
