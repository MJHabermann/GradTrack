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
            <li><a href="#">Milestones</a></li>
            <li><a href="#">Deadlines</a></li>
            <li><a href="#">Evaluations</a></li>
            <li><a href="#">Reminders</a></li>
            <li><Link to="/courses">Courses</Link></li>
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
