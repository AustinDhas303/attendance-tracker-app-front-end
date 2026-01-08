import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
console.log('App module loaded');
import Login from "./components/Login/Login";
import Sidebar from "./components/Sidebar/Sidebar";
import "./App.css";
import Dashboard from "./components/Dahboard/Dashboard";
import Attendance from "./components/Attendance/Attendance";
import Student from "./components/Student/Student";
import User from "./components/User/User";
import Reports from "./components/Reports/Reports";
import Register from "./components/User/Register";

function App() {

  const Logout = ({ onLogout }) => {
    useEffect(() => {
      if (onLogout) onLogout();
    }, [onLogout]);
    return <Navigate to="/" replace />;
  };

  // const [role, setRole] = useState(localStorage.getItem("role") || null);
  // const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   setIsAuthenticated(!!token);
  //   setRole(localStorage.getItem("role"));
  // }, []);

  const [authenticated, setAuthenticated] = useState(
    localStorage.getItem("authenticated") === "true"
  );

  const handleLoginSuccess = () => {
    console.log('handleLoginSuccess called');
    localStorage.setItem("authenticated", "true");
    setAuthenticated(true);
  };

  const handleLogout = () => {
    console.log('handleLogout called');
    localStorage.clear();
    setAuthenticated(false);
  };

  const ProtectedRoute = ({ element }) => {
    return authenticated ? element : <Navigate to="/" />;
  };

  console.log('App render - authenticated =', authenticated);
  return (
    <Router>
       <div className="app">
        {!authenticated ? (
          <div className="login-container">
            <div className="left">
              <Routes>
                <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
            <div className="right" />
          </div>
        ) : (
          <div className="main">
            <Sidebar onLogout={handleLogout} role={localStorage.getItem('role')} />

            <div className="content">
              {/* <div style={{position:'fixed', top:8, right:8, background:'#fff', padding:'6px 8px', borderRadius:4, boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}>Auth: {String(authenticated)}</div> */}

              <Routes>
                <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/register" element={<Register />} />
                <Route path="/user" element={<User />} />
                <Route path="/student" element={<ProtectedRoute element={<Student />} />} />
                <Route path="/reports" element={<ProtectedRoute element={<Reports />} />} />
                <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
