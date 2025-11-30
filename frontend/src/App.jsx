import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import useAuthStore from './store/authStore';
import AttendanceCalendar from './pages/AttendanceCalendar';
import Profile from "./pages/Profile";
import MarkAttendance from "./pages/MarkAttendance";
import ManagerAttendance from "./pages/ManagerAttendance";
import ManagerTeamCalendar from "./pages/ManagerTeamCalendar";
import ManagerReports from "./pages/ManagerReports";



function PrivateRoute({ children, role }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/login" />;
  return children;
}

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/employee" element={<PrivateRoute role="employee"><EmployeeDashboard/></PrivateRoute>} />
        <Route path="/manager" element={<PrivateRoute role="manager"><ManagerDashboard/></PrivateRoute>} />
        <Route path="/employee/calendar" element={<AttendanceCalendar />} />
        <Route path="/employee/profile" element={<Profile />} />
        <Route path="/employee/attendance" element={<MarkAttendance />} />
        <Route path="/manager/attendance" element={<ManagerAttendance />} />
        <Route path="/manager/calendar" element={<ManagerTeamCalendar />} />
        <Route path="/manager/reports" element={<ManagerReports />} />
      </Routes>
    </BrowserRouter>
  );
}
