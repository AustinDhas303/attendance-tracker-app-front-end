import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api, { publicApi } from "../utils/api";
import "./Login.css";
console.log('Login module loaded');

const Login = ({ onLoginSuccess }) => {

  const [login, setLogin] = useState({
    emailId: "",
    password: "",
  });

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const handleChange = (e) => {
    setLogin({ ...login, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await publicApi.post(
        "/api/v1/jwt/login",
        login
      );
      console.log("Login Response:", response.data);

      if (response.data.status === 'Login success') {
        const token = response?.data?.token;
        console.log("Token received:", token);

        if (!token) {
          console.error("No token received!");
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("userId", response?.data?.userId);
        localStorage.setItem("role", response?.data?.role);

        console.log("Token saved in localStorage:", localStorage.getItem("token"));
        // notify parent that login happened (regardless of role)
        if (onLoginSuccess) onLoginSuccess();
        // navigation will be handled by App after auth state updates
        // else {
        //     navigate('/userQuiz');
        // }
      }
    } catch (error) {
      setErrorMessage("Invalid credentials. Please try again.");
      console.error("Login error:", error);
    }

    setLogin({
      emailId: '',
      password: ''
    });
  };


  return (
    <div className="page">
      <div>
        <h1 className="contents">Attendance App</h1>
      </div>

      <div className="login-container">

        <h2 className="heading log">Login</h2>

        <form onSubmit={handleSubmit} className="form">
          <div className="inputGroup">
            <label htmlFor="emailId" className="label">Email:</label>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                type="text"
                id="emailId"
                name="emailId"
                value={login.emailId}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
              <span className="icon" aria-hidden="true">👤</span>
            </div>
          </div>

          <div className="inputGroup">
            <label htmlFor="password" className="label">Password:</label>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                type="password"
                id="password"
                name="password"
                value={login.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <span className="ioIosLock" aria-hidden="true">🔒</span>
            </div>
          </div>

          <button type="submit" className="button" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </button>

          {errorMessage && <p className="error">{errorMessage}</p>}
        </form>

        <p className="reg">Don't have an account? <Link to="/register" className="reg">Register Now</Link></p>
      </div>
    </div>
  );
}



export default Login;