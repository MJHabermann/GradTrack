import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useContext(UserContext);

  // Determine dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user || !user.role) return '/dashboard'; // Default to student dashboard
    
    switch (user.role) {
      case 'student':
        return '/dashboard';
      case 'faculty':
        return '/faculty-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-logo">
          <span className="logo-text">GradTrack</span>
        </div>

        {isOpen && (
          <ul className="nav-links">
            <li><Link to={getDashboardRoute()}>Dashboard</Link></li>
            {/* <li><a href="#">Milestones</a></li>
            <li><Link to="/">Dashboard</Link></li>
           { /* <li><a href="#">Milestones</a></li>
            <li><a href="#">Deadlines</a></li>
            <li><a href="#">Evaluations</a></li> */}
            <li><Link to="/reminders">Reminders</Link></li>
            <li><Link to="/documents">Documents</Link></li>
            <li><Link to="/course-planner">Course Planner</Link></li>
            <li><Link to="/courses">Course Adder</Link></li>

            
          </ul>
        )}
      </div>

      <button
        className={`sidebar-toggle ${isOpen ? 'toggle-open' : 'toggle-collapsed'}`}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isOpen ? '←' : '→'}
      </button>
    </>
  );
};

export default Sidebar;
