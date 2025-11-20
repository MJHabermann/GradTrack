import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-logo">
          <span className="logo-text">GradTrack</span>
        </div>

        {isOpen && (
          <ul className="nav-links">
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
