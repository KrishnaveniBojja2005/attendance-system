import React, { useState } from 'react';
import api from '../api';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setAuth = useAuthStore(state => state.setAuth);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.token, data.user);

      if (data.user.role === 'manager') navigate('/manager');
      else navigate('/employee');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back 👋</h2>
        <p style={styles.subtitle}>Please login to continue</p>

        <form onSubmit={submit} style={{ width: "100%" }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={styles.input}
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        <p style={styles.footerText}>
          New employee?{" "}
          <span
            style={styles.link}
            onClick={() => navigate("/register")}
          >
            Register here
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
    width: "360px",
    padding: "28px",
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
    marginTop: "6px",
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
