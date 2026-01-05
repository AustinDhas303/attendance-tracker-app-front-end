import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import 'bootstrap-icons/font/bootstrap-icons.css';


const Sidebar = ({ onLogout, role }) => {

  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    else {
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <nav className="sidebar">
      <ul>
        <li>
          <Link to="/dashboard" className="nav-link">
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </Link>
        </li>

        {role && role.toUpperCase() === "TEACHER" && (
          <>
            <li>
              <Link to="/attendance" className="nav-link">
                <i className="bi bi-people-fill"></i>
                <span>Attendance</span>
              </Link>
            </li>
          </>)}

        {role && role.toUpperCase() === "ADMIN" && (
          <>
            <li>
              <Link to="/user" className="nav-link">
                <i className="bi bi-people-fill"></i>
                <span>User</span>
              </Link>
            </li>
            <li>
              <Link to="/student" className="nav-link">
                <i className="bi bi-calendar-check"></i>
                <span>Student</span>
              </Link>
            </li>
          </>
        )}

        <li>
          <Link to="/reports" className="nav-link">
            <i className="bi bi-bar-chart"></i>
            <span>Reports</span>
          </Link>
        </li>
        <li>
          <button onClick={handleLogout} className="logout">
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </nav>


    // <nav className="bg-slate-900 text-white px-6 py-3 flex justify-between">
    //   <h1>Attendance App</h1>

    //   <div className="space-x-4">
    //     <Link to="/dashboard">Dashboard</Link>

    //     {role === "TEACHER" && (
    //       <Link to="/attendance">Attendance</Link>
    //     )}

    //     {role === "ADMIN" && (
    //       <>
    //         <Link to="/reports">Reports</Link>
    //         <Link to="/users">Manage Users</Link>
    //       </>
    //     )}

    //     <button onClick={onLogout}>Logout</button>
    //   </div>
    // </nav>
  );
}

export default Sidebar;
