import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../utils/api";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    contactNo: "",
    emailId: "",
    status: 1,
    password: "",
    role: {
        roleId: 2
    }
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // if (formData.password !== formData.confirmPassword) {
    //   setErrorMessage("Passwords do not match");
    //   return;
    // }

    setIsLoading(true);

    try {
      const response = await api.post("/api/v1/user/register", formData);
      console.log("Registration successful:", response.data);
      setSuccessMessage("Registration successful! Redirecting to login...");
      setFormData({
        firstName: "",
        lastName: "",
        address: "",
        contactNo: "",
        emailId: "",
        status: 1,
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Registration failed:", err);
      setErrorMessage(
        err?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="contents">Attendance App</h1>

      <div className="register-container">
        <h2 className="heading">Create Account</h2>

        <form onSubmit={handleRegister} className="form">
          <div className="row">
            <div className="col inputGroup">
              <label htmlFor="firstName" className="label">First Name</label>
              <input
                className="input"
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="col inputGroup">
              <label htmlFor="lastName" className="label">Last Name</label>
              <input
                className="input"
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="inputGroup">
            <label htmlFor="address" className="label">Address</label>
            <textarea
              className="input textarea"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              rows={2}
            />
          </div>

          <div className="row">
            <div className="col inputGroup">
              <label htmlFor="contactNo" className="label">Contact No</label>
              <input
                className="input"
                type="tel"
                id="contactNo"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                placeholder="Phone number"
              />
            </div>

            <div className="col inputGroup">
              <label htmlFor="emailId" className="label">Email</label>
              <input
                className="input"
                type="email"
                id="emailId"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col inputGroup">
              <label htmlFor="password" className="label">Password</label>
              <input
                className="input"
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>

            {/* <div className="col inputGroup">
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <input
                className="input"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
            </div> */}
          </div>

          <button type="submit" className="button" disabled={isLoading}>
            {isLoading ? "Creating..." : "Register"}
          </button>

          {successMessage && <p className="success">{successMessage}</p>}
          {errorMessage && <p className="error">{errorMessage}</p>}
        </form>

        <p className="reg">Already have an account? <Link to="/login" className="reg">Log in</Link></p>
      </div>
    </div>
  );
};

export default Register;