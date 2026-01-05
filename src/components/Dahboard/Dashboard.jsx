import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import api from "../utils/api";

const PieChart = ({ data = {}, size = 160, thickness = 24, colors = [] }) => {
  const entries = Object.entries(data);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  const colorPalette = colors.length ? colors : ["#4CAF50", "#FF9800", "#2196F3", "#E91E63", "#9C27B0", "#FFC107"];

  return (
    <div className="pie-chart" style={{ width: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}> 
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          {entries.map(([label, value], idx) => {
            const portion = value / total;
            const dash = portion * circumference;
            const strokeDasharray = `${dash} ${circumference - dash}`;
            const strokeDashoffset = -offset;
            offset += dash;
            const stroke = colorPalette[idx % colorPalette.length];

            return (
              <circle
                key={label}
                r={radius}
                cx={0}
                cy={0}
                fill="transparent"
                stroke={stroke}
                strokeWidth={thickness}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.6s, stroke-dasharray 0.6s" }}
                transform={`rotate(-90)`}
              />
            );
          })}
        </g>
      </svg>

      <ul className="pie-legend">
        {entries.map(([label, value], idx) => (
          <li key={label}>
            <span className="legend-swatch" style={{ background: colorPalette[idx % colorPalette.length] }} />
            <span className="legend-label">{label}</span>
            <span className="legend-value">{((value / total) * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const StatCard = ({ title, value, subtitle }) => (
  <div className="stat-card">
    <div className="stat-title">{title}</div>
    <div className="stat-value">{value}</div>
    {subtitle && <div className="stat-sub">{subtitle}</div>}
  </div>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState([]);

  // const sample = {
  //   cards: {
  //     totalStudents: 5,
  //     totalTeachers: 1,
  //     todayAttendancePercentage: 100.0,
  //     studentsBelow75: 2,
  //   },
  //   departmentAttendance: {
  //     Zoology: 100.0,
  //     Science: 100.0,
  //   },
  //   todaySummary: {
  //     presentCount: 4,
  //     absentCount: 0,
  //   },
  // };

  useEffect(() => {
    const getDashboard = async () => {
      try {
        const response = await api.get(`/api/v1/dashboard/fetch`);
        setDashboardData(response.data);
      } catch (err) {
        console.error("Unable to fetch dashboard data", err);
        setDashboardData(response.data);
      }
    };

    getDashboard();
  }, []);

  const data = dashboardData || sample;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-heading">Overview</h2>

      <div className="cards-grid">
        <StatCard title="Students" value={data.cards?.totalStudents} subtitle="Total students" />
        <StatCard title="Teachers" value={data.cards?.totalTeachers} subtitle="Total teachers" />
        <StatCard title="Attendance" value={`${data.cards?.todayAttendancePercentage}%`} subtitle="Today" />
        <StatCard title="Below 75%" value={data.cards?.studentsBelow75} subtitle="Students" />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Department Attendance</h3>
          <PieChart data={data?.departmentAttendance} size={220} thickness={36} />
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Today Summary</h3>
          <PieChart data={data?.todaySummary} size={220} thickness={36} colors={["#4CAF50", "#F44336"]} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;