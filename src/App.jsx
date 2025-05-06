import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Form from './Pages/AttendanceForm';
import "react-datepicker/dist/react-datepicker.css"; // Import the DatePicker styles
import "./App.css";

import AttendanceReview from './Pages/AttendanceReview';
import SuperAdmin from './Pages/SuperAdmin';
import AttendanceAssist from './Pages/AttendanceAssist';
import AdminPage from './Pages/AdminPage';
import AdminLogin from './Pages/AdminLogin';

// Route guard for protected routes
const RequireAuth = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const expiry = Number(localStorage.getItem('tokenExpiry'));
  const role = localStorage.getItem('role');
  // clear expired or missing
  if (!token || Date.now() > expiry) {
    localStorage.clear();
    return <Navigate to="/admin-login" replace />;
  }
  // role check
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/report" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<Form />} />
            {/* public routes */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/attendance-assist" element={<AttendanceAssist />} />
            <Route path="/review" element={<AttendanceReview />} />
            {/* protected routes */}
            <Route path="/report" element={
              <RequireAuth>
                <AdminPage />
              </RequireAuth>
            } />
            <Route path="/superadmin" element={
              <RequireAuth>
                <SuperAdmin />
              </RequireAuth>
            } />
        </Routes>
    </BrowserRouter>
  )
}

export default App
